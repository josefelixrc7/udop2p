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

            let query = `
                SELECT
                    oa.id AS orden_id
                    ,u.nombre_completo AS usuario_nombre
                    ,IFNULL((SELECT AVG(puntaje) FROM siswebp2p.ordenes_negociaciones_puntaje WHERE id_usuario = oa.id_usuario_creador), 0) AS reputacion
                    ,CONCAT(ROUND(mfp.precio, 2), ' ', mf.nombre) AS precio
                    ,CONCAT(ROUND(oa.monto_disponible, 2), ' ', c.nombre) AS disponible
                    ,mp.nombre AS metodo_pago
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
                ;
            `;

            db.pool_conn
            .query(query, [url_query.crypto, url_query.fiat, url_query.type_orden_id])
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