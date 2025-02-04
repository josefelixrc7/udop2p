const db = require('./db_connection');

let map1 = new Map();

map1.set("aac", "audio/aac");
map1.set("abw", "application/x-abiword");
map1.set("arc", "application/x-freearc");
map1.set("avi", "video/x-msvideo");
map1.set("azw", "application/vnd.amazon.ebook");
map1.set("bin", "application/octet-stream");
map1.set("bmp", "image/bmp");
map1.set("bz", "application/x-bzip");
map1.set("bz2", "application/x-bzip2");
map1.set("csh", "application/x-csh");
map1.set("css", "text/css");
map1.set("csv", "text/csv");
map1.set("doc", "application/msword");
map1.set("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
map1.set("eot", "application/vnd.ms-fontobject");
map1.set("epub", "application/epub+zip");
map1.set("gz", "application/gzip");
map1.set("gif", "image/gif");
map1.set("htm", "text/html");
map1.set("html", "text/html");
map1.set("ico", "image/vnd.microsoft.icon");
map1.set("ics", "text/calendar");
map1.set("jar", "application/java-archive");
map1.set("jpeg", "image/jpeg");
map1.set("jpg", "image/jpeg");
map1.set("js", "text/javascript");
map1.set("json", "application/json");
map1.set("jsonld", "application/ld+json");
map1.set("mid", "audio/midi");
map1.set("midi", "audio/midi");
map1.set("mjs", "text/javascript");
map1.set("mp3", "audio/mpeg");
map1.set("mp4", "video/mp4");
map1.set("mpeg", "video/mpeg");
map1.set("mpkg", "application/vnd.apple.installer+xml");
map1.set("odp", "application/vnd.oasis.opendocument.presentation");
map1.set("ods", "application/vnd.oasis.opendocument.spreadsheet");
map1.set("odt", "application/vnd.oasis.opendocument.text");
map1.set("oga", "audio/ogg");
map1.set("ogv", "video/ogg");
map1.set("ogx", "application/ogg");
map1.set("opus", "audio/opus");
map1.set("otf", "font/otf");
map1.set("png", "image/png");
map1.set("pdf", "application/pdf");
map1.set("php", "application/x-httpd-php");
map1.set("ppt", "application/vnd.ms-powerpoint");
map1.set("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
map1.set("rar", "application/vnd.rar");
map1.set("rtf", "application/rtf");
map1.set("sh", "application/x-sh");
map1.set("svg", "image/svg+xml");
map1.set("swf", "application/x-shockwave-flash");
map1.set("tar", "application/x-tar");
map1.set("tif", "image/tiff");
map1.set("tiff", "image/tiff");
map1.set("ts", "video/mp2t");
map1.set("ttf", "font/ttf");
map1.set("txt", "text/plain");
map1.set("vsd", "application/vnd.visio");
map1.set("wav", "audio/wav");
map1.set("weba", "audio/webm");
map1.set("webm", "video/webm");
map1.set("webp", "image/webp");
map1.set("woff", "font/woff");
map1.set("woff2", "font/woff2");
map1.set("xhtml", "application/xhtml+xml");
map1.set("xls", "application/vnd.ms-excel");
map1.set("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
map1.set("xml", "application/xml");
map1.set("xul", "application/vnd.mozilla.xul+xml");

exports.filetypes = map1;

let find_session = function(req)
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
    
    let session_email = '';

    if(siswebp2p_login)
    session_email = siswebp2p_login.split('|')[0];
    
    return session_email;
}

exports.find_session = find_session;

async function update_markets()
{
    let query = `
    UPDATE siswebp2p.criptomonedas_precios
    SET
        precio = precio + (RAND() * 2 - 1) * (variacion/100) * precio
    `;
    await db.pool_conn.query(query);
}
exports.update_markets = update_markets;