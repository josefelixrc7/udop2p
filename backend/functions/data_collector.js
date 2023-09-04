exports.DataCollector = (request, callback) =>
{
    let body = '';
    request.on('data', chunk =>
    {
        body += chunk.toString();
    });
    request.on('end', () =>
    {
        const ob = JSON.parse(body);
        callback(ob);
    });
}
