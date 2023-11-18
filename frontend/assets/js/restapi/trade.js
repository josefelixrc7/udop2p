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
    const read_ordenes_anuncios = function()
    {
        $("#table_ordenes_anuncios tbody").empty();
        $("#table_ordenes_anuncios tbody").append(spinner_wait);
    
        let crypto = $('#select_criptomoneda').val();
        let fiat = $('#select_fiat').val();
        let type_orden_id = $('#type_orden_id').val();

        fetch(`/announcements?crypto=${crypto}&fiat=${fiat}&type_orden_id=${type_orden_id}`, 
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
            $("#table_ordenes_anuncios tbody").empty();
    
            for(let key in data)
            {
                // Fields
                let fields = 
                [
                    ,$("<td></td>").text(data[key].usuario_nombre)
                    ,$("<td></td>").text(data[key].reputacion)
                    ,$("<td></td>").text(data[key].precio)
                    ,$("<td></td>").text(data[key].disponible)
                    ,$("<td></td>").text(data[key].metodo_pago)
                    ,$("<td></td>").append($(`<button class="button_iniciar_comercio" tag="${data[key].metodo_pago}">Ver</button>`))
                ];
                
                let row = $("<tr></tr>");
                for (let val of fields)
                {
                     $(row).append(val);
                }
                
                $("#table_ordenes_anuncios tbody").append(row);
            }
        })
        .catch(error =>
        {
            $("#table_ordenes_anuncios tbody").empty();
            AddNotification(`Error al leer las &oacute;rdenes de anuncios (${error})`)
        });
    }


    $('#button_comprar').click(function(e)
    {
        activate_tab('#nav-monedas');
        $('#type_comercio').text('Compra');
        $('#type_orden_id').val('1');
        read_cripomonedas();
        read_fiats();
    });
    $('#button_vender').click(function(e)
    {
        activate_tab('#nav-monedas');
        $('#type_comercio').text('Venta');
        $('#type_orden_id').val('2');
        read_cripomonedas();
        read_fiats();
    });
    $('#button_buscar_anuncios').click(function(e)
    {
        activate_tab('#nav-anuncios');
        read_ordenes_anuncios();
    });


    /*$('#nav-monedas-tab').click(function(e){activate_tab('#nav-monedas')});
    $('#nav-anuncios-tab').click(function(e){activate_tab('#nav-anuncios')});
    $('#nav-negociacion-tab').click(function(e){activate_tab('#nav-negociacion')});
    $('#nav-pago-tab').click(function(e){activate_tab('#nav-pago')});
    $('#nav-finalizar-tab').click(function(e){activate_tab('#nav-finalizar')});*/
});