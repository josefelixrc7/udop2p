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
                    IF(oa.id_orden_tipo = 1
                        ,(SELECT descripcion FROM siswebp2p.usuarios_metodos_pago WHERE id_usuario = oa.id_usuario_creador AND id_metodo_pago = oa.id_metodo_pago)
                        ,(SELECT descripcion FROM siswebp2p.usuarios_metodos_pago WHERE id_usuario = one.id_usuario_negoceador AND id_metodo_pago = oa.id_metodo_pago)
                    ) AS descripcion
                    ,mfp.precio * one.monto_negoceado AS cantidad_pagar_fiat
                FROM siswebp2p.ordenes_negociaciones one
                JOIN siswebp2p.ordenes_anuncios oa ON oa.id = one.id_orden_anuncio
                JOIN siswebp2p.monedas_fiat_precio mfp ON mfp.id_orden_anuncio = oa.id
                WHERE
                    one.id = ?;
            `;

            db.pool_conn
            .query(query, [url_query.id_orden_negociacion])
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