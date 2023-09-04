(function ()
{

    // Operations

        // Create

            document.querySelector("#form_products_create").addEventListener("submit", e => 
            {
                e.preventDefault();
                if(!CheckForm(document.querySelector("#form_products_create")))
                {
                    AddNotification(`Hay campos inv&aacute;lidos`);
                    return;
                }

                CreateProduct();
            });

        // Update

            document.querySelector("#form_products_update").addEventListener("submit", e => 
            {
                e.preventDefault();
                if(!CheckForm(document.querySelector("#form_products_update")))
                {
                    AddNotification(`Hay campos inv&aacute;lidos`);
                    return;
                }

                UpdateProduct();
            });

        // Delete

            document.querySelector("#form_products_delete").addEventListener("submit", e => 
            {
                e.preventDefault();
                DeleteProduct();
            });

})();

const CreateProduct = () =>
{
    const form_data = 
    {
        name: document.querySelector('#form_products_create input.name').value
        ,description: document.querySelector('#form_products_create textarea.description').value
    };

    ChangeButtonToWait(document.querySelector('#form_products_create button.confirm'), '', false);

    CreateProductFetch(form_data)
    .then(result =>
    {
        ChangeButtonToWait(document.querySelector('#form_products_create button.confirm'), 'A&ntilde;adir', true);
        AddNotification(`Exito al guardar el producto`);
    })
    .catch(error =>
    {
        ChangeButtonToWait(document.querySelector('#form_products_create button.confirm'), 'A&ntilde;adir', true);
        AddNotification(`Error al guardar el producto (${error.error})`);
    });
}

async function CreateProductFetch(form_data)
{
    const res = await fetch(`${host_server}/products`,
    {
        method: 'POST'
        ,body: JSON.stringify(form_data)
        ,headers:{'Content-Type': 'application/json'}
    });
    const json_res = await res.json();

    if(res.status == 200)
        return json_res;
    else
        throw json_res;
}

const ReadProducts = (from, to) =>
{
    $("#table_products tbody").empty();
    $("#table_products tbody").append(spinner_wait);

    fetch(`${host_server}/products`)
    .then(response => response.json())
    .then(data =>
    {
        $("#table_products tbody").empty();

		for(let key in data)
        {
            let reg_date = new Date(data[key].reg_date);
            let reg_date_string = reg_date.getFullYear() + "-" + (reg_date.getMonth() + 1) + "-" + reg_date.getDate();
            let fields = 
            [
                $("<th scope='row'></th>").text(data[key].id)
                ,$("<td></td>").text(data[key].name)
                ,$("<td></td>").text(data[key].description)
                ,$("<td></td>").text(reg_date_string)
                ,$("<td class='cdr_row'></td>").append
                (
                    `
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <button 
                                type="button" 
                                class="btn btn-primary" 
                                data-bs-toggle="modal" 
                                data-bs-target="#modal_products_update" 
                                onclick="UpdateProductsPre(${data[key].id});"
                            >Editar</button>
                            <button 
                                type="button" 
                                class="btn btn-secondary" 
                                data-bs-toggle="modal" 
                                data-bs-target="#modal_products_delete" 
                                onclick="DeleteProductPre(${data[key].id}, '${data[key].name}');"
                            >Borrar</button>
                        </div>
                    `
                )
            ];
            
            let row = $("<tr></tr>");
            for (let val of fields)
            {
                 $(row).append(val);
            }
            
			$("#table_products tbody").append(row);
        }
    })
    .catch(error =>
    {
        $("#table_products tbody").empty();
        AddNotification(`Error al leer los productos (${error})`)
    });
}

const ReadProductsInit = () =>
{
    ReadProducts();
}

ReadProductsInit();

const UpdateProductsPre = (id) =>
{
    $('#form_products_update').append(spinner_wait);

    fetch(`${host_server}/products?id=${id}`)
    .then(response => response.json())
    .then(data =>
    {
        $("#modal_products_update input.id").val(data[0].id);
        $("#modal_products_update input.name").val(data[0].name);
        $("#modal_products_update textarea.description").val(data[0].description);

        $('#form_products_update .spinner_wait').remove();
    })
    .catch(error =>
    {
        AddNotification(`Error al leer el producto a editar (${error})`)
    });
}

const UpdateProduct = () =>
{
    const form_data = 
    {
        id: document.querySelector('#modal_products_update input.id').value
        ,name: document.querySelector('#modal_products_update input.name').value
        ,description: document.querySelector('#modal_products_update textarea.description').value
    };

    fetch(`${host_server}/products`,
    {
        method: 'PUT'
        ,body: JSON.stringify(form_data)
        ,headers:{'Content-Type': 'application/json'}
    })
    .then((response) => 
    {
        if(response.status == 200)
            AddNotification(`Producto actualizado correctamente`)
        else
            AddNotification(`Error al actualizar el producto`)
    });
}

const DeleteProductPre = (id, name) =>
{
    $("#modal_products_delete input.id").val(id);
    $("#modal_products_delete strong.id").html(id);
    $("#modal_products_delete strong.name").html(name);
}

const DeleteProduct = () =>
{
    const form_data = 
    {
        id: document.querySelector('#modal_products_delete input.id').value
    };

    fetch(`${host_server}/products`,
    {
        method: 'DELETE'
        ,body: JSON.stringify(form_data)
        ,headers:{'Content-Type': 'application/json'}
    })
    .then((response) => 
    {
        if(response.status == 200)
            AddNotification(`Producto eliminado correctamente`)
        else
            AddNotification(`Error al eliminar el producto`)
    });
}
