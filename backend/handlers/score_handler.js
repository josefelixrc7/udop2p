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
    
                query = `
                    INSERT INTO siswebp2p.usuarios_puntaje (id_usuario, puntaje)
                    SELECT
                        IF(u.correo = ?, u2.id, u.id)
                        ,?
                    FROM siswebp2p.ordenes_negociaciones one
                    JOIN siswebp2p.ordenes_anuncios oa ON oa.id = one.id_orden_anuncio
                    JOIN siswebp2p.usuarios u ON u.id = one.id_usuario_negoceador
                    JOIN siswebp2p.usuarios u2 ON u2.id = oa.id_usuario_creador
                    WHERE
                        one.id = ?
                `;
    
                db.pool_conn
                .query(query, [email, result.select_valoracion, result.orden_negociacion_id])
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