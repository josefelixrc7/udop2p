$(function()
{
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
            ,an_metodo_pago: $('#an_metodo_pago').val()
            ,an_tipo_orden: $('#an_tipo_orden').val()
        };

        if(data.an_monto <= 0)
        {
            AddNotificationBlock('#notifications_announcements_add', `El monto no puede ser menor o igual a cero`);
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
});