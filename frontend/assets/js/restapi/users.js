$(function()
{
    const ReadUsers = () =>
    {
        $("#table_wallets tbody").empty();
        $("#table_wallets tbody").append(spinner_wait);
    
        fetch(`/users`, 
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
            $("#table_users tbody").empty();
    
            for(let key in data)
            {
                // Date
                let reg_date = new Date(data[key].fecha_registro);
                let reg_date_string = reg_date.getFullYear() + "-" + (reg_date.getMonth() + 1) + "-" + reg_date.getDate();

                // Fields
                let fields = 
                [
                    ,$(`<th>${data[key].correo}</th>`)
                    ,$(`<td>${data[key].rol}</td>`)
                    ,$(`<td>${data[key].estado}</td>`)
                    ,$(`<td>${data[key].cedula}</td>`)
                    ,$(`<td>${data[key].nombre_completo}</td>`)
                    ,$(`<td>${reg_date_string}</td>`)
                    ,$(`<td>
                            <select id="estado_usuario_${data[key].id}" class="form-select">
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                            <button class="button_update_user btn btn-primary" tag="${data[key].id}">Actualizar</button>
                        </td>
                    `)
                ];
                
                let row = $("<tr></tr>");
                for (let val of fields)
                {
                     $(row).append(val);
                }
                
                $("#table_users tbody").append(row);
            }
        })
        .catch(error =>
        {
            $("#table_users tbody").empty();
            AddNotification(`Error al leer los usuarios (${error})`)
        });
    }
    
    ReadUsers();
    
    $(document).on('click', '.button_update_user', function(e)
    {
        let tag = $(e.target).attr('tag');
        let data = 
        {
            id_usuario: tag
            ,estado: $(`#estado_usuario_${tag}`).val()
        }

        fetch(`/users`, 
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
                AddNotification(`Actualizado el usuario`);
                window.location.href = "usuarios.html";
            }
            else
            {
                AddNotification(`Error al actualizar el usuario`);
            }
        })
        .catch(error =>
        {
            AddNotification(`Error al actualizar el usuario (${error})`)
        });
    });
});