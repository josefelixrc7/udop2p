
const ReadWallets = () =>
{
    $("#table_wallets tbody").empty();
    $("#table_wallets tbody").append(spinner_wait);

    fetch(`/wallets`)
    .then(response => response.json())
    .then(data =>
    {
        $("#table_wallets tbody").empty();

		for(let key in data)
        {
            let reg_date = new Date(data[key].reg_date);
            let reg_date_string = reg_date.getFullYear() + "-" + (reg_date.getMonth() + 1) + "-" + reg_date.getDate();
            let fields = 
            [
                $(`<th><img class="me-4" width="50" src="/${data[key].image}" alt="${data[key].name}">${data[key].name}</th>`)
                ,$("<td></td>").text(data[key].available)
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

const ReadWalletsInit = () =>
{
    ReadWallets();
}

ReadWalletsInit();
