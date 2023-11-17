const dc = require('../functions/data_collector');

exports.Handler = (req, res, db, url_query) =>
{
    switch(req.method)
    {
        case 'POST':
        {
            dc.DataCollector(req, result =>
            {
                let query = `
                    SELECT correo
                    FROM siswebp2p.usuarios u
                    WHERE u.correo = ? AND u.clave = ?
                `;
    
                db.pool_conn
                .query(query, [result.email, result.password])
                .then(results =>
                {
                    if(results.length == 0)
                    {
                        res.writeHead(403, {'Content-Type': 'text/html'});
                        res.write('No autorizado');
                        return res.end();
                    }

                    res.setHeader('Set-Cookie', [`siswebp2p_session=${result.email}; Max-Age=259200; HttpOnly=true; Path=/`]);

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
        case 'GET':
        {
            let login_cookies = decodeURIComponent(req.headers.cookie).split(';');
            let map_cookies = {};
        
            login_cookies.forEach(element => 
            {
                let [name, value] = element.split('=');
                if(!name) return;
                name = name.trim();
                if(!value) return;
                value = value.trim();
        
                map_cookies[name] = value;
            });
        
            let siswebp2p_login = map_cookies['siswebp2p_session'];
        
            if(!siswebp2p_login)
            {
                res.writeHead(403, {'Content-Type': 'text/html'});
                res.write('No autorizado');
                return res.end();
            }
        
            let session = siswebp2p_login.split('|')[0];
            console.log(session)
        
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('Without content');
            return res.end();
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