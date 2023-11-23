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
                    id
                    ,correo
                    ,rol
                    ,estado
                    ,cedula
                    ,nombre_completo
                    ,fecha_registro
                FROM siswebp2p.usuarios u
            `;

            db.pool_conn
            .query(query)
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
    
                query = `
                    UPDATE siswebp2p.usuarios
                    SET
                        estado = ?
                    WHERE
                        id = ?
                `;
    
                db.pool_conn
                .query(query, [result.estado, result.id_usuario])
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