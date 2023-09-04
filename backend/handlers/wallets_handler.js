const dc = require('../functions/data_collector');

exports.Handler = (req, res, db, url_query) =>
{
    switch(req.method)
    {
        case 'GET':
        {
            let query = `
                SELECT
                    c.image AS image
                    ,c.name AS name
                    ,w.available AS available
                FROM siswebp2p.wallets w
                JOIN siswebp2p.cryptocurrencies c ON c.id = w.id_cryptocurrency
                JOIN siswebp2p.users u ON u.id = w.id_user
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
                res.write("Error 1: " + err);
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