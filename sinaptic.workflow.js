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

    loadDropZone();
    loadSpSrvcs();

    // PRIVATE METHODS
    function loadDropZone() {
        $.ajax({
            url: "https://cdnjs.cloudflare.com/ajax/libs/dropzone/5.1.1/min/dropzone.min.js",
            dataType: "script",
            success: function (data) {
                console.log("DropZone.js loaded - OK");
            }
        });
    }

    // PRIVATE METHODS
    function loadSpSrvcs() {
        $.ajax({
            url: "https://cdnjs.cloudflare.com/ajax/libs/jquery.SPServices/2014.02/jquery.SPServices.min.js",
            dataType: "script",
            success: function (data) {
                console.log("SpServices.js loaded - OK");
            }
        });
    }

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
        console.log("Error: " + data.responseText);
    }

    function applyContentFormatters() {
        $("#saldodeudor").on("input", function () {
            var v = $(this).val(), vc = v.replace(/[^0-9,\.]/, '');
            if (v !== vc)
                $(this).val(vc);
        });
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
        sinaptic.vm.currentSinister = JSON.parse(siniestro);
        var responsables = [];
        var teamleaders = [];
        var startDropZone = false;
        var dropZoneMessage = "";
        var taskContent = [];
        switch (estadoId) {
            case 21:
                $(sinaptic.vm.willisusers).each(function (i, user) {
                    if (user.Grupo.Identificador === 4) {
                        responsables.push("<option value='");
                        responsables.push(user.Usuario.Identificador);
                        responsables.push("'>");
                        responsables.push(user.Usuario.Nombre);
                        responsables.push("</option>");
                    }
                    else {
                        teamleaders.push("<option value='");
                        teamleaders.push(user.Usuario.Identificador);
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
            case 22: // Procesar Formularios y Certificado

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Formulario 04</label>");
                taskContent.push("<div id='dropzone' class='dropzone'>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                startDropZone = true;
                dropZoneMessage = "Arrastre o haga click para seleccionar el Formulario 04";
                break;
            case 23:
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-12'>");
                taskContent.push("<div class='col-md-6'><label class='control-label'>¿Documentación completa?</label></div>");
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
                
                taskContent.push('<div class="table table-striped" class="files" id="previews">');
                taskContent.push(' <div id="template" class="file-row">');
                taskContent.push('<div>');
                taskContent.push(' <span class="preview"><img data-dz-thumbnail /></span>');
                taskContent.push('</div>');
                taskContent.push('<div>');
                taskContent.push('<p class="name" data-dz-name></p>');
                taskContent.push('<strong class="error text-danger" data-dz-errormessage></strong>');
                taskContent.push('</div>');
                taskContent.push('<div>');
                taskContent.push('<p class="size" data-dz-size></p>');
                taskContent.push('<div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">');
                taskContent.push('<div class="progress-bar progress-bar-success" style="width:0%;" data-dz-uploadprogress></div>');
                taskContent.push('</div>');
                taskContent.push('</div>');
                taskContent.push('<div>');
                taskContent.push('<button type="button" class="btn btn-primary start">');
                taskContent.push('<i class="glyphicon glyphicon-upload"></i>');
                taskContent.push('<span>Start</span>');
                taskContent.push(' </button>');
                taskContent.push('<button type="button" data-dz-remove class="btn btn-warning cancel">');
                taskContent.push('<i class="glyphicon glyphicon-ban-circle"></i>');
                taskContent.push('<span>Cancel</span>');
                taskContent.push('</button>');
                taskContent.push('<button type="button" data-dz-remove class="btn btn-danger delete">');
                taskContent.push('<i class="glyphicon glyphicon-trash"></i>');
                taskContent.push('<span>Delete</span>');
                taskContent.push('</button>');
                taskContent.push('</div>');
                taskContent.push('</div>');
                taskContent.push('</div>');
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
                taskContent.push("<div class='col-md-12'>");

                taskContent.push("<div class='col-md-4'>");
                taskContent.push("<button type='button' value='Crear comentario' onclick='$(#comentariosContainer).css('display','')' class='btn btn-warning'>");
                taskContent.push("<div id='comentariosContainer' style='display:none;'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-4'>");
                taskContent.push("<label class='control-label'>Formulario 04</label>");
                taskContent.push("<button type='button' onclick='uploadDocument();' value='Cargar documento' class='btn btn-info' class='form-control'>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-4'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
                taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
                taskContent.push("</div>");
                taskContent.push("</div>");
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
                taskContent.push("<label class='control-label'>Modo de Cancelación</label>");
                taskContent.push("<select id='cancelationMode' class='form-control'>");
                teamleaders.push("<option>");
                teamleaders.push("TRANSFERENCIA");
                teamleaders.push("</option>");
                taskContent.push("</select>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Fecha de Cacelación</label>");
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
                taskContent.push("<label class='control-label'>Comprobante Nº</label>");
                taskContent.push("<input id='comprobanteNumber' type='number' class='form-control'/>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<button type='button' value='Crear comentario' onclick='$(#comentariosContainer).css('display','')' class='btn btn-warning'>");
                taskContent.push("<div id='comentariosContainer' style='display:none;'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Rendición del pago</label>");
                taskContent.push("<button type='button' onclick='uploadDocument();' value='Cargar documento' class='btn btn-info' class='form-control'>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-4'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
                taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");


                break;

            case 28: // acreditar fondos a cuenta plan ovalo

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<button type='button' value='Crear comentario' onclick='$(#comentariosContainer).css('display','')' class='btn btn-warning'>");
                taskContent.push("<div id='comentariosContainer' style='display:none;'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-4'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
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
                taskContent.push("<button type='button' value='Crear comentario' onclick='$(#comentariosContainer).css('display','')' class='btn btn-warning'>");
                taskContent.push("<div id='comentariosContainer' style='display:none;'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-4'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
                taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                break;


            case 35: // Remitir Factura a Plan Ovalo

                taskContent.push("<div class='form-group'>");

                taskContent.push("<div class='col-md-4'>");
                taskContent.push("<button type='button' value='Crear comentario' onclick='$(#comentariosContainer).css('display','')' class='btn btn-warning'>");
                taskContent.push("<div id='comentariosContainer' style='display:none;'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-4'>");
                taskContent.push("<label class='control-label'>Factura</label>");
                taskContent.push("<button type='button' onclick='uploadDocument();' value='Cargar documento' class='btn btn-info' class='form-control'>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                taskContent.push(" <div class='form-group'>");
                taskContent.push("<div class='col-md-4'>");
                taskContent.push("<label class='control-label'>Link de Control de Siniestro</label>");
                taskContent.push("<a href=''>Ver siniestro de tarea en el Panel de Control de Siniestros</a>");
                
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                break;

            case 39: // verificar nueva Prenda

                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Título</label>");
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
                taskContent.push("<button type='button' value='Crear comentario' onclick='$(#comentariosContainer).css('display','')' class='btn btn-warning'>");
                taskContent.push("<div id='comentariosContainer' style='display:none;'>");
                taskContent.push("<label class='control-label'>Comentario</label>");
                taskContent.push("<textarea id='comentario' class='form-control'>");
                taskContent.push("</textarea>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");

                break;
        }
        taskContent = taskContent.join("");
        renderTemplate("#modalsContainer", "#modalTask-template", sinaptic.context);

        $("#taskcontent").append(taskContent);
        applyContentFormatters();

        $("#modaltask").modal();

        if (startDropZone) {
            $("#dropzone").dropzone({
                url: "#",
                autoProcessQueue: false,
                maxFiles: 1,
                addRemoveLinks: true,
                dictDefaultMessage: dropZoneMessage,
                dictRemoveFile: "Quitar",
                dictMaxFilesExceeded: "No puede subir mas de un documento"
            });
        }
     
    };


    //dropzone
    function getFile() {
        var file = "";
        for (var i = 0; i < $("#dropzone")[0].dropzone.files.length; i++) {
            file = $("#dropzone")[0].dropzone.files[i];
            singleUpload(file);
        }
    }

    function singleUpload (file) {
        var reader = new FileReader();
        var currFile = file;
        reader.readAsArrayBuffer(currFile);

        var reqExecutor = new SP.RequestExecutor(appWebUrl);

        reader.onload = (function (theFile) { // (IIFE) Immediately-Invoked Function Expression
            return function (e) {
                var fileData = aryBufferToBase64(e.target.result);
                PerformUpload("Legajos", file.name, sinaptic.vm.currentSinister.Identificador, fileData);
            };

        })(currFile);

    };

    function PerformUpload(libraryName, fileName, folderName, fileData) {
        var url;
        var appWebUrl = settings.host;
        //var ServerRelativeURL = "/sites/DevSite/Shared%20Documents";
        //url = appWebUrl + "/_api/web/GetFolderByServerRelativeUrl('" + ServerRelativeURL + "')/Files/add(url='" + fileName + "',overwrite='true')";

        // if there is no folder name then just upload to the root folder
        if (folderName == "") {
            url = appWebUrl + "/_api/SP.AppContextSite(@TargetSite)/web/lists/getByTitle(@TargetLibrary)/RootFolder/Files/add(url=@TargetFileName,overwrite='true')?" +
                "@TargetSite='" + targetSiteUrl + "'" +
                "&@TargetLibrary='" + libraryName + "'" +
                "&@TargetFileName='" + fileName + "'";
        }
        else {
            // if there is a folder name then upload into this folder
            url = appWebUrl + "/_api/SP.AppContextSite(@TargetSite)/web/lists/getByTitle(@TargetLibrary)/RootFolder/folders(@TargetFolderName)/files/add(url=@TargetFileName,overwrite='true')?" +
               "@TargetSite='" + targetSiteUrl + "'" +
               "&@TargetLibrary='" + libraryName + "'" +
               "&@TargetFolderName='" + folderName + "'" +
               "&@TargetFileName='" + fileName + "'";
        }

        //DBGIN
        console.log(url);

        // use the request executor (cross domain library) to perform the upload
        var reqExecutor = new SP.RequestExecutor(appWebUrl);
        reqExecutor.executeAsync({
            url: url,
            method: "POST",
            headers: {
                "Accept": "application/json; odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            contentType: "application/json;odata=verbose",
            binaryStringRequestBody: true,
            body: fileData,
            success: function (err) {
                alert("Success! Your file was uploaded to SharePoint.");
            },
            error: function (err) {
                //alert("Oooooops... it looks like something went wrong uploading your file.");
                console.log(x.message);
                console.log(y); console.log(z);
            }
        });
    }

     function aryBufferToBase64 (buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    var createSinister = function () {
        var vencimiento = getDueDates(21).alertDate1.toJSON();
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
                    console.log("Siniestro Creado: " + nuevoSiniestro.Siniestro);                 
                    sinaptic.posa.refresh();
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

    var getDueDates = function (estadoId) {
        var alertDates = {};
        $.each(sinaptic.vm.status, function (key, status) {
            if (status.Identificador === estadoId) {
                var alert1 = status.Alerta1;
                var alertDate1 = new Date();
                alertDate1 = new Date(alertDate1.setDate(alertDate1.getDate() + alert1));
                alertDates.alertDate1 = alertDate1;

                var alert2 = status.Alerta2;
                var alertDate2 = new Date();
                alertDate2 = new Date(alertDate2.setDate(alertDate2.getDate() + alert2));
                alertDates.alertDate2 = alertDate2;
                return false;
            }
        });

        return alertDates;
    }

    function createHistorial(payload, callback) {
        $.ajax({
            url: settings.host + "/_vti_bin/listdata.svc/Historial",
            type: "POST",
            processData: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(payload),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                console.log("Historial de Siniestro Creado: " + data.Identificador);
                callback(data);

            },
            error: errorHandler
        })
    }

    function closeStatusById(id) {
        var toDate = { "FechaHasta": new Date().toJSON() };
        $.ajax({
            url: settings.host + "/_vti_bin/listdata.svc/Historial(" + id + ")",
            type: "POST",
            processData: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(toDate),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "MERGE",
                "If-Match": "*"
            },
            success: function (data) {
                console.log("Historial de siniestro cerrado correctamente");
            },
            error: errorHandler
        });
    }

    function updateSinister(sinisterId, payload) {
        $.ajax({
            url: settings.host + "/_vti_bin/listdata.svc/" + settings.sinistersListName + "(" + sinisterId + ")",
            type: "POST",
            processData: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(payload),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "MERGE",
                "If-Match": "*"
            },
            success: function (data) {
                console.log("Siniestro actualizado");
                sinaptic.posa.refresh();
            },
            error: errorHandler
        });
    }

    function loadDocumentFile(statusId) {
        var idfolder = sinaptic.vm.currentSinister.identificador
        var libraryName = "Legajos";
        var contentType = "";
        switch (statusId) {
            case 22:
                contentType = ""; // Acá va el content type correspondiente a Formulario 04
            default:

        }
        // TODO: Hacer que obtenga los archivos del dropzone (#dropzone) y subirlos a la biblioteca correspondiente
    }

    var updateStatusChange = function (payload) {
        var sinisterId = sinaptic.vm.currentSinister.identificador;
        var idHistorial = sinaptic.vm.currentSinister.idhistorial;
        var nextStatus = payload.EstadoId;
        var historyPayload = { "SiniestroId": sinisterId, "EstadoId": nextStatus, "FechaDesde": new Date().toJSON() };
        if (idHistorial != undefined && idHistorial != null) {
            closeStatusById(idHistorial);
            createHistorial(historyPayload, function (data) {
                payload.IdHistorial = data.d.Identificador;
                var dueDate = getDueDates(payload.EstadoId);
                payload.VencimientoEstado = dueDate.alertDate1.toJSON();
                updateSinister(sinisterId, payload);
            });
        }

    }

    var completeTask = function (estadoId) {
        switch (estadoId) {
            case 21:
                var payload = {
                    ResponsableId: $("#responsablewillis").val(),
                    TeamLeaderId: $("#teamleaderwillis").val(),
                    EstadoId: 22
                };
                updateStatusChange(payload);         
                break;
            case 22:
                loadDocumentFile(22);
                var payload = {
                    EstadoId: 23
                };
                updateStatusChange(payload);
                getFile();
                break;
            case 25:
                var payload = {
                    SaldoPendiente: $("#saldodeudor").val(),
                    VencimientoDeuda: $("#vencimientodeuda").val(),
                    EstadoId: 26
                };
                updateStatusChange(payload);
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