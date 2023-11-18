$(function()
{
    const activate_tab = function(id_tab_name)
    {
        let tabs = 
        [
            '#nav-modalidad'
            ,'#nav-monedas'
            ,'#nav-anuncios'
            ,'#nav-negociacion'
            ,'#nav-pago'
            ,'#nav-finalizar'
        ];

        for(tab of tabs)
        {
            if(tab == id_tab_name)
            {
                $(tab).addClass('active');
                $(tab + '-tab').addClass('active');
                $(tab).removeClass('fade');
            }
            else
            {
                $(tab).removeClass('active');
                $(tab + '-tab').removeClass('active');
                $(tab).addClass('fade');
            }
        }
    }
    const read_cripomonedas = function()
    {
        $("#select_criptomoneda").empty();
        $("#select_criptomoneda").append(spinner_select_wait);
    
        fetch(`/crypto`, 
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
            $("#select_criptomoneda").empty();
    
            for(let key in data)
            {
                let option = $(`<option value="${data[key].criptomoneda_id}">${data[key].criptomoneda_nombre}</option>`)
                $("#select_criptomoneda").append(option);
            }
        })
        .catch(error =>
        {
            $("#select_criptomoneda").empty();
            AddNotification(`Error al leer las criptomonedas (${error})`)
        });
    }
    const read_fiats = function()
    {
        $("#select_fiat").empty();
        $("#select_fiat").append(spinner_select_wait);
    
        fetch(`/fiat`, 
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
            $("#select_fiat").empty();
    
            for(let key in data)
            {
                let option = $(`<option value="${data[key].moneda_fiat_id}">${data[key].moneda_fiat_nombre}</option>`)
                $("#select_fiat").append(option);
            }
        })
        .catch(error =>
        {
            $("#select_fiat").empty();
            AddNotification(`Error al leer las monedas FIAT (${error})`)
        });
    }


    $('#button_comprar').click(function(e)
    {
        activate_tab('#nav-monedas');
        $('#type_comercio').text('Compra');
        read_cripomonedas();
        read_fiats();
    });
    $('#button_vender').click(function(e)
    {
        activate_tab('#nav-monedas');
        $('#type_comercio').text('Venta');
        read_cripomonedas();
        read_fiats();
    });


    $('#nav-monedas-tab').click(function(e){activate_tab('#nav-monedas')});
    $('#nav-anuncios-tab').click(function(e){activate_tab('#nav-anuncios')});
    $('#nav-negociacion-tab').click(function(e){activate_tab('#nav-negociacion')});
    $('#nav-pago-tab').click(function(e){activate_tab('#nav-pago')});
    $('#nav-finalizar-tab').click(function(e){activate_tab('#nav-finalizar')});
});