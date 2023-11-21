const dc = require('../functions/data_collector');
const ut = require('../functions/utilities');

exports.Handler = (req, res, db, url_query) =>
{
    switch(req.method)
    {
        case 'POST':
        {
            dc.DataCollector(req, result =>
            {
                let email = ut.find_session(req);
    
                if(email == '')
                {
                    res.writeHead(403, {'Content-Type': 'text/html'});
                    res.write('No autorizado');
                    return res.end();
                }
    
                // Subtract assets from announcement 
                    async function subtract_assets_announcement()
                    {
                        let query = `
                            UPDATE siswebp2p.ordenes_anuncios
                            SET
                                monto_disponible = monto_disponible - ?
                            WHERE
                                id = ?
                        `;
                        await db.pool_conn.query
                        (
                            query
                            ,[result.field_cantidad_comerciar, result.field_id_orden_anuncio]
                        );
                    }
                    subtract_assets_announcement();

                // Subtract assets from wallets 
                    async function subtract_assets_wallet()
                    {
                        let query = `
                            UPDATE siswebp2p.billeteras b
                            JOIN siswebp2p.usuarios u ON u.id = b.id_usuario
                            SET
                                saldo = saldo - ?
                            WHERE
                                u.correo = ?
                                AND id_criptomoneda = (SELECT id_criptomoneda FROM siswebp2p.ordenes_anuncios WHERE id = ?)
                        `;
                        await db.pool_conn.query
                        (
                            query
                            ,[result.field_cantidad_comerciar, email, result.field_id_orden_anuncio]
                        );
                    }
                    if(result.type_orden_id == 2)
                        subtract_assets_wallet();

                // Create trade 
                    async function create_trade()
                    {
                        let query = `
                            INSERT INTO siswebp2p.ordenes_negociaciones
                                (monto_negoceado, id_usuario_negoceador, id_orden_anuncio, id_monedas_fiat_precio)
                            SELECT
                                ?
                                ,u.id
                                ,?
                                ,?
                            FROM siswebp2p.usuarios u
                            WHERE
                                u.correo = ?
                        `;
                        const result_query = await db.pool_conn.query
                        (
                            query
                            ,[
                                result.field_cantidad_comerciar
                                ,result.field_id_orden_anuncio
                                ,result.field_id_monedas_fiat_precio
                                ,email
                            ]
                        );

                        // Get trade
                            query = `
                                SELECT
                                    *
                                FROM siswebp2p.ordenes_negociaciones
                                WHERE
                                    id = ?
                            `;
                
                            db.pool_conn
                            .query(query, [result_query.insertId])
                            .then(results =>
                            {
                                delete results.meta;
                                res.writeHead(200, {'Content-Type': 'application/json'});
                                res.write(JSON.stringify(results));
                                return res.end();
                            })
                            .catch(err =>
                            {
                                res.writeHead(502, {'Content-Type': 'text/html'});
                                res.write("Error: " + err);
                                return res.end();
                            });
                    }
                    create_trade();
            });
            break;
        }
        case 'GET':
        {
            let email = ut.find_session(req);

            if(email == '')
            {
                res.writeHead(403, {'Content-Type': 'text/html'});
                res.write('No autorizado');
                return res.end();
            }

            let query = `
                SELECT
                    one.id AS orden_negociacion_id
                    ,one.estado AS orden_estado
                    ,ot.tipo AS orden_tipo
                    ,ot.id AS orden_tipo_id
                    ,one.monto_negoceado AS monto_negoceado
                    ,o.nombre AS criptomoneda_nombre
                    ,mf.nombre AS moneda_fiat_nombre
                    ,mfp.precio AS moneda_fiat_precio
                    ,one.fecha_registro AS fecha_registro
                    ,u.correo AS usuario_creador
                    ,u2.correo AS usuario_negoceador
                    ,? AS usuario_logueado
                    ,one.codigo_comprobacion AS codigo_comprobacion
                FROM siswebp2p.ordenes_negociaciones one
                JOIN siswebp2p.ordenes_anuncios oa ON oa.id = one.id_orden_anuncio
                JOIN siswebp2p.ordenes_tipos ot ON ot.id = oa.id_orden_tipo
                JOIN siswebp2p.criptomonedas o ON o.id = oa.id_criptomoneda
                JOIN siswebp2p.monedas_fiat_precio mfp ON mfp.id_orden_anuncio = oa.id
                JOIN siswebp2p.monedas_fiat mf ON mf.id = mfp.id_moneda_fiat
                JOIN siswebp2p.usuarios u ON u.id = oa.id_usuario_creador
                JOIN siswebp2p.usuarios u2 ON u2.id = one.id_usuario_negoceador
                WHERE
                    (u2.correo = ?
                    OR u.correo = ?)
                    ${url_query.orden_negociacion_id != undefined? 'AND one.id = ' + url_query.orden_negociacion_id : ''}
                ORDER BY one.fecha_registro DESC
            `;

            db.pool_conn
            .query(query, [email, email, email])
            .then(results =>
            {
                delete results.meta;
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(results));
                return res.end();
            })
            .catch(err =>
            {
                res.writeHead(502, {'Content-Type': 'text/html'});
                res.write("Error: " + err);
                return res.end();
            });
            break;
        }
        case 'PUT':
        {
            dc.DataCollector(req, result =>
            {
                let email = ut.find_session(req);
    
                if(email == '')
                {
                    res.writeHead(403, {'Content-Type': 'text/html'});
                    res.write('No autorizado');
                    return res.end();
                }
    
                let query = '';
                let params = [];
                if(result.trade_type == 'subir_pago')
                {
                    query = `
                        UPDATE siswebp2p.ordenes_negociaciones
                        SET
                            codigo_comprobacion = ?
                            ,estado = 'Esperando verificacion del vendedor'
                        WHERE
                            id = ?
                    `;
                    params = [result.field_comprobante_subir, result.ordenes_negociacion_id];
                }
                else if(result.trade_type == 'verificar_pago')
                {
                        async function steps_pay()
                        {
                            // View usuario_pago
                                let query = `
                                    SELECT
                                        IF(oa.id_orden_tipo = 1, one.id_usuario_negoceador, oa.id_usuario_creador) AS usuario_pago
                                        ,oa.id_criptomoneda AS id_criptomoneda
                                    FROM siswebp2p.ordenes_negociaciones one
                                    JOIN siswebp2p.ordenes_anuncios oa ON oa.id = one.id_orden_anuncio
                                    WHERE
                                        one.id = ?
                                `;
                                let res = await db.pool_conn.query
                                (
                                    query
                                    ,[result.ordenes_negociacion_id]
                                );
                                let usuario_pago = res[0].usuario_pago;
                                let id_criptomoneda = res[0].id_criptomoneda;

                            // Create wallet
                                query = `
                                    INSERT INTO siswebp2p.billeteras (id_criptomoneda, id_usuario, saldo)
                                    SELECT
                                        oa.id_criptomoneda
                                        ,?
                                        ,0
                                    FROM siswebp2p.ordenes_negociaciones one
                                    JOIN siswebp2p.ordenes_anuncios oa ON oa.id = one.id_orden_anuncio
                                    LEFT JOIN siswebp2p.billeteras b ON b.id_criptomoneda = oa.id_criptomoneda AND b.id_usuario = ?
                                    WHERE
                                        one.id = ?
                                        AND b.id_criptomoneda IS NULL
                                `;
                                await db.pool_conn.query
                                (
                                    query
                                    ,[usuario_pago, usuario_pago, result.ordenes_negociacion_id]
                                );

                            // Send crypto
                                query = `
                                    UPDATE siswebp2p.billeteras
                                        SET saldo = saldo + (SELECT monto_negoceado FROM siswebp2p.ordenes_negociaciones WHERE id = ?)
                                    WHERE
                                        id_usuario = ?
                                        AND id_criptomoneda = ?
                                `;
                                await db.pool_conn.query
                                (
                                    query
                                    ,[result.ordenes_negociacion_id, usuario_pago, id_criptomoneda]
                                );

                        }
                        steps_pay();
    
                    query = `
                        UPDATE siswebp2p.ordenes_negociaciones
                        SET
                            estado = 'Finalizado'
                        WHERE
                            id = ?
                    `;
                    params = [result.ordenes_negociacion_id];
                }
    
                db.pool_conn
                .query(query, params)
                .then(results =>
                {
                    delete results.meta;
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify(results));
                    return res.end();
                })
                .catch(err =>
                {
                    res.writeHead(502, {'Content-Type': 'text/html'});
                    res.write("Error: " + err);
                    return res.end();
                });
            });
            break;
        }
        default:
        {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('Without content');
            return res.end();
            break;
        }
    }
}