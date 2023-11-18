$(function()
{
    const ReadWallets = () =>
    {
        $("#table_wallets tbody").empty();
        $("#table_wallets tbody").append(spinner_wait);
    
        fetch(`/wallets`, 
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
            $("#table_wallets tbody").empty();
    
            for(let key in data)
            {
                // Convertir el buffer de imagen a una URL de datos
                const image_data_url = `data:image/png;base64,${data[key].criptomoneda_imagen}`;

                // Date
                let reg_date = new Date(data[key].fecha_actualizacion);
                let reg_date_string = reg_date.getFullYear() + "-" + (reg_date.getMonth() + 1) + "-" + reg_date.getDate();

                // Fields
                let fields = 
                [
                    $(`<th><img class="me-4" width="50" src="${image_data_url}" alt="${data[key].criptomoneda}"></th>`)
                    ,$(`<th>${data[key].criptomoneda}</th>`)
                    ,$("<td></td>").text(data[key].saldo)
                    ,$("<td></td>").text(reg_date_string)
                ];
                
                let row = $("<tr></tr>");
                for (let val of fields)
                {
                     $(row).append(val);
                }
                
                $("#table_wallets tbody").append(row);
            }
        })
        .catch(error =>
        {
            $("#table_wallets tbody").empty();
            AddNotification(`Error al leer las billeteras (${error})`)
        });
    }
    
    ReadWallets();
    
});