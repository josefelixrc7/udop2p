$(function()
{
    const read_announcements = function()
    {
        $("#table_anuncios tbody").empty();
        $("#table_anuncios tbody").append(spinner_wait);
    
        fetch(`/announcements?panel=1`, 
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
            $("#table_anuncios tbody").empty();
    
            for(let key in data)
            {
                // Fields
                let fields = 
                [
                    ,$("<td></td>").text(data[key].id_orden)
                    ,$("<td></td>").text(data[key].estado_orden)
                    ,$("<td></td>").text(data[key].tipo_orden)
                    ,$("<td></td>").text(data[key].monto_inicial)
                    ,$("<td></td>").text(data[key].monto_disponible)
                    ,$("<td></td>").text(data[key].negociaciones)
                    ,$("<td></td>").text(data[key].fecha_registro)
                ];
                if(data[key].estado_orden == 'activo')
                    fields.push($(`<td><button id="button_modificar_anuncio" tag="${data[key].id_orden}"class="btn btn-primary">Cerrar anuncio</button></td>`));

                let row = $("<tr></tr>");
                for (let val of fields)
                {
                     $(row).append(val);
                }
                
                $("#table_anuncios tbody").append(row);
            }
        })
        .catch(error =>
        {
            $("#table_anuncios tbody").empty();
            AddNotification(`Error al leer los anuncios (${error})`)
        });
    };
    read_announcements();

    $('#form_announcements_add').submit(function(e)
    {
        e.preventDefault();
        if(!CheckForm(document.querySelector("#form_announcements_add")))
        {
            AddNotificationBlock('#notifications_announcements_add', `Hay campos inv&aacute;lidos`);
            return;
        }

        let data =
        {
            an_criptomoneda: $('#an_criptomoneda').val()
            ,an_fiat: $('#an_fiat').val()
            ,an_monto: $('#an_monto').val()
            ,an_precio: $('#an_precio').val()
            ,an_metodo_pago: $('#an_metodo_pago').val()
            ,an_tipo_orden: $('#an_tipo_orden').val()
        };

        if(data.an_monto <= 0)
        {
            AddNotificationBlock('#notifications_announcements_add', `El monto no puede ser menor o igual a cero`);
            return;
        }
        if(data.an_precio <= 0)
        {
            AddNotificationBlock('#notifications_announcements_add', `El precio no puede ser menor o igual a cero`);
            return;
        }

        fetch(`/announcements`,
        {
            method: 'POST'
            ,mode: 'cors'
            ,cache: 'no-cache'
            ,credentials: 'same-origin'
            ,headers: {'Content-Type': 'application/json'}
            ,body: JSON.stringify(data)
        })
        .then(response => 
        {
            $('#announcements_add button[data-bs-dismiss="modal"]').click();
            if(response.status == 200)
            {
                AddNotification(`Anuncio a&ntilde;adido correctamente.`);
                setTimeout(function()
                {
                    window.location.href = "anuncios.html";
                }, 1000); 
            }
            else
            {
                return response.json()
            }
        })
        .then(data =>
        {
            if(data == undefined)
                return;

            if(data.error != '')
                AddNotification(`Error al a&ntilde;adir el anuncio. (${data.error})`)
        })
        .catch(error =>
        {
            $('#announcements_add button[data-bs-dismiss="modal"]').click();
            AddNotification(`Error al a&ntilde;adir el anuncio. (${error})`);
        });
    });
    $(document).on('click', '#button_modificar_anuncio', function(e)
    {
        let tag = $(e.target).attr('tag');

        let data = {id_orden: tag};

        fetch(`/announcements`,
        {
            method: 'PUT'
            ,mode: 'cors'
            ,cache: 'no-cache'
            ,credentials: 'same-origin'
            ,headers: {'Content-Type': 'application/json'}
            ,body: JSON.stringify(data)
        })
        .then(response => 
        {
            if(response.status == 200)
            {
                AddNotification(`Anuncio cerrado correctamente.`);
                setTimeout(function()
                {
                    window.location.href = "anuncios.html";
                }, 1000); 
            }
            else
            {
                return response.json()
            }
        })
        .then(data =>
        {
            if(data == undefined)
                return;

            if(data.error != '')
                AddNotification(`Error al cerrar el anuncio. (${data.error})`)
        })
        .catch(error =>
        {
            AddNotification(`Error al cerrar el anuncio. (${error})`);
        });
    });
});