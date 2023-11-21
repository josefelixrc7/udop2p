$(function()
{
    const ReadMarkets = () =>
    {
        $("#table_markets tbody").empty();
        $("#table_markets tbody").append(spinner_wait);
    
        fetch(`/markets`, 
        {
            method: 'GET'
            ,mode: 'cors'
            ,cache: 'no-cache'
            ,credentials: 'same-origin'
            ,headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(data =>
        {
            $("#table_markets tbody").empty();
    
            for(let key in data)
            {
                // Convertir el buffer de imagen a una URL de datos
                const image_data_url = `data:image/png;base64,${data[key].criptomoneda_imagen}`;

                // Fields
                let fields = 
                [
                    $(`<th><img class="me-4" width="50" src="${image_data_url}" alt="${data[key].criptomoneda_nombre}"></th>`)
                    ,$(`<th>${data[key].criptomoneda_nombre}</th>`)
                    ,$("<td></td>").text(data[key].criptomoneda_precio)
                ];
                
                let row = $("<tr></tr>");
                for (let val of fields)
                {
                     $(row).append(val);
                }
                
                $("#table_markets tbody").append(row);
            }
        })
        .catch(error =>
        {
            $("#table_markets tbody").empty();
            AddNotification(`Error al leer los mercados (${error})`)
        });
    }
    
    ReadMarkets();
    
});