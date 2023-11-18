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
                    c.id as criptomoneda_id
                    ,c.nombre AS criptomoneda_nombre
                    ,c.imagen AS criptomoneda_imagen
                    ,cp.precio AS criptomoneda_precio
                FROM siswebp2p.criptomonedas c
                JOIN siswebp2p.criptomonedas_precios cp ON cp.id_criptomoneda = c.id
            `;

            db.pool_conn
            .query(query)
            .then(results =>
            {
                for(let row of results)
                {
                    row.criptomoneda_imagen = Buffer.from(row.criptomoneda_imagen).toString('base64');
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