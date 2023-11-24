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
                    u.nombre_completo AS nombre_completo
                    ,(SELECT descripcion FROM siswebp2p.usuarios_metodos_pago WHERE id_usuario = u.id AND id_metodo_pago = 1) AS pago_movil
                    ,(SELECT descripcion FROM siswebp2p.usuarios_metodos_pago WHERE id_usuario = u.id AND id_metodo_pago = 2) AS transferencia
                FROM siswebp2p.usuarios u
                WHERE
                    u.correo = ?
            `;

            db.pool_conn
            .query(query, [email])
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
                let parameters = [];
    
                if(url_query.tipo == 'perfil')
                {
                    query = `
                        UPDATE siswebp2p.usuarios
                        SET
                            nombre_completo = ?
                        WHERE
                            correo = ?
                    `;
                    parameters = [result.nombre_completo, email];
                }
                else if(url_query.tipo == 'clave')
                {
                    query = `
                        UPDATE siswebp2p.usuarios
                        SET
                            clave = ?
                        WHERE
                            correo = ?
                            AND clave = ?
                    `;
                    parameters = [result.clave_nueva, email, result.clave_actual];
                }
                else if(url_query.tipo == 'metodo_pago')
                {
                    query = `
                        UPDATE siswebp2p.usuarios_metodos_pago ump
                        JOIN siswebp2p.usuarios_metodos_pago ump2 ON ump2.id_usuario = ump.id_usuario
                        JOIN siswebp2p.usuarios u ON u.id = ump.id_usuario
                        SET
                            ump.descripcion = ?
                            ,ump2.descripcion = ?
                        WHERE
                            u.correo = ?
                            AND ump.id_metodo_pago = 1
                            AND ump2.id_metodo_pago = 2
                    `;
                    parameters = [result.pago_movil, result.transferencia, email];
                }
    
                db.pool_conn
                .query(query, parameters)
                .then(results =>
                {
                    if(results.affectedRows < 1)
                    {
                        res.writeHead(502, {'Content-Type': 'application/json'});
                        res.write(JSON.stringify({error: "La contrase&ntilde;a actual no coincide."}));
                        return res.end();
                    }

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