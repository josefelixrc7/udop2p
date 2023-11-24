const dc = require('../functions/data_collector');
const ut = require('../functions/utilities');

exports.Handler = (req, res, db, url_query) =>
{
    switch(req.method)
    {
        case 'POST':
        {
            dc.DataCollector(req, async function(result)
            {
                let email = ut.find_session(req);
    
                if(email == '')
                {
                    res.writeHead(403, {'Content-Type': 'text/html'});
                    res.write('No autorizado');
                    return res.end();
                }
    
                if(result.an_tipo_orden == 1)
                {
                    // Verify: Sufficient balance
                        let query = `
                            SELECT
                                b.saldo AS saldo
                            FROM siswebp2p.billeteras b
                            JOIN siswebp2p.usuarios u ON u.id = b.id_usuario
                            WHERE
                                u.correo = ?
                                AND b.id_criptomoneda = ?
                        `;
                        const res_query = await db.pool_conn.query
                        (
                            query
                            ,[email, result.an_criptomoneda]
                        );
                        if(res_query.length < 1)
                        {
                            res.writeHead(502, {'Content-Type': 'application/json'});
                            res.write(JSON.stringify({error: 'Su saldo es insuficiente en esta criptomoneda.'}));
                            return res.end();
                        }
                        if(res_query[0].saldo < result.an_monto)
                        {
                            res.writeHead(502, {'Content-Type': 'application/json'});
                            res.write(JSON.stringify({error: 'Su saldo es insuficiente en esta criptomoneda.'}));
                            return res.end();
                        }
    
                    // Update balance
                        query = `
                            UPDATE siswebp2p.billeteras b
                            JOIN siswebp2p.usuarios u ON u.id = b.id_usuario
                            SET
                                b.saldo = b.saldo - ?
                            WHERE
                                u.correo = ?
                                AND b.id_criptomoneda = ?
                        `;
                        await db.pool_conn.query
                        (
                            query
                            ,[result.an_monto, email, result.an_criptomoneda]
                        );
    
                }
                // Create announcement
                    query = `
                        INSERT INTO siswebp2p.ordenes_anuncios (monto_disponible, monto_inicial, id_usuario_creador, id_orden_tipo, id_metodo_pago, id_criptomoneda)
                        SELECT ?, ?, u.id, ?, ?, ?
                        FROM siswebp2p.usuarios u
                        WHERE u.correo = ?
                    `;
                    let res_query2 = await db.pool_conn.query
                    (
                        query
                        ,[
                            result.an_monto
                            ,result.an_monto
                            ,result.an_tipo_orden
                            ,result.an_metodo_pago
                            ,result.an_criptomoneda
                            ,email
                        ]
                    );
                    
                // Add price
                    query = `
                        INSERT INTO siswebp2p.monedas_fiat_precio (precio, id_orden_anuncio, id_moneda_fiat)
                        VALUES (?, ?, ?)
                    `;
        
                    db.pool_conn
                    .query(query, [result.an_precio, res_query2.insertId, result.an_fiat])
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
        case 'GET':
        {
            let email = ut.find_session(req);

            if(email == '')
            {
                res.writeHead(403, {'Content-Type': 'text/html'});
                res.write('No autorizado');
                return res.end();
            }

            let query = '';
            let parameters = [];
            if(url_query.panel == 1)
            {
                query = `
                    SELECT
                        oa.id AS id_orden
                        ,ot.tipo AS tipo_orden
                        ,oa.monto_inicial AS monto_inicial
                        ,oa.monto_disponible AS monto_disponible
                        ,COUNT(one.id) AS negociaciones
                        ,oa.fecha_registro AS fecha_registro
                        ,oa.estado AS estado_orden
                        ,oa.id_criptomoneda AS id_criptomoneda
                    FROM siswebp2p.ordenes_anuncios oa
                    JOIN siswebp2p.usuarios u ON u.id = oa.id_usuario_creador
                    JOIN siswebp2p.ordenes_tipos ot ON ot.id = oa.id_orden_tipo
                    LEFT JOIN siswebp2p.ordenes_negociaciones one ON one.id_orden_anuncio = oa.id
                    WHERE
                        u.correo = ?
                    GROUP BY oa.id
                `;
                parameters = [email];
            }
            else if(url_query.id_announcement != undefined)
            {
                query = `
                    SELECT
                        oa.id AS orden_id
                        ,mfp.id AS monedas_fiat_precio_id
                        ,u.nombre_completo AS usuario_nombre
                        ,IFNULL((SELECT AVG(puntaje) FROM siswebp2p.usuarios_puntaje WHERE id_usuario = oa.id_usuario_creador), 0) AS reputacion
                        ,CONCAT(ROUND(mfp.precio, 2), ' ', mf.nombre) AS precio
                        ,ROUND(mfp.precio, 2) AS precio_real
                        ,mf.nombre AS fiat_nombre
                        ,c.nombre AS criptomoneda_nombre
                        ,CONCAT(ROUND(oa.monto_disponible, 2), ' ', c.nombre) AS disponible
                        ,ROUND(oa.monto_disponible, 2) AS disponible_real
                        ,mp.nombre AS metodo_pago
                        ,IFNULL(b.saldo, 0) AS saldo
                    FROM siswebp2p.ordenes_anuncios oa
                    JOIN siswebp2p.usuarios u ON u.id = oa.id_usuario_creador
                    JOIN
                    (
                        SELECT 
                            id
                            ,precio
                            ,fecha_registro
                            ,id_orden_anuncio
                            ,id_moneda_fiat
                            ,ROW_NUMBER() OVER (PARTITION BY id_orden_anuncio ORDER BY fecha_registro DESC) AS row
                        FROM siswebp2p.monedas_fiat_precio
                    )  mfp ON mfp.id_orden_anuncio = oa.id
                    JOIN siswebp2p.monedas_fiat mf ON mf.id = mfp.id_moneda_fiat
                    JOIN siswebp2p.metodos_pago mp ON mp.id = oa.id_metodo_pago
                    JOIN siswebp2p.criptomonedas c ON c.id = oa.id_criptomoneda
                    LEFT JOIN siswebp2p.billeteras b ON b.id_criptomoneda = c.id AND b.id_usuario = (SELECT id FROM siswebp2p.usuarios WHERE correo = ?)
                    WHERE
                        oa.id = ?
                        AND mfp.row = 1
                        AND oa.estado = 'activo'
                `;
                parameters = [email, url_query.id_announcement];
            }
            else
            {
                query = `
                    SELECT
                        oa.id AS orden_id
                        ,u.nombre_completo AS usuario_nombre
                        ,IFNULL((SELECT AVG(puntaje) FROM siswebp2p.usuarios_puntaje WHERE id_usuario = oa.id_usuario_creador), 0) AS reputacion
                        ,CONCAT(ROUND(mfp.precio, 2), ' ', mf.nombre) AS precio
                        ,CONCAT(ROUND(oa.monto_disponible, 2), ' ', c.nombre) AS disponible
                        ,mp.nombre AS metodo_pago
                        ,(IF
                            (
                                (
                                    SELECT u2.id
                                    FROM siswebp2p.usuarios u2
                                    JOIN siswebp2p.usuarios_metodos_pago ump2 ON ump2.id_usuario = u2.id
                                    WHERE u2.correo = ? AND ump2.id_metodo_pago = mp.id
                                ) IS NOT NULL, 1, 0
                            )
                        ) AS usuario_posee_metodo
                    FROM siswebp2p.ordenes_anuncios oa
                    JOIN siswebp2p.usuarios u ON u.id = oa.id_usuario_creador
                    JOIN
                    (
                        SELECT 
                            id
                            ,precio
                            ,fecha_registro
                            ,id_orden_anuncio
                            ,id_moneda_fiat
                            ,ROW_NUMBER() OVER (PARTITION BY id_orden_anuncio ORDER BY fecha_registro DESC) AS row
                        FROM siswebp2p.monedas_fiat_precio
                    ) mfp ON mfp.id_orden_anuncio = oa.id
                    JOIN siswebp2p.monedas_fiat mf ON mf.id = mfp.id_moneda_fiat
                    JOIN siswebp2p.metodos_pago mp ON mp.id = oa.id_metodo_pago
                    JOIN siswebp2p.criptomonedas c ON c.id = oa.id_criptomoneda
                    WHERE
                        c.id = ?
                        AND mf.id = ?
                        AND oa.id_orden_tipo = ?
                        AND u.correo != ?
                        AND mfp.row = 1
                        AND oa.estado = 'activo'
                `;
                parameters = [email, url_query.crypto, url_query.fiat, url_query.type_orden_id, email];
            }

            db.pool_conn
            .query(query, parameters)
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
            dc.DataCollector(req, async function(result)
            {
                let email = ut.find_session(req);
    
                if(email == '')
                {
                    res.writeHead(403, {'Content-Type': 'text/html'});
                    res.write('No autorizado');
                    return res.end();
                }
    
                // Verify trades
                    query = `
                        SELECT id
                        FROM siswebp2p.ordenes_negociaciones one
                        WHERE
                            one.id_orden_anuncio = ?
                            AND one.estado != 'Finalizado'
                    `;
                    let res_query2 = await db.pool_conn.query
                    (
                        query
                        ,[result.id_orden]
                    );

                    if(res_query2.length > 0)
                    {
                        res.writeHead(502, {'Content-Type': 'application/json'});
                        res.write(JSON.stringify({error: 'Esta orden de anuncio todavia tiene comercios (negociaciones) sin finalizar.'}));
                        return res.end();
                    }
                    
                // Return money
                    query = `
                        UPDATE siswebp2p.billeteras b
                        JOIN siswebp2p.usuarios u ON u.id = b.id_usuario
                        JOIN siswebp2p.ordenes_anuncios oa ON oa.id_usuario_creador = u.id
                        SET
                            b.saldo = b.saldo + oa.monto_disponible
                        WHERE
                            u.correo = ?
                            AND b.id_criptomoneda = oa.id_criptomoneda
                            AND oa.id = ?
                    `;
                    await db.pool_conn.query
                    (
                        query
                        ,[email, result.id_orden]
                    );

                // Change state
                    query = `
                        UPDATE siswebp2p.ordenes_anuncios
                        SET
                            estado = 'inactivo'
                        WHERE
                            id = ?
                    `;
        
                    db.pool_conn
                    .query(query, [result.id_orden])
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