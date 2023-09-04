const dc = require('../functions/data_collector');

exports.Handler = (req, res, db, url_query) =>
{
    switch(req.method)
    {
        case 'POST':
        {
            dc.DataCollector(req, result =>
            {
                let query = `SELECT COUNT(1) AS 'rows' FROM tests.products WHERE name = "${result.name}"`;

                db.pool_conn
                .query(query)
                .then(results_pre =>
                {
                    if(results_pre[0].rows > 1)
                    {
                        res.writeHead(502, {'Content-Type': 'application/json'});
                        res.write(JSON.stringify({error: 'The product exists'}));
                        return res.end();
                    }

                    query = 
                    `
                        INSERT INTO tests.products (name, description)
                        VALUES
                            ('${result['name']}', '${result['description']}')
                    `;
                    
                    db.pool_conn.query(query)
                    .then(results =>
                    {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.write(JSON.stringify({affectedRows: results.affectedRows}));
                        return res.end();
                    });
                })
                .catch(err =>
                {
                    res.writeHead(502, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify({error: err}));
                    return res.end();
                });
            });
            break;
        }
        case 'GET':
        {
            let query = '';
            if(url_query.id == undefined)
            {
                query = `
                    SELECT
                        *
                    FROM tests.products
                    WHERE
                        CAST(reg_date AS DATE) BETWEEN '${url_query.from}' AND '${url_query.to}'
                `;
            }
            else
            {
                query = `
                    SELECT
                        id, name, description
                    FROM tests.products
                    WHERE
                        id = '${url_query.id}'
                `;
            }

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
        case 'PUT':
        {
            dc.DataCollector(req, result =>
            {
                let query = `
                    UPDATE tests.products
                    SET
                        name = '${result.name}'
                        ,description = '${result.description}'
                    WHERE
                        id = ${result.id}
                `;

                db.pool_conn
                .query(query)
                .then(results =>
                {
                    console.log(results)
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
            });

            break;
        }
        case 'DELETE':
        {
            dc.DataCollector(req, result =>
            {
                let query = `
                    DELETE FROM tests.products
                    WHERE
                        id = ${result.id}
                `;

                db.pool_conn
                .query(query)
                .then(results =>
                {
                    console.log(results)
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