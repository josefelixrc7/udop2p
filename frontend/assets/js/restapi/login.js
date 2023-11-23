$(function()
{
    $("#form_login").submit(e => 
    {
        e.preventDefault();
        if(!CheckForm(document.querySelector("#form_login")))
        {
            AddNotification(`Hay campos inv&aacute;lidos`);
            return;
        }

        let data =
        {
            email: $('#form_login #login_email').val()
            ,password: $('#form_login #login_password').val()
        };

        fetch(`/login`,
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
            if(response.status == 200)
                return response.json();
            else
            {
                AddNotification(`Puede que su usuario o contrase&ntilde;a sean incorrectos, o su cuenta no haya sido activada a&uacute;n`);
                return [];
            }
            
        })
        .then(data =>
        {
            if(data.length == 0)
            {
                return;
            }

            AddNotification(`Iniciando sesi&oacute;n`);
            window.location.href = "inicio.html";
        })
        .catch(error =>
        {
            AddNotification(`Error al iniciar sesi&oacute;n (${error})`)
        });
    });
    $(".logout").click(e => 
    {
        fetch(`/login`,
        {
            method: 'DELETE'
            ,mode: 'cors'
            ,cache: 'no-cache'
            ,credentials: 'same-origin'
            ,headers: {'Content-Type': 'application/json'}
        })
        .then(response => 
        {
            if(response.status == 200)
                window.location.href = "iniciar-sesion.html";
            else
                AddNotification(`Error al cerrar sesi&oacute;n`);
            
        })
        .catch(error =>
        {
            AddNotification(`Error al cerrar sesi&oacute;n (${error})`)
        });
    });
});


const VerifyInitiatedSession = (callback) =>
{
    fetch(`/login`
    ,{
        method: 'GET'
        ,mode: 'cors'
        ,cache: 'no-cache'
        ,credentials: 'same-origin'
        ,headers: {'Content-Type': 'application/json'}
    })
    .then(response => 
    {
        if(response.status == 200)
        {
            callback(true);
            return response.json();
        }
        else
        {
            callback(false);
            return {};
        }
    })
    .then(data =>
    {
        if(data.length > 0)
            $('.link_session_email').text(data[0].correo);
    })
    .catch(error =>
    {
        AddNotification(`Error al verificar la sesi&oacute;n (${error})`)
    });
};

const VerifyUserRole = (callback) =>
{
    fetch(`/login`
    ,{
        method: 'GET'
        ,mode: 'cors'
        ,cache: 'no-cache'
        ,credentials: 'same-origin'
        ,headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data =>
    {
        if(data.length == 0)
        {
            callback(false);
            return;
        }

        if(data[0].rol == 'admin')
            callback(true);
        else
            callback(false);
    })
    .catch(error =>
    {
        AddNotification(`Error al verificar el rol (${error})`)
    });
}