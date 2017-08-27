"use strict";

var sinaptic = sinaptic || {};

sinaptic.vm = sinaptic.vm || {};

sinaptic.wf = function () {

    var settings = {
        userId: _spPageContextInfo.userId,
        host: window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl,
        sinistersListName: "Siniestros",
        statusListname: "Estados"
    };

    getStatus();
    getCarriers();
    getWillisUsers();

    // PRIVATE METHODS
    function renderTemplate(target, tpl, data) {
        var source = $(tpl).html();
        var template = Handlebars.compile(source);
        var structure = template(data);
        $(target).html(structure);
    }

    function getWillisUsers() {
        var usersUrl = settings.host + "/_vti_bin/listdata.svc/Usuarios?$expand=Grupo,Usuario&$filter=(Grupo/Identificador eq 1 or Grupo/Identificador eq 4)";
        $.ajax({
            url: usersUrl,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) {
                sinaptic.vm.willisusers = data.d.results;
            },
            error: errorHandler
        });
    }

    function getStatus() {
        var url = settings.host + "/_vti_bin/listdata.svc/Estados";
        $.ajax({
            url: url,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) {
                sinaptic.vm.status = data.d.results;
                console.log("Cargando Estados: OK");
            },
            error: errorHandler
        });
    }

    function getCarriers() {
        var url = settings.host + "/_vti_bin/listdata.svc/Carriers";
        $.ajax({
            url: url,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) {
                sinaptic.vm.carriers = data.d.results;
                console.log("Cargando Carriers: OK");
            },
            error: errorHandler
        });
    }

    function errorHandler(data) {
        console.log("Error: " + data.responseJSON.error);
    }

    //PUBLIC METHODS
    var showCreateSinister = function () {
        var _carriers = [];
        $(sinaptic.vm.carriers).each(function (i, carrier) {
            _carriers.push({ "id": carrier.Identificador, "name": carrier["T\u00EDtulo"] });
        });
        var payload = { carriers: _carriers };
        renderTemplate("#modalsContainer", "#newSinister-template", payload);
        $("#newSinister").modal();
    };

    var showTaskForm = function (siniestro, estadoId) {

        sinaptic.context = { "siniestro": JSON.parse(siniestro), "estado": { "id": estadoId } };
        var responsables = [];
        var teamleaders = [];

        var taskContent = [];
        switch (estadoId) {
            case 21:
                $(sinaptic.vm.willisusers).each(function (i, user) {
                    if (user.Grupo.Identificador === 4) {
                        responsables.push("<option value='");
                        responsables.push(user.Identificador);
                        responsables.push("'>");
                        responsables.push(user.Usuario.Nombre);
                        responsables.push("</option>");
                    }
                    else {
                        teamleaders.push("<option value='");
                        teamleaders.push(user.Identificador);
                        teamleaders.push("'>");
                        teamleaders.push(user.Usuario.Nombre);
                        teamleaders.push("</option>");
                    }
                });
                // RESPONSABLE WILLIS
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Responsable Willis</label>");
                taskContent.push("<select id='responsablewillis' class='form-control'>");
                taskContent.push(responsables.join(""));
                taskContent.push("</select>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                // TEAM LEADER WILLIS
                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Team Leader Willis</label>");
                taskContent.push("<select id='teamleaderwillis' class='form-control'>");
                taskContent.push(teamleaders.join(""));
                taskContent.push("</select>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                break;
            case 22:

      
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<button type='button' data-toggle='collapse' data-target='#comentariosContainer' class='btn btn-warning'>Crear comentario");
				taskContent.push("</div>");
                taskContent.push("<div id='comentariosContainer' class='collapse' style='width:70%'>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
				taskContent.push("</div>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
				taskContent.push("</div>");
				taskContent.push("</div>");//form group de los comentarios

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Formulario 04</label>");
				taskContent.push("</div>");
				
				taskContent.push("<div class='col-md-8'>");
				taskContent.push("<button type='button' onclick='uploadDocument();' class='btn btn-info' class='form-control'>Cargar documento");
				taskContent.push("</div>");
                taskContent.push("</div>");  	//fin form group			  
              
                taskContent.push("<div class='col-md-8' style='padding-left:4px;'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
                taskContent.push("</div>");

                taskContent.push("<div class='col-md-8' style='padding-left:4px;'>");
                taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
                taskContent.push("</div>");
            

                break;
            case 23:
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-12'>");
                taskContent.push("<div class='col-md-6'><label class='control-label'>Documentacion completa?</label></div>");
                taskContent.push("<div class='col-md-6'><label class='radio-inline'><input name='optradio' type='radio' id='docCompletaSi'>SI</label>");
                taskContent.push("<label class='radio-inline'><input type='radio' name='optradio' id='docCompletaNo'>NO</label></div>");
                taskContent.push("</div>");
				
                taskContent.push("</div>");
                break;
            case 24:
                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Tipo de resolución</label>");
                taskContent.push("<select id='teamleaderwillis' class='form-control'>");
                taskContent.push("<option value='1'>Liquidación de saldo deudor</option>");
                taskContent.push("<option value='2'>Reposición de unidad</option>");
                taskContent.push("</select>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<button type='button' data-toggle='collapse' data-target='#comentariosContainer' class='btn btn-warning'>Crear comentario");
                taskContent.push("</div>");
                taskContent.push("<div id='comentariosContainer' class='collapse' style='width:70%'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
                taskContent.push("</div>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
                taskContent.push("</div>");
                taskContent.push("</div>");//form group de los comentarios

                taskContent.push("<div class='col-md-8' style='padding-left:4px;'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
                taskContent.push("</div>");
                taskContent.push("<div class='col-md-8' style='padding-left:4px;'>");
                taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
                taskContent.push("</div>");

                break;
            case 25:
                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Saldo deudor</label>");
                taskContent.push("<div class='input-group'>");
                taskContent.push("<span class='input-group-addon'>$</span>");
                taskContent.push("<input id='saldodeudor' type='number' step='0.01' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Vencimiento de deuda</label>");
                taskContent.push("<input id='vencimientodeuda' type='date' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                break;

            case 26:


                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<button type='button' data-toggle='collapse' data-target='#comentariosContainer' class='btn btn-warning'>Crear comentario");
				taskContent.push("</div>");
                taskContent.push("<div id='comentariosContainer' class='collapse' style='width:70%'>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
				taskContent.push("</div>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
				taskContent.push("</div>");
				taskContent.push("</div>");//form group de los comentarios
				
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Formulario 04</label>");
				taskContent.push("</div>");
				
				taskContent.push("<div class='col-md-8'>");
				taskContent.push("<button type='button' onclick='uploadDocument();' class='btn btn-info' class='form-control'>Cargar documento");
				taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
				taskContent.push("</div>");
				
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
				taskContent.push("</div>");  
                
                taskContent.push("</div>");
        
                break;

            case 27: // informar rendicion plan ovalo


                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Importe a cancelar</label>");
                taskContent.push("<input id='cancelImport' type='number' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Modo de Cancelacion</label>");
                taskContent.push("<select id='cancelationMode' class='form-control'>");
                teamleaders.push("<option>");
                teamleaders.push("TRANSFERENCIA");
                teamleaders.push("</option>");
                taskContent.push("</select>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Fecha de Cacelacion</label>");
                taskContent.push("<input id='cancelDate' type='date' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Numero de Cheque</label>");
                taskContent.push("<input id='checkNumber' type='number' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Comprobante N</label>");
                taskContent.push("<input id='comprobanteNumber' type='number' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");

				taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<button type='button' data-toggle='collapse' data-target='#comentariosContainer' class='btn btn-warning'>Crear comentario");
				taskContent.push("</div>");
                taskContent.push("<div id='comentariosContainer' class='collapse' style='width:70%'>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
				taskContent.push("</div>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
				taskContent.push("</div>");
				taskContent.push("</div>");//form group de los comentarios		
				
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Rendicion del pago</label>");
                taskContent.push("</div>");

                taskContent.push("<div class='col-md-8'>");
				taskContent.push("<button type='button' onclick='uploadDocument();' class='btn btn-info' class='form-control'>Cargar documento");
                taskContent.push("</div>");

                taskContent.push("</div>");
				
               
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
				taskContent.push("</div>");
				
				taskContent.push("<div class='col-md-8'>");
				taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
				taskContent.push("</div>");
             
            


                break;

            case 28: // acreditar fondos a cuenta plan ovalo

				taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<button type='button' data-toggle='collapse' data-target='#comentariosContainer' class='btn btn-warning'>Crear comentario");
				taskContent.push("</div>");
                taskContent.push("<div id='comentariosContainer' class='collapse' style='width:70%'>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
				taskContent.push("</div>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
				taskContent.push("</div>");
				taskContent.push("</div>");//form group de los comentarios
				

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
				taskContent.push("</div>");
				
				taskContent.push("<div class='col-md-8'>");
				taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
				taskContent.push("</div>");
               
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                break;

            case 33: //autorizar reposicion

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Autorizar Reposicion</label>");
                taskContent.push("<input type='checkbox'>");
                taskContent.push("</div>");
                taskContent.push("</div>");

				taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<button type='button' data-toggle='collapse' data-target='#comentariosContainer' class='btn btn-warning'>Crear comentario");
				taskContent.push("</div>");
                taskContent.push("<div id='comentariosContainer' class='collapse' style='width:70%'>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
				taskContent.push("</div>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
				taskContent.push("</div>");
				taskContent.push("</div>");//form group de los comentarios
				

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
				taskContent.push("</div>");
				
				taskContent.push("<div class='col-md-8'>");
				taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
				taskContent.push("</div>");
               
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                break;


            case 35: // Remitir Factura a Plan Ovalo

           
		   
				taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<button type='button' data-toggle='collapse' data-target='#comentariosContainer' class='btn btn-warning'>Crear comentario");
				taskContent.push("</div>");
                taskContent.push("<div id='comentariosContainer' class='collapse' style='width:70%'>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
				taskContent.push("</div>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
				taskContent.push("</div>");
				taskContent.push("</div>");//form group de los comentarios
				
		   
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-4'>");
                taskContent.push("<label class='control-label'>Factura</label>");
                //taskContent.push("<button type='button' onclick='uploadDocument();' value='Cargar documento' class='btn btn-info' class='form-control'>");

                taskContent.push("<input id= 'my-attachments' value='Cargar documento' type= 'file' fileread='run.AttachmentData' fileinfo= 'run.AttachmentInfo' />");

                taskContent.push("</div>");
                taskContent.push("</div>");

				
				
	
				
				taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
				taskContent.push("</div>");
				
				taskContent.push("<div class='col-md-8'>");
				taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
				taskContent.push("</div>");
               
                taskContent.push("</div>");
				
                taskContent.push("</div>");
                break;

            case 39: // verificar nueva Prenda

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Titulo</label>");
                taskContent.push("<input id='title' type='text' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Grupo</label>");
                taskContent.push("<input id='group' type='text' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Orden</label>");
                taskContent.push("<input id='orden' type='text' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>ID siniestro</label>");
                taskContent.push("<input id='idSinister' type='text' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");


                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Verificar Prenda</label>");
                taskContent.push("<input type='checkbox' id='verifyPrenda'>");
                taskContent.push("</div>");
                taskContent.push("</div>");

				
            	taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<button type='button' data-toggle='collapse' data-target='#comentariosContainer' class='btn btn-warning'>Crear comentario");
				taskContent.push("</div>");
                taskContent.push("<div id='comentariosContainer' class='collapse' style='width:70%'>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
				taskContent.push("</div>");
				taskContent.push("<div class='col-md-8'>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
				taskContent.push("</div>");
				
				taskContent.push("</div>");//form group de los comentarios

                break;
        }
        taskContent = taskContent.join("");
        renderTemplate("#modalsContainer", "#modalTask-template", sinaptic.context);

        $("#taskcontent").append(taskContent);
        applyContentFormatters();
        $("#modaltask").modal();
    };

    function applyContentFormatters() {
        $("#saldodeudor").on("input", function () {
            var v = $(this).val(), vc = v.replace(/[^0-9,\.]/, '');
            if (v !== vc)
                $(this).val(vc);
        });
    }

    var createSinister = function () {
		
        var vencimiento = getEndStateDate(21);


        var nuevoSiniestro = {
            Siniestro: $("#newSinister_siniestro").val(),
            Grupo: $("#newSinister_grupo").val(),
            Orden: $("#newSinister_orden").val(),
            CarrierId: $("#newSinister_carrier").val(),
            Tomador: $("#newSinister_tomador").val(),
            FechaSiniestro: $("#newSinister_fechaSiniestro").val() +"T00:00:00",
            TipoDeSiniestroValue: $("#newSinister_tipoSiniestro").val(),
            ModeloVehiculo: $("#newSinister_modeloVehiculo").val(),
            Dominio: $("#newSinister_dominio").val(),
            SumaAsegurada : $("#newSinister_suma").val(),
            MailCliente: $("#newSinister_mailCliente").val(),
            TelCliente: $("#newSinister_telCliente").val(),
            MailCia: $("#newSinister_mailCia").val(),
            TelCia: $("#newSinister_telCia").val(),
            VencimientoEstado: vencimiento,
            EstadoId: 21 //ASIGNACIÓN DE RESPONSABLE
        };
        sinaptic.wf.validateForm(nuevoSiniestro, 0, function () {
            $.ajax({
                url: settings.host + "/_vti_bin/listdata.svc/" + settings.sinistersListName,
                type: "POST",
                processData: false,
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(nuevoSiniestro),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    //console.log("Siniestro Creado: " + data.d);
                    alert("Siniestro Creado: " + nuevoSiniestro.Siniestro);
                  
                    //window.location.reload();
                },
                error: errorHandler
            })
        }, errorHandler);
    };

    var addComment = function (estadoId) {
        $("#estado" + estadoId + "comentarios").css("display", "none");
        $("#estado" + estadoId + "acciones").css("display", "inline");
    };

    var showAddComment = function (estadoId) {
        $("#estado" + estadoId + "comentarios").css("display", "inline");
        $("#estado" + estadoId + "acciones").css("display", "none");
    };


    var getEndStateDate = function (estadoId) {

        var vencimiento = "";
        switch (estadoId) {
            case 21:
                $.each(sinaptic.vm.status, function (key, object) {
                    if (object.Identificador === 21) {
                        var fechaInicial = $("#newSinister_fechaSiniestro").val();
                        var diasHastaVencer = parseInt(object.Alerta1);
                        var fecha = new Date(fechaInicial);
                        fecha = new Date(fecha.setDate(fecha.getDate() + diasHastaVencer));

                        var dia = fecha.getDate();
                        if (dia < 10) {
                            dia = "0" + dia;
                        }

                        var mes = (parseInt(fecha.getMonth()) + 1);
                        if (mes < 10) {
                            mes = "0" + mes;
                        }

                        vencimiento = fecha.getFullYear() + "-" + mes + "-" + dia + "T00:00:00";
                    }
                });

                break;
        }

        return vencimiento;
    }

    var getSiniestro = function (currentSinisterName) {

        var url = settings.host + "/_vti_bin/listdata.svc/Siniestros?$filter=Siniestro eq '"+ currentSinisterName +"'";
        $.ajax({
            url: url,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) {
                var sinisterId = data.d.results[0].Identificador;
                var sinisterState = data.d.results[0].EstadoId;
                updateSinister(sinisterId, sinisterState);
            },
            error: errorHandler
        });
    }


    var updateSinister = function (sinisterId, sinisterState) {
        var asignacionIds = {
            EstadoId: sinisterState + 1
        };

        $.ajax({
            url: settings.host + "/_vti_bin/listdata.svc/" + settings.sinistersListName + "(" + sinisterId + ")",
            type: "POST",
            processData: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(asignacionIds),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "MERGE",
                "If-Match": "*"
            },
            success: function (data) {
                
                switch (sinisterState) {
                    case 21:
                        var properties = {   
                            ResponsableId: $("#responsablewillis").val(),
                            TeamLeaderId: $("#teamleaderwillis").val()
                        }

                        lastUpdate_(properties, sinisterId);

                        break;
                    case 22:
                         //estado que posee comentario y adjunto, no tiene campos de llenado
                    
                        alert("Estado actualizado.")
                        window.location.reload();
                        break;

                    case 23:
                        // posee 2 radio button,comentario y adjunto, no tiene campos de llenado
                        var isCompleted = false;

                        if ($("input#docCompletaSi")[0].checked === true) {
                            isCompleted = true;
                        }

                        var properties = {
                            DocCertCompleta: isCompleted
                        }

                        lastUpdate_(properties, sinisterId);

                        break;

                    case 24:
                        //var resolucion = $("#teamleaderwillis option:selected").text();

                        //var properties = {
                        //    //TipoDeResulociónValue: resolucion
                        //}

                        //lastUpdate_(properties, sinisterId);

                        alert("Estado actualizado.")
                        window.location.reload();
                        //falta comentario

                        break;

                    case 25:

                        var properties = {
                            SaldoPendiente: $("#saldodeudor").val(),
                            VencimientoDeuda: $("#vencimientodeuda").val()
                        }

                        lastUpdate_(properties, sinisterId);
                        break;

                    case 26:
                     
                        alert("Estado actualizado.")
                        window.location.reload();
                           //falta comentario y adjunto
                        break;

                    case 27:

                        //var properties = {
                        //    //TipoDeResulociónValue: resolucion
                        //}

                        //lastUpdate_(properties, sinisterId);

                        alert("Estado actualizado.")
                        window.location.reload();
                      
                        break;

                    case 28:

                        alert("Estado actualizado.")

                        break;

                    case 29:

                        alert("Estado actualizado.")

                        break;

                    case 30:

                        alert("Estado actualizado.")

                        break;

                    case 31:


                        alert("Estado actualizado.")


                        break;

                    case 32:


                        alert("Estado actualizado.")


                        break;

                    case 33:


                        alert("Estado actualizado.")

                        break;

                    case 34:


                        alert("Estado actualizado.")

                        break;

                    case 35:


                        alert("Estado actualizado.")

                        break;

                    case 36:

                        alert("Estado actualizado.")
                       
                        break;

                    case 37:

                        alert("Estado actualizado.")
                        
                        break;

                    case 38:

                        alert("Estado actualizado.")
                        
                        break;

                    case 39:

                        alert("Estado actualizado.")

                        break;

                    case 40:

                        alert("Estado actualizado.")
             
                        break;

                    case 41:

                        alert("Estado actualizado.")

                        break;

                    case 42:

                        alert("Estado actualizado.")
                     
                        break;

                }
            },
            error: errorHandler
        });

    }

    var lastUpdate_ = function (properties, sinisterId) {

        $.ajax({
            url: settings.host + "/_vti_bin/listdata.svc/" + settings.sinistersListName + "(" + sinisterId + ")",
            type: "POST",
            processData: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(properties),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "MERGE",
                "If-Match": "*"
            },
            success: function (data) {
                alert("Siniestro actualizado correctamente.");
                window.location.reload();
            },
                error: errorHandler
        });
    }


    var completeTask = function (estadoId) {

        switch (estadoId) {
            case 21:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 22:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 23:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);

                break;

            case 24:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 25:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 26:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 27:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 28:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 29:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 30:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 31:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 32:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 33:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 34:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 35:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 36:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 37:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 38:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 39:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 40:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 41:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;

            case 42:
                var currentSinisterName = $("#siniestronombre").text().trim();
                getSiniestro(currentSinisterName);
                break;


        };
    }

    return {
        createSinister: createSinister,
        showTaskForm: showTaskForm,
        showCreateSinister: showCreateSinister,
        addComment: addComment,
        completeTask: completeTask
    };
}();