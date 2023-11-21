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
    const read_comercios = function()
    {
        if($("#table_comercios tbody").length == 0)
            return;

        $("#table_comercios tbody").empty();
        $("#table_comercios tbody").append(spinner_wait);
    
        fetch(`/trade`, 
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
            $("#table_comercios tbody").empty();
    
            for(let key in data)
            {
                // Fields
                let fields = 
                [
                    /*,$("<td></td>").text(data[key].orden_negociacion_id)*/
                    ,$("<td></td>").text(data[key].orden_estado)
                    ,$("<td></td>").text(data[key].orden_tipo)
                    ,$("<td></td>").text(data[key].monto_negoceado)
                    ,$("<td></td>").text(data[key].criptomoneda_nombre)
                    ,$("<td></td>").text(data[key].moneda_fiat_nombre)
                    ,$("<td></td>").text(data[key].moneda_fiat_precio)
                    ,$("<td></td>").text(data[key].usuario_creador)
                    ,$("<td></td>").text(data[key].usuario_negoceador)
                    ,$("<td></td>").text(data[key].fecha_registro)
                ];
                if(data[key].orden_estado == 'Esperando pago del comprador')
                    fields.push($(`<td><a href="comerciar-nuevo.html?tab=nav-pago&trade_id=${data[key].orden_negociacion_id}" class="btn btn-primary">Continuar</a></td>"`))
                else if(data[key].orden_estado == 'Esperando verificacion del vendedor')
                    fields.push($(`<td><a href="comerciar-nuevo.html?tab=nav-pago&trade_id=${data[key].orden_negociacion_id}" class="btn btn-primary">Continuar</a></td>"`))
                else if(data[key].orden_estado == 'Pago verificado')
                    fields.push($(`<td><a href="comerciar-nuevo.html?tab=nav-finalizar&trade_id=${data[key].orden_negociacion_id}" class="btn btn-primary">Continuar</a></td>"`))
                else if(data[key].orden_estado != 'Finalizado')
                    fields.push($(`<td><a href="comerciar-nuevo.html?tab=nav-pago&trade_id=${data[key].orden_negociacion_id}" class="btn btn-primary">Continuar</a></td>"`))

                let row = $("<tr></tr>");
                for (let val of fields)
                {
                     $(row).append(val);
                }
                
                $("#table_comercios tbody").append(row);
            }
        })
        .catch(error =>
        {
            $("#table_comercios tbody").empty();
            AddNotification(`Error al leer los comercios (${error})`)
        });
    }
    read_comercios();
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
                    ,$("<td></td>").append($(`<button class="button_ver_comercio" tag="${data[key].orden_id}">Ver</button>`))
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
    const change_annoucement_values = function()
    {
        let cantity = $('#field_cantidad_comerciar').val();
        let price = $('#field_precio').val();
        let pago = cantity * price;
        $('#field_pago_fiat').val(pago.toFixed(2));
    }
    const read_announcement_info = function(id_announcement)
    {
        fetch(`/announcements?id_announcement=${id_announcement}`, 
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
            let price = data[0].precio_real * 1;
            $('#field_id_orden_anuncio').val(data[0].orden_id);
            $('#field_id_monedas_fiat_precio').val(data[0].monedas_fiat_precio_id);
            $('#field_disponible').val(data[0].disponible_real);
            $('#field_disponible_criptomoneda').text(data[0].criptomoneda_nombre);
            $('#field_disponible_billetera').val(data[0].saldo);
            $('#field_disponible_billetera_criptomoneda').text(data[0].criptomoneda_nombre);
            $('#field_cantidad_comerciar_criptomoneda').text(data[0].criptomoneda_nombre);
            $('#field_precio').val(price);
            $('#field_precio_fiat').text(data[0].fiat_nombre);
            $('#field_pago_fiat_nombre').text(data[0].fiat_nombre);
            change_annoucement_values();
        })
        .catch(error =>
        {
            AddNotification(`Error al leer la orden de anuncio (${error})`)
        });
    }
    const init_counter = function()
    {
        let counter_status = false;

        if (!counter_status)
        {
            counter_status = true;
            let time_left = 20;

            function update_counter()
            {
                $('#counter_time').text(time_left);
                if (time_left === 0) {
                    activate_tab('#nav-anuncios');
                    read_ordenes_anuncios();
                    counter_status = false;
                    $('#counter_time').text('20');
                }
                else
                {
                    time_left--;
                    setTimeout(update_counter, 1000);
                }
            }

            // Iniciar el primer ciclo de la cuenta regresiva
            update_counter();
        }
    }
    const read_pay_method = function()
    {
        let id_orden_negociacion = $('#text_orden_negociacion_id').val();
        fetch(`/pay_method?id_orden_negociacion=${id_orden_negociacion}`, 
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
            $('.text_descripcion_metodo_pago').text(data[0].descripcion);
        })
        .catch(error =>
        {
            AddNotification(`Error al leer el metodo de pago (${error})`)
        });
    }
    const create_trade = function(values)
    {
        fetch(`/trade`, 
        {
            method: 'POST'
            ,mode: 'cors'
            ,cache: 'no-cache'
            ,credentials: 'same-origin'
            ,headers: {'Content-Type': 'application/json'}
            ,body: JSON.stringify(values)
        })
        .then(response => response.json())
        .then(data =>
        {
            $('#text_orden_negociacion_id').val(data[0].id);
            read_pay_method();
        })
        .catch(error =>
        {
            AddNotification(`Error al crear el comercio (${error})`)
        });
    }
    const load_pay_code = function()
    {
        let data =
        {
            field_comprobante_subir: $('#field_comprobante_subir').val()
            ,ordenes_negociacion_id: $('#text_orden_negociacion_id').val()
            ,trade_type: 'subir_pago'
        }
        fetch(`/trade`, 
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
                AddNotification(`C&oacute;digo de pago subido`);
                $('.button_update_estado_codigo').click();
            }
            else
            {
                AddNotification(`Error al subir el c&oacute;digo de pago`);
            }
        })
        .catch(error =>
        {
            AddNotification(`Error al subir el c&oacute;digo de pago (${error})`)
        });
    }
    const confirm_pay_code = function()
    {
        let data =
        {
            ordenes_negociacion_id: $('#text_orden_negociacion_id').val()
            ,trade_type: 'verificar_pago'
        }
        fetch(`/trade`, 
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
                activate_tab('#nav-finalizar');
                AddNotification(`C&oacute;digo de pago verificado`)
            }
            else
            {
                AddNotification(`Error al verificar el c&oacute;digo de pago`)
            }
        })
        .catch(error =>
        {
            AddNotification(`Error al verificar el c&oacute;digo de pago (${error})`)
        });
    }
    const panel_comprador = function()
    {
        $('#section_pagador').show();
        $('#section_verificador').hide();
    }
    const panel_vendedor = function()
    {
        $('#section_pagador').hide();
        $('#section_verificador').show();
    }


    $('#button_comprar').click(function(e)
    {
        activate_tab('#nav-monedas');
        $('.type_comercio').text('Comprar');
        $('#type_orden_id').val('1');
        read_cripomonedas();
        read_fiats();
    });
    $('#button_vender').click(function(e)
    {
        activate_tab('#nav-monedas');
        $('.type_comercio').text('Vender');
        $('#type_orden_id').val('2');
        read_cripomonedas();
        read_fiats();
    });
    $('#button_buscar_anuncios').click(function(e)
    {
        activate_tab('#nav-anuncios');
        read_ordenes_anuncios();
    });
    $(document).on('click', '.button_ver_comercio', function(e)
    {
        activate_tab('#nav-negociacion');
        let id_announcement = $(e.target).attr('tag');
        read_announcement_info(id_announcement);
        //init_counter();
    });
    $('#field_cantidad_comerciar').on('keyup', function(e)
    {
        change_annoucement_values();
    });
    $('#button_goback_to_announcements').click(function(e)
    {
        activate_tab('#nav-anuncios');
        read_ordenes_anuncios();
    });
    $('#button_trade_init').click(function(e)
    {
        let values =
        {
            field_id_orden_anuncio: $('#field_id_orden_anuncio').val() * 1
            ,field_id_monedas_fiat_precio: $('#field_id_monedas_fiat_precio').val() * 1
            ,field_disponible: $('#field_disponible').val() * 1
            ,field_disponible_billetera: $('#field_disponible_billetera').val() * 1
            ,field_cantidad_comerciar: $('#field_cantidad_comerciar').val() * 1
            ,field_precio: $('#field_precio').val() * 1
            ,field_pago_fiat: $('#field_pago_fiat').val() * 1
            ,type_orden_id: $('#type_orden_id').val() * 1
        }

        // Verify
            if
            (
                values.field_cantidad_comerciar == undefined 
                || values.field_cantidad_comerciar <= 0 
                || values.field_cantidad_comerciar == ''
            )
            {
                AddNotification(`El monto a comerciar no puede ser menor o igual a cero`);
                return;
            }
            if(values.field_cantidad_comerciar > values.field_disponible)
            {
                AddNotification(`El monto a comerciar no puede ser mayor al monto disponible por la contraparte`);
                return;
            }

            if(values.type_orden_id == 2 && values.field_cantidad_comerciar > values.field_disponible_billetera)
            {
                AddNotification(`En la venta el monto a comerciar no puede ser mayor a lo disponible en la billetera`);
                return;
            }
            if(values.type_orden_id == 1)
            {
                panel_comprador();
            }
            else
            {
                panel_vendedor();
            }


        activate_tab('#nav-pago');
        create_trade(values);
    });
    $('#button_subir_pago_pagador').click(function(e)
    {
        let code = $('#field_comprobante_subir').val();
        if(code == "")
        {
            AddNotification(`El c&oacute;digo de comprobante no puede estar vac&iacute;o`);
            return;
        }
        if(code.length < 4)
        {
            AddNotification(`El c&oacute;digo de comprobante no puede ser menor a 4`);
            return;
        }
        load_pay_code();
    });
    const move_to_tab = function()
    {
        const searchParams = new URLSearchParams(window.location.search);
        if(!searchParams.has('trade_id'))
            return;
        
        fetch(`/trade?orden_negociacion_id=${searchParams.get('trade_id')}`, 
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
            $('#text_orden_negociacion_id').val(data[0].orden_negociacion_id);
            $('.type_comercio').text(data[0].orden_tipo);
            $('#type_orden_id').val(data[0].orden_tipo_id);
            $('#text_estado_pagador').text(data[0].orden_estado);
            $('#text_estado_pago_verificador').text(data[0].orden_estado);
            $('#text_codigo_pago_verificador').text(data[0].codigo_comprobacion);

            if(data[0].orden_estado == 'Esperando verificacion del vendedor')
            {
                $('#button_confirmar_pago_verificador').prop('disabled', false);
                $('#button_cancelar_pago').prop('disabled', true);
                activate_tab('#nav-pago');
            }
            else if(data[0].orden_estado == 'Finalizado')
            {
                $('#button_finalizar_pago_pagador').prop('disabled', false);
                activate_tab('#nav-finalizar');
            }
            else
            {
                activate_tab('#nav-pago');
                $('#button_finalizar_pago_pagador').prop('disabled', true);
                $('#button_confirmar_pago_verificador').prop('disabled', true);
                $('#button_cancelar_pago').prop('disabled', false);
            }
            
            read_pay_method();
            if(data[0].orden_tipo == 'Compra' && data[0].usuario_logueado == data[0].usuario_negoceador)
            {
                panel_comprador();
            }
            else if(data[0].orden_tipo == 'Venta' && data[0].usuario_logueado == data[0].usuario_negoceador)
            {
                panel_vendedor();
            }
            if(data[0].orden_tipo == 'Compra' && data[0].usuario_logueado != data[0].usuario_negoceador)
            {
                panel_vendedor();
            }
            else if(data[0].orden_tipo == 'Venta' && data[0].usuario_logueado != data[0].usuario_negoceador)
            {
                panel_comprador();
            }
        })
        .catch(error =>
        {
            AddNotification(`Error al leer el comercio (${error})`)
        });
    }
    move_to_tab();
    $('.button_update_estado_codigo').click(function()
    {
        let orden_negociacion_id = $('#text_orden_negociacion_id').val();
        fetch(`/trade?orden_negociacion_id=${orden_negociacion_id}`, 
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
            $('#text_estado_pagador').text(data[0].orden_estado);
            $('#text_estado_pago_verificador').text(data[0].orden_estado);
            $('#text_codigo_pago_verificador').text(data[0].codigo_comprobacion);

            if(data[0].orden_estado == 'Esperando verificacion del vendedor')
            {
                $('#button_confirmar_pago_verificador').prop('disabled', false);
                $('#button_cancelar_pago').prop('disabled', true);
            }
            if(data[0].orden_estado == 'Finalizado')
            {
                $('#button_finalizar_pago_pagador').prop('disabled', false);
            }
        })
        .catch(error =>
        {
            AddNotification(`Error al leer el comercio (${error})`)
        });
    });
    $('#button_confirmar_pago_verificador').click(function()
    {
        confirm_pay_code();
    });
    $('#button_finalizar_pago_pagador').click(function()
    {
        activate_tab('#nav-finalizar');
    });
    $('#button_valorar').click(function()
    {
        let data =
        {
            orden_negociacion_id: $('#text_orden_negociacion_id').val()
            ,select_valoracion: $('#select_valoracion').val()
        }

        fetch(`/score`, 
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
                AddNotification(`Valoraci&oacute;n a&ntilde;adida. Comercio finalizado.`);
                setTimeout(() =>
                {
                    window.location.href = "comerciar.html";
                }, 1000);
            }
            else
                AddNotification(`Error al a&ntilde;adir la valoraci&oacute;n`)
        })
        .catch(error =>
        {
            AddNotification(`Error al a&ntilde;adir la valoraci&oacute;n (${error})`)
        });
    });


    /*$('#nav-monedas-tab').click(function(e){activate_tab('#nav-monedas')});
    $('#nav-anuncios-tab').click(function(e){activate_tab('#nav-anuncios')});
    $('#nav-negociacion-tab').click(function(e){activate_tab('#nav-negociacion')});
    $('#nav-pago-tab').click(function(e){activate_tab('#nav-pago')});
    $('#nav-finalizar-tab').click(function(e){activate_tab('#nav-finalizar')});*/
});
