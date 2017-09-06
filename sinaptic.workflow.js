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
        var infoHeight = 0;
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
            taskContent.push("<select id='teamleaderwillis' class='form-control'>");
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

        case 26:
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
            taskContent.push("<label class='control-label'>Rebdición del pago</label>");
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
        $("#showComment").on("click", function () {

            $('#comentariosContainer').toggle();
        });

        $("#saveComment").on("click", function () {
            $("#comentario").prop("disabled", true);
            $("#saveComment").prop("disabled", true);
            saveComment();
        });
    };
	
 // function isoDateToString(isoDate) {
        // var auxDate = isoDate.split("T")[0];
        // auxDate = auxDate.split("-");
        // return auxDate[2] + "/" + auxDate[1] + "/" + auxDate[0];
    // }

    //dropzone
    function getFile() {
        var file = "";
        for (var i = 0; i < $("#dropzone")[0].dropzone.files.length; i++) {
            file = $("#dropzone")[0].dropzone.files[i];
            UploadMe(file);
        }
    }

    function UploadMe(readFile) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(readFile); //array buffer
        reader.onprogress = updateProgress;
        reader.onload = loaded;
        reader.onerror = errorHandler;
    }

    // The file content must be encoded into Base64. To do it I use the function available on my blog (http://blog.kodono.info/wordpress/2011/07/27/midi-code-encoder-decoder-en-base64-pour-javascript-programmation/)
    function encode_b64(a, b, c, d, e, f) { b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; c = '='; for (d = f = ''; e &= 3, a.charAt(d++) || (b = ';=', e) ; f += b.charAt(63 & c >> ++e * 2)) c = c << 8 | a.charCodeAt(d -= !e); return f }

    // "Upload" is the name of our function to do the job
    // txtContent is a plain text, the content of our file
    // destinationUrl is the full path URL to the document library (with the filename included)
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
            url: "https://access.willis.com/site/ExpertiseBrokersArgentina/_vti_bin/copy.asmx",
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            beforeSend: function (xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/CopyIntoItems'); },
            contentType: "text/xml; charset=\"utf-8\""
        });
    }

    function loaded(evt) {
        var fileString = evt.target.result;
        Upload(fileString, "https://access.willis.com/site/ExpertiseBrokersArgentina/Legajos/395/FORM04.docx")
    }

    function updateProgress(evt) {}

    function arrayBufferToBase64(buffer) {
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
                    //sinaptic.posa.refresh();
                    window.location.reload();
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
            updateSinister(sinisterId, payload);
        });
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
                alert("Comentario guardado correctamente.");
                $("#comentario").val("");
                $("#comentario").prop("disabled", false);
                $("#saveComment").prop("disabled", false);
            },
            error: errorHandler
        });
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
			
			if($("#dropzone")[0].dropzone.files.length < 1){
			alert("Debe adjuntar un documento".);
			break;
			}

            updateStatusChange(payload);
            getFile();
            break;

        case 23:
            // posee 2 radio button,comentario y adjunto, no tiene campos de llenado
            var isCompleted = false;
            if ($("input#docCompletaSi")[0].checked === true) {
                isCompleted = true;
            }
            var payload = {
                DocCertCompleta: isCompleted,
                EstadoId: isCompleted ? 24 : 42

            }
            updateStatusChange(payload);
            break;

        case 24:
            var resolucion = $("#teamleaderwillis option:selected").text();
            var reslvalue = $("#teamleaderwillis option:selected").val();
            var payload = {
                TipoDeResuloci\u00f3nValue: resolucion,
                EstadoId: reslvalue == "1" ? 25 : 33
            }
            updateStatusChange(payload);
            break;

        case 25:
            var payload = {
                SaldoPendiente: $("#saldodeudor").val(),
                VencimientoDeuda: $("#vencimientodeuda").val() + "T00:00:00",
                EstadoId: 26
            };
			
			var inputDate = $("#vencimientodeuda").val();	
			var hoy = new Date();
			var dd = hoy.getDate();
			var mm = hoy.getMonth()+1;
			var yyyy = hoy.getFullYear();
			
			if(dd<10) {
				dd = '0'+dd
			} 
			
			if(mm<10) {
				mm = '0'+mm
			} 
			
			hoy = dd + '/' + mm + '/' + yyyy;
			
			
			if($("#saldodeudor").val() == ""){
				alert("El saldo deudor es invalido.");
				break;
			}					
			
			if($("#saldodeudor").val() == "0"){
				alert("El saldo deudor no puede ser 0");
				break;
			}					
			
			if(inputDate == "") {
				alert("Ingrese una fecha valida.")
				break;
			}
			
			if(inputDate < hoy) {
				alert("La fecha de vencimiento no puede ser menor o igual al dia de hoy.");
				break;
			}else{
			
			sinaptic.wf.validateForm(payload, 25, function () { updateStatusChange(payload) })
			}
			
			
            break;

        case 26:
            var payload = {
                EstadoId: 27
            }
            updateStatusChange(payload);
            break;

        case 27:
            var payload = {
                ImporteACancelar: $("#cancelImport").val(),
                ModoDeCancelaci\u00f3nValue: $("#cancelationMode option:selected").text(),
                FechaDeCancelaci\u00f3n: $("#cancelDate").val() + "T00:00:00",
                NumeroDeCheque: $("#checkNumber").val(),
                ComprobanteN: $("#comprobanteNumber").val(),
                EstadoId: 28
            }
			
			if($("#dropzone")[0].dropzone.files.length < 1){
				alert("Debe adjuntar un documento".);
				break;
			}
			
			var inputDate = $("#cancelDate").val();
			var hoy = new Date();
			var dd = hoy.getDate();
			var mm = hoy.getMonth()+1;
			var yyyy = hoy.getFullYear();
			
			if(dd<10) {
				dd = '0'+dd
			} 
			if(mm<10) {
				mm = '0'+mm
			} 		
			hoy = dd + '/' + mm + '/' + yyyy;
			
			var importe = $("#cancelImport").val();
			
			if(importe.substring(0,1) == "-"){
				alert("El importe no puede ser negativo.");
				break;
			}
			
			if(importe == ""){
				alert("El importe es invalido.");
				break;
			}					
			
			if(importe == "0"){
				alert("El importe no puede ser 0");
				break;
			}					
			
			if(inputDate == "") {
				alert("Ingrese una fecha valida.")
				break;
			}
			
			if(inputDate < hoy) {
				alert("La fecha de vencimiento no puede ser menor o igual al dia de hoy.");
				break;
			}else{
            updateStatusChange(payload);
			}
            break;

        case 28:
            var payload = {
                EstadoId: 29
            }
            updateStatusChange(payload);
            break;

        case 29:
            var payload = {
                EstadoId: 30
            }
            updateStatusChange(payload);
            break;

        case 30:
            var payload = {
                EstadoId: 31
            }
            updateStatusChange(payload);
            break;

        case 31:
            var payload = {
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
                EstadoId: isAuthorized? 34: 25
            }
            updateStatusChange(payload);
            break;

        case 34:
            var payload = {
                EstadoId: 35
            }
            updateStatusChange(payload);
            break;

        case 35:
            // FALTA ADJUNTAR FACTURA
            var payload = {
                EstadoId: 36
            }
            updateStatusChange(payload);
            break;

        case 36:
            var payload = {
                EstadoId: 37
            }
            updateStatusChange(payload);
            break;

        case 37:
            var payload = {
                EstadoId: 38
            }
            updateStatusChange(payload);
            break;

        case 38:
            var payload = {
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
                EstadoId: verifPrenda?30:40
            }
            updateStatusChange(payload);
            break;

        case 40:
            var payload = {
                EstadoId: 41
            }

            updateStatusChange(payload);

            break;

        case 41:

            var payload = {
                EstadoId: 42
            }

            updateStatusChange(payload);

            break;
        case 42:
            var payload = {
                EstadoId: 24
            }

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