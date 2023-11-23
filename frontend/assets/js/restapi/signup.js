$(function()
{
    $("#button_registro").click(e => 
    {
        e.preventDefault();
        if(!CheckForm(document.querySelector("#form_signup")))
        {
            AddNotification(`Hay campos inv&aacute;lidos`);
            return;
        }

        let data =
        {
            correo: $('#correo').val()
            ,nombre_completo: $('#nombre_completo').val()
            ,cedula: $('#cedula').val()
            ,contrasena: $('#contrasena').val()
            ,repetir_contrasena: $('#repetir_contrasena').val()
        };

        if(data.contrasena != data.repetir_contrasena)
        {
            AddNotification(`Las contrase&ntilde;as no coinciden`);
            return;
        }
        if(data.contrasena.length < 8)
        {
            AddNotification(`La contrase&ntilde;a no debe ser menor a 8 d&iacute;gitos.`);
            return;
        }

        fetch(`/signup`,
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
            {
                AddNotification(`Registro exitoso. Redirigiendo.`);
                setTimeout(() =>
                {
                    window.location.href = "iniciar-sesion.html";
                }, 1000);
            }
            else if(response.status == 400)
                AddNotification(`El correo o c&eacute;dula ya est&aacute; registrado.`);
            else
            {
                AddNotification(`Error al registrarse.`);
            }
            
        })
        .catch(error =>
        {
            AddNotification(`Error al iniciar sesi&oacute;n (${error})`)
        });
    });
});