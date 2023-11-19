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
        
                    db.pool_conn
                    .query(query, 
                        [
                            result.field_cantidad_comerciar
                            ,result.field_id_orden_anuncio
                            ,result.field_id_monedas_fiat_precio
                            ,email
                        ]
                    )
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