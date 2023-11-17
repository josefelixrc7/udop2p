const http = require('https');
const url = require('url');
const fs = require('fs');

const db = require('./functions/db_connection');
const ut = require('./functions/utilities');

// Handlers
    const login_handler = require('./handlers/login_handler');
    const wallets_handler = require('./handlers/wallets_handler');

// Server
    let port = 9090;

    const options =
    {
        key: fs.readFileSync(process.env.KEY_FILE),
        cert: fs.readFileSync(process.env.CERT_FILE)
    };

    let server = http.createServer(options, (req, res) =>
    {
        let req_url = url.parse(req.url, true);
        let url_query = req_url.query;
        let url_pathname = req_url.pathname;

        console.log(`${req.method} ${url_pathname}`);

        let origin = 'https://localhost:9090';

        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        switch(url_pathname)
        {
            case "/login":
            {
                login_handler.Handler(req, res, db, url_query);
                break;
            }
            case "/wallets":
            {
                wallets_handler.Handler(req, res, db, url_query);
                break;
            }
            default:
            {
                let address = "/home/josefelixrc7/projects/Others/Sistema P2P RIVAS-GUERRA/Codigo/frontend"
                let filename = address + url_pathname;
                let extension = filename.split('.').pop();
              
                fs.readFile(filename, function(err, data)
                {
                    if (err)
                    {
                        res.writeHead(404, {'Content-Type': 'text/html'});
                        return res.end("404 Not Found");
                    }
                
                    if(ut.filetypes.get(extension) != undefined)
                        res.writeHead(200, {'Content-Type': ut.filetypes.get(extension)});
                    else
                        res.writeHead(200, {'Content-Type': 'application/octet-stream'});

                    res.write(data);
                    return res.end();
                });


                /*res.writeHead(404, {'Content-Type': 'text/html'});
                res.write('Endpoint Not found');
                return res.end();*/

                
                /*res.writeHead(404, {'Content-Type': 'text/html'});
                res.write('Endpoint Not found');
                return res.end();*/

                break;
            }
        }
    });

server.listen(port, '0.0.0.0', function()
{
    console.log(`Server started at port ${port}`);
});