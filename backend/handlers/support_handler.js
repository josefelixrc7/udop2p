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
                    t.id AS id
                    ,t.titulo AS titulo
                    ,t.estado AS estado
                    ,t.contenido AS contenido
                    ,u.correo AS usuario1
                    ,u2.correo AS usuario2
                FROM siswebp2p.tickets t
                LEFT JOIN siswebp2p.usuarios u ON u.id = t.id_usuario1
                LEFT JOIN siswebp2p.usuarios u2 ON u2.id = t.id_usuario2
                WHERE
                    u.correo = ? OR u2.correo = ?
                ;
            `;

            db.pool_conn
            .query(query, [email, email])
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