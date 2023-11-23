const dc = require('../functions/data_collector');
const ut = require('../functions/utilities');

exports.Handler = (req, res, db, url_query) =>
{
    switch(req.method)
    {
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
            if(url_query.id_announcement != undefined)
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
                    JOIN siswebp2p.monedas_fiat_precio mfp ON mfp.id_orden_anuncio = oa.id
                    JOIN siswebp2p.monedas_fiat mf ON mf.id = mfp.id_moneda_fiat
                    JOIN siswebp2p.metodos_pago mp ON mp.id = oa.id_metodo_pago
                    JOIN siswebp2p.criptomonedas c ON c.id = oa.id_criptomoneda
                    LEFT JOIN siswebp2p.billeteras b ON b.id_criptomoneda = c.id AND b.id_usuario = (SELECT id FROM siswebp2p.usuarios WHERE correo = ?)
                    WHERE
                        oa.id = ?
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
                                (SELECT
                                    u2.id
                                FROM siswebp2p.usuarios u2
                                JOIN siswebp2p.usuarios_metodos_pago ump2 ON ump2.id_usuario = u2.id
                                WHERE
                                    u2.correo = ?
                                    AND ump2.id_metodo_pago = mp.id)
                                IS NOT NULL, 1, 0
                             )
                        ) AS usuario_posee_metodo
                    FROM siswebp2p.ordenes_anuncios oa
                    JOIN siswebp2p.usuarios u ON u.id = oa.id_usuario_creador
                    JOIN siswebp2p.monedas_fiat_precio mfp ON mfp.id_orden_anuncio = oa.id
                    JOIN siswebp2p.monedas_fiat mf ON mf.id = mfp.id_moneda_fiat
                    JOIN siswebp2p.metodos_pago mp ON mp.id = oa.id_metodo_pago
                    JOIN siswebp2p.criptomonedas c ON c.id = oa.id_criptomoneda
                    WHERE
                        c.id = ?
                        AND mf.id = ?
                        AND oa.id_orden_tipo = ?
                        AND u.correo != ?
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
        default:
        {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('Without content');
            return res.end();
            break;
        }
    }
}