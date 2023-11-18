const dc = require('../functions/data_collector');
const ut = require('../functions/utilities');

exports.Handler = (req, res, db, url_query) =>
{
    switch(req.method)
    {
        case 'GET':
        {
            let email = ut.find_session(req);
            console.log(`email: ${email}`)

            if(email == '')
            {
                res.writeHead(403, {'Content-Type': 'text/html'});
                res.write('No autorizado');
                return res.end();
            }

            let query = `
                SELECT
                    c.nombre AS criptomoneda
                    ,c.imagen AS criptomoneda_imagen
                    ,b.saldo AS saldo
                    ,u.correo AS correo
                    ,b.fecha_actualizacion AS fecha_actualizacion
                FROM siswebp2p.billeteras b
                JOIN siswebp2p.criptomonedas c ON c.id = b.id_criptomoneda
                JOIN siswebp2p.usuarios u ON u.id = b.id_usuario
                WHERE
                    u.correo = ?
            `;

            db.pool_conn
            .query(query, [email])
            .then(results =>
            {
                for(let row of results)
                {
                    row.criptomoneda_imagen = Buffer.from(row.criptomoneda_imagen).toString('base64');
                }

                console.log(results)
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