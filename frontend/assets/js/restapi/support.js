$(function()
{
    const read_tickets = function()
    {

        fetch(`/support`, 
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
            $("#section_buttons_tickets").empty();
            $("#section_body_tickets").empty();

            for(let key in data)
            {
                let button_ticket = `
                    <button class="nav-link ${key == 0? 'active' : ''}" id="v-pills-${data[key].id}-tab" data-bs-toggle="pill" data-bs-target="#v-pills-${data[key].id}" type="button" role="tab" aria-controls="v-pills-${data[key].id}" aria-selected="${key == 0? 'true' : 'false'}">#${data[key].id}: ${data[key].titulo}(${data[key].estado})</button>
                `;
                
                $("#section_buttons_tickets").append(button_ticket);

                let body_ticket = `
                    <div class="tab-pane ${key == 0? 'show active' : 'fade'}" id="v-pills-${data[key].id}" role="tabpanel" aria-labelledby="v-pills-${data[key].id}-tab">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td>Estado</td>
                                    <td>
                                        <strong>${data[key].estado}</strong>
                                    </td>
                                    <td>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Actualizar estado</td>
                                    <td>
                                        <select class="form-select d-inline-block" id="button_update_ticket_${data[key].id}">
                                            <option value="En espera">En espera</option>
                                            <option value="Resuelto">Resuelto</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button class="button_update_estado btn btn-primary d-inline-block w-auto" tag="${data[key].id}">Actualizar</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>T&iacute;tulo</td>
                                    <td>${data[key].estado}</td>
                                    <td>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Descripci&oacute;n</td>
                                    <td><p>${data[key].contenido}</p></td>
                                    <td>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p>
                            Un asesor se estar&aacute; comunicando con los usuarios (${data[key].usuario1} y ${data[key].usuario2}) para solicitar toda la informaci&oacute;n sobre la apelaci&oacute;n.
                            Est&eacute; atento a su correo.
                        </p>
                    </div>
                `;
                
                $("#section_body_tickets").append(body_ticket);
            }
        })
        .catch(error =>
        {
            $("#table_comercios tbody").empty();
            AddNotification(`Error al leer los comercios (${error})`)
        });
    }
    read_tickets();

    $(document).on('click', '.button_update_estado', function(e)
    {
        let tag = $(e.target).attr('tag');
        let data = 
        {
            id_ticket: tag
            ,estado: $(`#button_update_ticket_${tag}`).val()
        }

        fetch(`/support`, 
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
                AddNotification(`Actualizado el estado`);
            }
            else
            {
                AddNotification(`Error al actualizar el estado`);
            }
        })
        .catch(error =>
        {
            AddNotification(`Error al actualizar el estado (${error})`)
        });
    });
});