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
                let query = `
                    SELECT id
                    FROM siswebp2p.usuarios
                    WHERE
                        correo = ?
                        OR cedula = ?
                `;
                const res_query = await db.pool_conn.query
                (
                    query
                    ,[result.correo, result.cedula]
                );
                if(res_query.length > 0)
                {
                    res.writeHead(400, {'Content-Type': 'text/html'});
                    res.write('Cliente ya registrado.');
                    return res.end();
                }

                query = `
                    INSERT INTO siswebp2p.usuarios (clave, correo, cedula, nombre_completo)
                    VALUES (?, ?, ?, ?)
                `;
    
                db.pool_conn
                .query(query, [result.contrasena, result.correo, result.cedula, result.nombre_completo])
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