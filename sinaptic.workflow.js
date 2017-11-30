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
            headers: {
                "accept": "application/json;odata=verbose"
            },
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
            headers: {
                "accept": "application/json;odata=verbose"
            },
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
            headers: {
                "accept": "application/json;odata=verbose"
            },
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

    function showError(data) {
        alert( data.responseText);
    }

    function applyContentFormatters() {
        $("#saldodeudor").on("input", function () {
            var v = $(this).val(),
                vc = v.replace(/[^0-9,\.]/, '');
            if (v !== vc)
                $(this).val(vc);
        });
    }

    //PUBLIC METHODS
    var showCreateSinister = function () {
        var _carriers = [];
        $(sinaptic.vm.carriers).each(function (i, carrier) {
            _carriers.push({
                "id": carrier.Identificador,
                "name": carrier["T\u00EDtulo"]
            });
        });
        var payload = {
            carriers: _carriers
        };
        renderTemplate("#modalsContainer", "#newSinister-template", payload);
        $("#newSinister > div > div > div.modal-footer > button.btn.btn-success").attr("data-dismiss", "");
        $("#newSinister").modal();
    };

    var showTaskForm = function (siniestro, estadoId) {

        sinaptic.context = {
            "siniestro": JSON.parse(siniestro),
            "estado": {
                "id": estadoId
            }
        };
        sinaptic.vm.currentSinister = JSON.parse(siniestro);
        var responsables = [];
        var teamleaders = [];
        var startDropZone = false;
        var dropZoneMessage = "";
        var taskContent = [];
        var siniesterInfo = [];
        var rejectMessage = [];
        var buttons = [];
        var infoHeight = 0;

        buttons.push('<button style="float:left;" type="button" id="showComment" class="btn btn-warning"> Crear comentario </button>');
        buttons.push('<button style="float:left;" type="button" id="showAttach" class="btn btn-info"> Adjuntar doc </button>');
        if (estadoId === 25 || estadoId === 28 || estadoId === 29 || estadoId === 33 || estadoId === 36) {
            buttons.push('<button type="button" onclick="sinaptic.wf.completeTask(' + estadoId + ')" class="btn btn-success">Aceptar Tarea</button>');
            buttons.push('<button type="button" onclick="sinaptic.wf.showRejectTask(' + estadoId + ')" class="btn btn-danger">Rechazar Tarea</button>');
            buttons.push('<button style="margin-top: 12px;" type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>');           
        }
        else{
            buttons.push('<button type="button" onclick="sinaptic.wf.completeTask(' + estadoId + ')" class="btn btn-success">Completar Tarea</button>');
            buttons.push('<button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>');
        }
        if (sinaptic.vm.currentSinister.motivoRechazo !== undefined && sinaptic.vm.currentSinister.motivoRechazo !== null && sinaptic.vm.currentSinister.motivoRechazo !== "") {
            rejectMessage.push('<div class="rejectMessage">' + sinaptic.vm.currentSinister.motivoRechazo + '</div>');
        }

        switch (estadoId) {
            case 21:
                $(sinaptic.vm.willisusers).each(function (i, user) {
                    if (user.Grupo.Identificador === 4) {
                        responsables.push("<option value='");
                        responsables.push(user.Usuario.Identificador);
                        responsables.push("'>");
                        responsables.push(user.Usuario.Nombre);
                        responsables.push("</option>");
                    } else {
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
                taskContent.push("<select id='tipoResolucion' class='form-control'>");
                taskContent.push("<option value='1'>Liquidación de saldo deudor</option>");
                taskContent.push("<option value='2'>Reposición de unidad</option>");
                taskContent.push("</select>");
                taskContent.push("</div>");
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

            case 26:  // Informar saldo deudor a compañía
                siniesterInfo.push("<div class='col-md-12' style='height:10px;'></div>");
                siniesterInfo.push("<div class='col-md-4'>");
                siniesterInfo.push("<label>Saldo Deudor</label>");
                siniesterInfo.push("<div class='sinisterDataItem sinisterId' id='siniestrosaldo'>");
                siniesterInfo.push(sinaptic.vm.currentSinister.saldopendiente);
                siniesterInfo.push("</div>");
                siniesterInfo.push("</div>");

                siniesterInfo.push("<div class='col-md-8'>");
                siniesterInfo.push("<label>Vencimiento de deuda</label>");
                siniesterInfo.push("<div class='sinisterDataItem sinisterId' id='siniestrosaldovenc'>");
                siniesterInfo.push(sinaptic.vm.currentSinister.vencimientodeuda);
                siniesterInfo.push("</div>");
                siniesterInfo.push("</div>");
                infoHeight = 110;
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
                taskContent.push("<option value='Transferencia'>");
                taskContent.push("Transferencia");
                taskContent.push("</option>");
                taskContent.push("<option value='Cheque'>");
                taskContent.push("Cheque");
                taskContent.push("</option>");
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
                taskContent.push("<label class='control-label'>Rendición del pago</label>");
                taskContent.push("<div id='dropzone' class='dropzone'>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                startDropZone = true;
                dropZoneMessage = "Arrastre o haga click para seleccionar la rendición del pago";
                break;
                infoHeight = 150;
                break;

            case 28: // acreditar fondos a cuenta plan ovalo

                siniesterInfo.push("<div class='col-md-12' style='height:10px;'></div>");
                siniesterInfo.push("<div class='col-md-4'>");
                siniesterInfo.push("<label>Carrier</label>");
                siniesterInfo.push("<div class='sinisterDataItem sinisterId' id='iniestrocarrier'>");
                siniesterInfo.push(sinaptic.vm.currentSinister.carrier);
                siniesterInfo.push("</div>");
                siniesterInfo.push("</div>");

                siniesterInfo.push("<div class='col-md-4'>");
                siniesterInfo.push("<label>Importe a cancelar</label>");
                siniesterInfo.push("<div class='sinisterDataItem sinisterId' id='siniestroimporteacaancelar'>");
                siniesterInfo.push(sinaptic.vm.currentSinister.saldopendiente);
                siniesterInfo.push("</div>");
                siniesterInfo.push("</div>");

                siniesterInfo.push("<div class='col-md-4'>");
                siniesterInfo.push("<label>Modo de cancelación</label>");
                siniesterInfo.push("<div class='sinisterDataItem sinisterId' id='siniestromodocancelacion'>");
                siniesterInfo.push(sinaptic.vm.currentSinister.modocancelacion);
                siniesterInfo.push("</div>");
                siniesterInfo.push("</div>");

                siniesterInfo.push("<div class='col-md-12' style='height:10px;'></div>");
                siniesterInfo.push("<div class='col-md-4'>");
                siniesterInfo.push("<label>Fecha de cancelación</label>");
                siniesterInfo.push("<div class='sinisterDataItem sinisterId' id='siniestrofechacancelacion'>");
                siniesterInfo.push(sinaptic.vm.currentSinister.fechadecancelacion);
                siniesterInfo.push("</div>");
                siniesterInfo.push("</div>");

                siniesterInfo.push("<div class='col-md-4'>");
                siniesterInfo.push("<label>Número de cheque</label>");
                siniesterInfo.push("<div class='sinisterDataItem sinisterId' id='siniestronumerocheque'>");
                siniesterInfo.push(sinaptic.vm.currentSinister.numerodecheque ? sinaptic.vm.currentSinister.numerodecheque : 0);
                siniesterInfo.push("</div>");
                siniesterInfo.push("</div>");

                siniesterInfo.push("<div class='col-md-4'>");
                siniesterInfo.push("<label>Comprobante número</label>");
                siniesterInfo.push("<div class='sinisterDataItem sinisterId' id='siniestrocomprobantenro'>");
                siniesterInfo.push(sinaptic.vm.currentSinister.comprobantenumero);
                siniesterInfo.push("</div>");
                siniesterInfo.push("</div>");
                break;
            case 33: //Autorizar reposicion
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-12'>");
                taskContent.push("<div class='col-md-6'><label class='control-label'>¿Autorizar Reposicion?</label></div>");
                taskContent.push("<div class='col-md-6'><label class='radio-inline'><input name='optradio' type='radio' id='autRepoSi'>SI</label>");
                taskContent.push("<label class='radio-inline'><input type='radio' name='optradio' id='autRepoNo'>NO</label></div>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                break;
            case 35: //Remitir factura a plan Ovalo
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-8'>");
                taskContent.push("<label class='control-label'>Factura de nueva unidad</label>");
                taskContent.push("<div id='dropzone' class='dropzone'>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                startDropZone = true;
                dropZoneMessage = "Arrastre aquí o haga click para seleccionar la Factura de la nueva unidad";
                break;

            case 39: // Verificar nueva prenda
                taskContent.push("<div class='form-group'>");
                taskContent.push("<div class='col-md-12'>");
                taskContent.push("<div class='col-md-6'><label class='control-label'>¿Verificar nueva prenda?</label></div>");
                taskContent.push("<div class='col-md-6'><label class='radio-inline'><input name='optradio' type='radio' id='verifPrendaSi'>SI</label>");
                taskContent.push("<label class='radio-inline'><input type='radio' name='optradio' id='verifPrendaNo'>NO</label></div>");
                taskContent.push("</div>");
                taskContent.push("</div>");
                break;
        }
        renderTemplate("#modalsContainer", "#modalTask-template", sinaptic.context);
        if (siniesterInfo.length > 0) {
            siniesterInfo = siniesterInfo.join("");
            $("#taskcontent > div.sinisterInfo").append(siniesterInfo);
            $(".sinisterInfo").css("height", infoHeight);
        }
        taskContent = taskContent.join("");
        $("#taskcontent").append(taskContent);
        applyContentFormatters();
        if (rejectMessage.length > 0) {
            $(".sinisterInfo").after(rejectMessage.join(""));
        }
        $("#modaltask > div > div > div.modal-footer").html(buttons.join(""));
        $("#modaltask").modal();
        if (startDropZone) {
            $("#dropzone").dropzone({
                url: "#",
                autoProcessQueue: false,
                maxFiles: 1,
                addRemoveLinks: true,
                dictDefaultMessage: dropZoneMessage,
                dictRemoveFile: "Quitar",
                dictMaxFilesExceeded: "No puede subir mas de un documento",
                init: function () {
                    this.on("sending", function (file, xhr, data) {
                        if (file.fullPath) {
                            data.append("fullPath", file.fullPath);
                        }
                    });
                }
            });
        }
        $("#dropzoneCommon").dropzone({
            url: "#",
            autoProcessQueue: false,
            maxFiles: 5,
            addRemoveLinks: true,
            dictDefaultMessage: "Arrastre aqui o haga click para seleccionar archivos",
            dictRemoveFile: "Quitar",
            dictMaxFilesExceeded: "No puede subir mas de 5 documentos en simultaneo",
            init: function () {
                this.on("sending", function (file, xhr, data) {
                    if (file.fullPath) {
                        data.append("fullPath", file.fullPath);
                    }
                });
            }
        });

        $("#showComment").on("click", function () {
            $('#comentariosContainer').toggle();
        });

        $("#showAttach").on("click", function () {

            $('#attachContainer').toggle();
        });

        $("#uploadFile").on("click", function () {
            getFile("#dropzoneCommon");
            $('#attachContainer').toggle();
        });

        $("#saveComment").on("click", function () {
            $("#comentario").prop("disabled", true);
            $("#saveComment").prop("disabled", true);
            saveComment();
        });
    };

    //dropzone
    function getFile(selector) {
        var file = "";
        for (var i = 0; i < $(selector)[0].dropzone.files.length; i++) {
            file = $(selector)[0].dropzone.files[i];
            sinaptic.vm.uploadingFileName = file.name;
            UploadMe(file);
        }
        $(selector)[0].dropzone.removeAllFiles();
    }

    function UploadMe(readFile) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(readFile);
        reader.onprogress = updateProgress;
        reader.onload = loaded;
        reader.onerror = errorHandler;
    }

    function Upload(txtContent, destinationUrl) {
        var jsStream = arrayBufferToBase64(txtContent);
        var soapEnv = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
                      + "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
                      + "<soap:Body>"
                      + "<CopyIntoItems xmlns=\"http://schemas.microsoft.com/sharepoint/soap/\">"
                      + "<SourceUrl>http://null</SourceUrl>"
                      + "<DestinationUrls><string>" + destinationUrl + "</string></DestinationUrls>"
                      + "<Fields><FieldInformation Type='File' /></Fields>"
                      + "<Stream>" + jsStream + "</Stream>"
                      + "</CopyIntoItems>"
                      + "</soap:Body>"
                      + "</soap:Envelope>";
        jQuery.ajax({
            url: settings.host + "/_vti_bin/copy.asmx",
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            beforeSend: function (xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/CopyIntoItems'); },
            contentType: "text/xml; charset=\"utf-8\"",
            success: function (data) {
                console.log("Documento adjuntado correctamente");
            },
            error: function (err) {
                alert("No se pudo adjuntar el documento: " + err.responseText);
                console.log("No se pudo creae el documento: " + err.responseText);
            },
        });
    }

    function loaded(evt) {
        var fileString = evt.target.result;
        Upload(fileString, settings.host + "/Legajos/" + sinaptic.vm.currentSinister.identificador + "/" + sinaptic.vm.uploadingFileName)
    }

    function updateProgress(evt) { }

    function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    function validateCreateSinister() {
        var errors = [];
        var sinisterName = $("#newSinister_siniestro").val();
        var sinisterDate = new Date($("#newSinister_fechaSiniestro").val() + "T00:00:00");
        var group = $("#newSinister_grupo").val();
        var order = $("#newSinister_orden").val();
        var domain = $("#newSinister_dominio").val();
        var amount = $("#newSinister_suma").val();
        var taker = $("#newSinister_tomador").val();

        if (isNaN(sinisterName)) {
            errors.push("El título del siniestro debe ser numérico");
            $("#newSinister_siniestro").focus();
        }
        if (!isNaN(taker)) {
            errors.push("El valor ingresado en Tomador es incorreccto");
            $("#newSinister_tomador").focus();
        }
        if (sinisterName === null || sinisterName === "") {
            errors.push("Debe ingresar un título para el siniestro");
            $("#newSinister_siniestro").focus();
        }
        if (navigator.userAgent.match(/trident/i)) {
            if (Object.prototype.toString.call(sinisterDate) !== '[object Date]' || isNaN(sinisterDate.getTime())) {
                errors.push("El formato de la fecha ingresada no es válido [dd/MM/aaaa]");
                $("#newSinister_fechaSiniestro").focus();
            }
        }
        if (sinisterDate > new Date()) {
            errors.push("La fecha del siniestro debe ser menor o igual a la fecha del día");
            $("#newSinister_fechaSiniestro").focus();
        }
        if (isNaN(group)) {
            errors.push("El grupo debe ser numérico");
            $("#newSinister_grupo").focus();
        }
        if (group === null || group === "") {
            errors.push("Debe ingresar el grupo");
            $("#newSinister_grupo").focus();
        }
        if (isNaN(order)) {
            errors.push("El Orden debe ser numérico");
            $("#newSinister_orden").focus();
        }
        if (order === null || order === "") {
            errors.push("Debe ingresar el orden");
            $("#newSinister_orden").focus();
        }
        if (domain === null || domain === "") {
            errors.push("Debe ingresar el dominio el vehículo");
            $("#newSinister_dominio").focus();
        }
        if (isNaN(amount)) {
            errors.push("El valor ingresado en el monto asegurado no es válido");
            $("#newSinister_suma").focus();
        }
        if (errors.length > 0) {
            alert(errors.join("\r\n"));
            return false;
        }
        return true;
    }

    var createSinister = function () {
        if (!validateCreateSinister()) {
            return;
        }
        var grupo =  $("#newSinister_grupo").val();
        var orden = $("#newSinister_orden").val();

        var url = settings.host + "/_vti_bin/listdata.svc/Siniestros?$filter=Grupo eq '" + grupo + "' and Orden eq '" + orden + "' and EstadoId ne 32";
        $.ajax({
            url: url,
            type: "GET",
            async: true,
            headers: {
                "accept": "application/json;odata=verbose"
            },
            success: function (data) {
                var sinister = data.d.results;
                if (data.d.results !== null && data.d.results.length > 0) {
                    alert("Existe un siniestro con el mismo grupo y orden que aún no ha sido cerrado, no puede ingresarlo nuevamente hasta que el mismo esté cerrado.");
                    return;
                } else {
                    var vencimiento = getDueDates(21).alertDate1.toJSON();
                    var nuevoSiniestro = {
                        Siniestro: $("#newSinister_siniestro").val(),
                        Grupo: $("#newSinister_grupo").val(),
                        Orden: $("#newSinister_orden").val(),
                        CarrierId: $("#newSinister_carrier").val(),
                        Tomador: $("#newSinister_tomador").val(),
                        FechaSiniestro: $("#newSinister_fechaSiniestro").val() + "T00:00:00",
                        TipoDeSiniestroValue: $("#newSinister_tipoSiniestro").val(),
                        ModeloVehiculo: $("#newSinister_modeloVehiculo").val(),
                        Dominio: $("#newSinister_dominio").val(),
                        SumaAsegurada: $("#newSinister_suma").val(),
                        MailCliente: $("#newSinister_mailCliente").val(),
                        TelCliente: $("#newSinister_telCliente").val(),
                        MailCia: $("#newSinister_mailCia").val(),
                        TelCia: $("#newSinister_telCia").val(),
                        VencimientoEstado: vencimiento,
                        EstadoId: 21 //ASIGNACIÓN DE RESPONSABLE
                    };
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
                            var payload = {
                                EstadoId: 21
                            };
                            sinaptic.vm.currentSinister = { siniestro: nuevoSiniestro.Siniestro, identificador: data.d.Identificador };
                            var nextStatus = 21;
                            var groupId = 1;
                            getEmails(payload, nextStatus, groupId)
                            sinaptic.posa();
                            $("#newSinister").modal("hide");
                        },
                        error: errorHandler
                    })
                }
            },
            error: errorHandler
        });


 
    };

    var addComment = function (estadoId) {
        $("#estado" + estadoId + "comentarios").css("display", "none");
        $("#estado" + estadoId + "acciones").css("display", "inline");
        // $(".modal-footer").children().prop('disabled', false);
    };

    var showAddComment = function (estadoId) {
        $("#estado" + estadoId + "comentarios").css("display", "inline");
        $("#estado" + estadoId + "acciones").css("display", "none");
        //   $(".modal-footer").children().prop('disabled', true);
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

    function getNextStatusData(payload, nextStatus) {

        var statusUrl = settings.host + "/_vti_bin/listdata.svc/Estados?$filter=Identificador eq " + nextStatus;
        $.ajax({
            url: statusUrl,
            type: "GET",
            async: true,
            headers: {
                "accept": "application/json;odata=verbose"
            },
            success: function (data) {
                var groupId = data.d.results[0].GrupoId;
                getEmails(payload, nextStatus, groupId)

            },
            error: errorHandler
        });


    }

    function getEmails(payload, nextStatus, groupId) {
        var usersUrl = "";
        var protocol = "http";

        switch (groupId) {
            case 4:
                var responsableId = nextStatus === 22 ? payload.ResponsableId : sinaptic.vm.currentSinister.responsableId;
                usersUrl = settings.host + "/_vti_bin/listdata.svc/Usuarios?$expand=Usuario&$filter=(Usuario/Identificador eq " + responsableId + ")";
                break;
            default:
                usersUrl = settings.host + "/_vti_bin/listdata.svc/Usuarios?$expand=Grupo,Usuario&$filter=(Grupo/Identificador eq " + groupId + ")";
                protocol = "https";
                break;
        }

        $.ajax({
            url: usersUrl,
            type: "GET",
            async: true,
            headers: {
                "accept": "application/json;odata=verbose"
            },
            success: function (data) {

                var emails = "";

                for (var i = 0; i < data.d.results.length; i++) {
                    if (data.d.results[i].Email != null) {
                        emails += data.d.results[i].Email + ",";
                    } else {
                        console.log("El usuario: '" + data.d.results[i].Usuario.Nombre + "' no tiene asignado un correo electronico.")
                    }
                }

                emails = emails.substring(0, emails.length - 1);
                createEmail(payload, nextStatus, emails, protocol);

            },
            error: errorHandler
        });

    }

    function createEmail(payload, nextStatus, emails, protocol) {

        var sinisterNewState = "";

        for (var i = 0; i < sinaptic.vm.status.length; i++) {
            if (sinaptic.vm.status[i].Identificador == payload.EstadoId) {
                sinisterNewState = sinaptic.vm.status[i].Descripción;
            }
        }

        var sinisterTitle = "Siniestro '" + sinaptic.vm.currentSinister.siniestro + "' - '" + sinisterNewState + "'";
        var sinisterSubject = "Siniestro '" + sinaptic.vm.currentSinister.siniestro + "' ha sido asignado al estado '" + sinisterNewState + "'.";
        var detalleLink = settings.host + "/Paginas/DetallesSiniestro.aspx?$ID=" + sinaptic.vm.currentSinister.identificador;
        var sinisterEmailStructure = "<p>El siniestro '" + sinaptic.vm.currentSinister.siniestro + "' se cambió al estado '" + sinisterNewState + "'.</p>";
        sinisterEmailStructure += '<a href="' + detalleLink + '">Link al detalle</a><span>.</span><br /> <a href="' + settings.host + '">Link al dashboard</a><span>.</span></br>';

        var props = {
            T\u00edtulo: sinisterTitle,
            Destinatarios: emails,
            EmailBody: sinisterEmailStructure,
            EmailSubject: sinisterSubject,
            Protocol: protocol
        }


        $.ajax({
            url: settings.host + "/_vti_bin/listdata.svc/MailDelivery",
            type: "POST",
            processData: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(props),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                console.log("Mailing item creado.");

            },
            error: errorHandler
        })
    }

    function closeStatusById(id) {
        var toDate = {
            "FechaHasta": new Date().toJSON()
        };
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
                sinaptic.posa();
            },
            error: errorHandler
        });
    }

    var updateStatusChange = function (payload) {
        var sinisterId = sinaptic.vm.currentSinister.identificador;
        var idHistorial = sinaptic.vm.currentSinister.idhistorial;
        var nextStatus = payload.EstadoId;
        var historyPayload = {
            "SiniestroId": sinisterId,
            "EstadoId": nextStatus,
            "FechaDesde": new Date().toJSON()
        };
        if (idHistorial != undefined && idHistorial != null) {
            closeStatusById(idHistorial);
        }
        createHistorial(historyPayload, function (data) {
            payload.IdHistorial = data.d.Identificador;
            var dueDate = getDueDates(payload.EstadoId);
            payload.VencimientoEstado = dueDate.alertDate1.toJSON();
            payload.VencimientoEstado2 = dueDate.alertDate2.toJSON();
            updateSinister(sinisterId, payload);
        });


        getNextStatusData(payload, nextStatus)


    }

    var saveComment = function () {
        var properties = {
            T\u00edtulo: sinaptic.vm.currentSinister.siniestro,
            Comentario: $("#comentario").val(),
            IDSiniestro: sinaptic.vm.currentSinister.identificador,
            EstadoComentario: sinaptic.vm.currentSinister.estado,
            ComentaristaId: _spPageContextInfo.userId
        }

        $.ajax({
            url: settings.host + "/_vti_bin/listdata.svc/Comentarios",
            type: "POST",
            processData: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(properties),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                $("#comentario").val("");
                $("#comentario").prop("disabled", false);
                $("#saveComment").prop("disabled", false);
            },
            error: errorHandler
        });
    }

    var hasPressedEnter = function (e) {
        var keynum;

        if (window.event) { // IE                    
            keynum = e.keyCode;
        } else if (e.which) { // Netscape/Firefox/Opera                   
            keynum = e.which;
        }

        if (keynum == 13) {
            var serchString = $(".searchBox").val();
            window.location.href = "/site/expertisebrokersargentina/paginas/buscador.aspx?Search=" + serchString;
        }
    }

    var completeTask = function (estadoId) {
        var closeTaskOk = true;
        switch (estadoId) {
            case 21:
                var payload = {
                    MotivoRechazo: "",
                    ResponsableId: $("#responsablewillis").val(),
                    TeamLeaderId: $("#teamleaderwillis").val(),
                    EstadoId: 22
                };
                updateStatusChange(payload);
                break;
            case 22:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 23
                };
                if ($("#dropzone")[0].dropzone.files.length < 1) {
                    alert("Debe adjuntar el Formulario 04");
                    $("#dropzone").focus();
                    closeTaskOk = false;
                    break;
                }
                updateStatusChange(payload);
                getFile("#dropzone");
                break;

            case 23:
                var isCompleted = false;
                if ($("input#docCompletaSi")[0].checked === true) {
                    isCompleted = true;
                }
                var payload = {
                    MotivoRechazo: "",
                    DocCertCompleta: isCompleted,
                    EstadoId: isCompleted ? 24 : 42

                }
                updateStatusChange(payload);
                break;

            case 24:
                var resolucion = $("#tipoResolucion option:selected").text();
                var reslvalue = $("#tipoResolucion option:selected").val();
                var payload = {
                    MotivoRechazo: "",
                    TipoDeResuloci\u00f3nValue: resolucion,
                    EstadoId: reslvalue == "1" ? 25 : 33,
                    MotivoRechazo: ""
                }
                updateStatusChange(payload);
                break;

            case 25:
                var payload = {
                    MotivoRechazo: "",
                    SaldoPendiente: $("#saldodeudor").val(),
                    VencimientoDeuda: $("#vencimientodeuda").val() + "T00:00:00",
                    EstadoId: 26
                };
                var inputDate = $("#vencimientodeuda").val();
                var hoy = new Date();
                var dd = hoy.getDate();
                var mm = hoy.getMonth() + 1;
                var yyyy = hoy.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd
                }
                if (mm < 10) {
                    mm = '0' + mm
                }

                hoy = yyyy + '' + mm + '' + dd;
                if (navigator.userAgent.match(/trident/i)) {
                    if (Object.prototype.toString.call(payload.VencimientoDeuda) !== '[object Date]' || isNaN(payload.VencimientoDeuda.getTime())) {
                        alert("El formato de la fecha de vencimiento ingresada no es válido [dd/MM/aaaa]");
                        $("#vencimientodeuda").focus();
                        closeTaskOk = false;
                        break;
                    }
                }
                if (isNaN(payload.SaldoPendiente)) {
                    alert("El valor ingresado en Saldo Pendiente no es válido [debe ser un número]");
                    $("#saldodeudor").focus();
                    closeTaskOk = false;
                    break;
                }
                var validationinputDate = inputDate.split("-");
                validationinputDate = validationinputDate[0] + '' + validationinputDate[1] + '' + validationinputDate[2];
                if (inputDate == "") {
                    alert("Debe ingresar la fecha de vencimiento de la deuda");
                    $("#vencimientodeuda").focus();
                    closeTaskOk = false;
                    break;
                }
                if (parseInt(validationinputDate) < parseInt(hoy)) {
                    alert("La fecha de vencimiento debe ser mayor a la fecha actual");
                    $("#vencimientodeuda").focus();
                    closeTaskOk = false;
                    break;
                }
                if ($("#saldodeudor").val().substring(0, 1) == "-") {
                    alert("El saldo deudor no puede ser negativo");
                    $("#saldodeudor").focus();
                    closeTaskOk = false;
                    break;
                }
                if ($("#saldodeudor").val() == "") {
                    alert("Debe ingresar el saldo deudor");
                    $("#saldodeudor").focus();
                    closeTaskOk = false;
                    break;
                }
                if ($("#saldodeudor").val() == "0") {
                    alert("El saldo deudor no puede ser 0");
                    $("#saldodeudor").focus();
                    closeTaskOk = false;
                    break;
                }
                if (parseInt($("#saldodeudor").val()) > sinaptic.vm.currentSinister.sumaasegurada) {
                    alert("El saldo deudor no puede ser mayor a la suma asegurada: [$" + sinaptic.vm.currentSinister.sumaasegurada + "]");
                    $("#saldodeudor").focus();
                    closeTaskOk = false;
                    break;
                }

                if ($("#saldodeudor").val() == "0") {
                    alert("El saldo deudor no puede ser 0");
                    $("#saldodeudor").focus();
                    closeTaskOk = false;
                    break;
                }

                sinaptic.wf.validateForm(payload, 25, function () { updateStatusChange(payload) })

                break;

            case 26:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 27
                }
                updateStatusChange(payload);
                break;

            case 27:
                var payload = {
                    MotivoRechazo: "",
                    ImporteACancelar: $("#cancelImport").val(),
                    ModoDeCancelaci\u00f3nValue: $("#cancelationMode option:selected").text(),
                    FechaDeCancelaci\u00f3n: $("#cancelDate").val() + "T00:00:00",
                    NumeroDeCheque: $("#checkNumber").val(),
                    ComprobanteN: $("#comprobanteNumber").val(),
                    EstadoId: 28,
                    MotivoRechazo: ""

                }

                if (isNaN(payload.ImporteACancelar)) {
                    alert("El valor ingresado en Importe a Cancelar no es válido [debe ser numérico]");
                    $("#cancelImport").focus();
                    closeTaskOk = false;
                    break;
                }

                if (isNaN(payload.NumeroDeCheque)) {
                    alert("El valor ingresado en Número de Cheque no es válido [debe ser numérico]");
                    $("#checkNumber").focus();
                    closeTaskOk = false;
                    break;
                }

                if (isNaN(payload.ComprobanteN)) {
                    alert("El valor ingresado en Comprobante Número no es válido [debe ser numérico]");
                    $("#comprobanteNumber").focus();
                    closeTaskOk = false;
                    break;
                }

                if ($("#dropzone")[0].dropzone.files.length < 1) {
                    alert("Debe adjuntar la Rendición del pago");
                    $("#dropzone").focus();
                    closeTaskOk = false;
                    break;
                }

                var inputDate = $("#cancelDate").val();
                var hoy = new Date();
                var dd = hoy.getDate();
                var mm = hoy.getMonth() + 1;
                var yyyy = hoy.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd
                }
                if (mm < 10) {
                    mm = '0' + mm
                }

                hoy = yyyy + '' + mm + '' + dd;
                if(navigator.userAgent.match(/trident/i) ){
                    if (Object.prototype.toString.call(inputDate) !== '[object Date]' || isNaN(inputDate.getTime())) {
                        alert("El formato de la fecha  de cancelación ingresada no es válido [dd/MM/aaaa]");
                        $("#cancelDate").focus();
                        closeTaskOk = false;
                        break;
                    }
                }

                var validationinputDate = inputDate.split("-");
                validationinputDate = validationinputDate[0] + '' + validationinputDate[1] + '' + validationinputDate[2];
                if (parseInt(validationinputDate) < parseInt(hoy)) {
                    alert("La fecha de cancelación debe ser mayor que la fecha actual");
                    $("#cancelDate").focus();
                    closeTaskOk = false;
                    break;
                }

                if (inputDate == "") {
                    alert("Ingrese una fecha válida");
                    $("#cancelDate").focus();
                    closeTaskOk = false;
                    break;
                }

                var importe = $("#cancelImport").val();

                if (importe.substring(0, 1) == "-") {
                    alert("El importe no puede ser negativo");
                    $("#cancelImport").focus();
                    closeTaskOk = false;
                    break;
                }
                if (importe == "") {
                    alert("Debe ingresar el importe a cancelar");
                    $("#cancelImport").focus();
                    closeTaskOk = false;
                    break;
                }
                if (importe == "0") {
                    alert("El importe no puede ser 0");
                    $("#cancelImport").focus();
                    closeTaskOk = false;
                    break;
                }

                updateStatusChange(payload);
                getFile("#dropzone");
                break;

            case 28:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 29
                }
                updateStatusChange(payload);
                break;

            case 29:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 30
                }
                updateStatusChange(payload);
                break;

            case 30:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 31
                }
                updateStatusChange(payload);
                break;

            case 31:
                var payload = {
                    MotivoRechazo: "",
                    FechaDeCierreDeSiniestro: new Date().toISOString(),
                    EstadoId: 32
                }
                updateStatusChange(payload);
                break;

            case 33:
                var isAuthorized = false;
                if ($("input#autRepoSi")[0].checked === true) {
                    isAuthorized = true;
                }
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: isAuthorized ? 34 : 25
                }
                updateStatusChange(payload);
                break;

            case 34:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 35,
                    MotivoRechazo: ""
                }
                updateStatusChange(payload);
                break;

            case 35:
                // FALTA ADJUNTAR FACTURA
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 36
                }

                if ($("#dropzone")[0].dropzone.files.length < 1) {
                    alert("Debe adjuntar un documento");
                    $("#dropzone").focus();
                    closeTaskOk = false;
                    break;
                }

                updateStatusChange(payload);
                break;

            case 36:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 37
                }
                updateStatusChange(payload);
                break;

            case 37:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 38
                }
                updateStatusChange(payload);
                break;

            case 38:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 39
                }
                updateStatusChange(payload);
                break;

            case 39:
                verifPrenda
                var verifPrenda = false;
                if ($("input#verifPrendaSi")[0].checked === true) {
                    verifPrenda = true;
                }
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: verifPrenda ? 30 : 40
                }
                updateStatusChange(payload);
                break;

            case 40:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 41
                }

                updateStatusChange(payload);

                break;

            case 41:

                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 39
                }

                updateStatusChange(payload);

                break;
            case 42:
                var payload = {
                    MotivoRechazo: "",
                    EstadoId: 23
                }
                updateStatusChange(payload);
                break;
        };

        if (closeTaskOk) {
            $("#modaltask").modal('hide');
        }
    }

    var showRejectTask = function (estadoId) {
        var taskContent = [];
        var buttons = [];

        taskContent.push('<div class="form-group">');
        taskContent.push('<label for="comment">Comentario de rechazo:</label>');
        taskContent.push('<textarea class="form-control" rows="5" id="rejectComment"></textarea>');
        taskContent.push('</div>');

        buttons.push('<button type="button" onclick="sinaptic.wf.rejectTask(' + estadoId + ')" class="btn btn-danger">Rechazar</button>');
        buttons.push('<button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>');

        $("#taskcontent").append(taskContent);
        $("#modaltask > div > div > div.modal-footer").html(buttons.join(""));
    }
    var rejectTask = function (estadoId) {
        var closeTaskOk = true;
        var motivo = $("#rejectComment").val();
        if (motivo === null || motivo === undefined || motivo === "") {
            closeTaskOk = false;
            alert("Debe ingresar un motivo de rechazo");
        }
        var nextStatus = 0;
        switch (estadoId) {
            case 25:
                nextStatus = 24;
                break;
            case 28:
                nextStatus = 27;
                break;
            case 29:
                nextStatus = 27;
                break;
            case 33:
                nextStatus = 24;
                break;
            case 36:
                nextStatus = 34;
                break;

        }
        var payload = {
            MotivoRechazo: motivo,
            EstadoId: nextStatus
        };
        updateStatusChange(payload);
        if (closeTaskOk) {
            $("#modaltask").modal('hide');
        }
    }
    return {
        createSinister: createSinister,
        showTaskForm: showTaskForm,
        showCreateSinister: showCreateSinister,
        addComment: addComment,
        completeTask: completeTask,
        hasPressedEnter: hasPressedEnter,
        getNextStatusData: getNextStatusData,
        showRejectTask: showRejectTask,
        rejectTask: rejectTask
    };
}();