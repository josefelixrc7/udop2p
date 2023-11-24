$(function()
{
    const read_profile = function()
    {
        fetch(`/profile`, 
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
            $('#field_nombre_completo').val(data[0].nombre_completo);
            $('#field_pago_movil').val(data[0].pago_movil);
            $('#field_transferencia').val(data[0].transferencia);
        })
        .catch(error =>
        {
            AddNotification(`Error al leer el perfil (${error})`)
        });
    }
    read_profile();

    $('#button_update_perfil').click(function()
    {
        let data = {nombre_completo: $('#field_nombre_completo').val()}

        fetch(`/profile?tipo=perfil`, 
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
                AddNotification(`Actualizado el perfil`);
            else
                AddNotification(`Error al actualizar el perfil`);
        })
        .catch(error =>
        {
            AddNotification(`Error al actualizar el perfil (${error})`)
        });
    });
    $('#button_update_clave').click(function()
    {
        let data =
        {
            clave_actual: $('#field_clave_actual').val()
            ,clave_nueva: $('#field_clave_nueva').val()
            ,clave_repetir: $('#field_clave_repetir').val()
        }
        if(data.clave_nueva != data.clave_repetir)
        {
            AddNotification(`Las contrase&ntilde;as no coinciden`);
            return;
        }
        if(data.clave_nueva.length < 8)
        {
            AddNotification(`Las contrase&ntilde;as no debe contener menos de 8 d&iacute;gitos.`);
            return;
        }

        fetch(`/profile?tipo=clave`, 
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
                AddNotification(`Actualizada la clave`);
            else
                return response.json();
        })
        .then(data =>
        {
            if(data == undefined)
                return;

            if(data.error != undefined)
                AddNotification(`Error al actualizar la clave. ${data.error}`);
        })
        .catch(error =>
        {
            AddNotification(`Error al actualizar la clave. (${error})`)
        });
    });
    $('#button_update_metodos_pagos').click(function()
    {
        let data =
        {
            pago_movil: $('#field_pago_movil').val()
            ,transferencia: $('#field_transferencia').val()
        }

        fetch(`/profile?tipo=metodo_pago`, 
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
                AddNotification(`Actualizado el m&eacute;todo de pago`);
            else
                AddNotification(`Error al actualizar el m&eacute;todo de pago`);
        })
        .catch(error =>
        {
            AddNotification(`Error al actualizar el m&eacute;todo de pago. (${error})`)
        });
    });
});