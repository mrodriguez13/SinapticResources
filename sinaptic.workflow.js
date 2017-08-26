"use strict";
var sinaptic = sinaptic || {};
sinaptic.vm = sinaptic.vm || {}, sinaptic.wf = function () {
    function s(s, a, e) {
        var i = $(a).html(),
            t = Handlebars.compile(i)(e);
        $(s).html(t)
    }

    function a(s) {
        console.log("Error: " + s.responseJSON.error)
    }

    function e() {
        $("#saldodeudor").on("input", function () {
            var s = $(this).val(),
                a = s.replace(/[^0-9,\.]/, "");
            s !== a && $(this).val(a)
        })
    }
    var i = {
        userId: _spPageContextInfo.userId,
        host: window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl,
        sinistersListName: "Siniestros",
        statusListname: "Estados"
    };
    ! function () {
        var s = i.host + "/_vti_bin/listdata.svc/Estados";
        $.ajax({
            url: s,
            type: "GET",
            async: !0,
            headers: {
                accept: "application/json;odata=verbose"
            },
            success: function (s) {
                sinaptic.vm.status = s.d.results, console.log("Cargando Estados: OK")
            },
            error: a
        })
    }(),
        function () {
            var s = i.host + "/_vti_bin/listdata.svc/Carriers";
            $.ajax({
                url: s,
                type: "GET",
                async: !0,
                headers: {
                    accept: "application/json;odata=verbose"
                },
                success: function (s) {
                    sinaptic.vm.carriers = s.d.results, console.log("Cargando Carriers: OK")
                },
                error: a
            })
        }(),
        function () {
            var s = i.host + "/_vti_bin/listdata.svc/Usuarios?$expand=Grupo,Usuario&$filter=(Grupo/Identificador eq 1 or Grupo/Identificador eq 4)";
            $.ajax({
                url: s,
                type: "GET",
                async: !0,
                headers: {
                    accept: "application/json;odata=verbose"
                },
                success: function (s) {
                    sinaptic.vm.willisusers = s.d.results
                },
                error: a
            })
        }();
    var t = function (s) {
        var a = "";
        switch (s) {
            case 21:
                $.each(sinaptic.vm.status, function (s, e) {
                    if (21 === e.Identificador) {
                        var i = $("#newSinister_fechaSiniestro").val(),
                            t = e.Alerta1,
                            o = new Date(i),
                            n = (o = new Date(o.setDate(o.getDate() + t))).getDate();
                        n < 10 && (n = "0" + n);
                        var r = parseInt(o.getMonth()) + 1;
                        r < 10 && (r = "0" + r), a = o.getFullYear() + "-" + r + "-" + n + "T00:00:00"
                    }
                })
        }
        return a
    },
        o = function (s) {
            var e = "",
                t = i.host + "/_vti_bin/listdata.svc/Siniestros?$filter=Siniestro eq '" + s + "'";
            return $.ajax({
                url: t,
                type: "GET",
                async: !0,
                headers: {
                    accept: "application/json;odata=verbose"
                },
                success: function (s) {
                    e = s.d.results[0].Identificador, n(e)
                },
                error: a
            }), e
        },
        n = function (s) {
            var e = {
                ResponsableId: $("#responsablewillis").val(),
                TeamLeaderId: $("#teamleaderwillis").val(),
                EstadoId: 22
            };
            $.ajax({
                url: i.host + "/_vti_bin/listdata.svc/" + i.sinistersListName + "(" + s + ")",
                type: "POST",
                processData: !1,
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(e),
                headers: {
                    Accept: "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "X-HTTP-Method": "MERGE",
                    "If-Match": "*"
                },
                success: function (s) {
                    alert("Siniestro actualizado.")
                },
                error: a
            })
        };
    return {
        createSinister: function () {
            var s = t(21),
                e = {
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
                    VencimientoEstado: s,
                    EstadoId: 21
                };
            sinaptic.wf.validateForm(e, 0, function () {
                $.ajax({
                    url: i.host + "/_vti_bin/listdata.svc/" + i.sinistersListName,
                    type: "POST",
                    processData: !1,
                    contentType: "application/json;odata=verbose",
                    data: JSON.stringify(e),
                    headers: {
                        Accept: "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (s) {
                        alert("Siniestro Creado: " + e.Siniestro)
                    },
                    error: a
                })
            }, a)
        },
        showTaskForm: function (a, i) {
            sinaptic.context = {
                siniestro: JSON.parse(a),
                estado: {
                    id: i
                }
            };
            var t = [],
                o = [],
                n = [];
            switch (i) {
                case 21:
                    $(sinaptic.vm.willisusers).each(function (s, a) {
                        4 === a.Grupo.Identificador ? (t.push("<option value='"), t.push(a.Identificador), t.push("'>"), t.push(a.Usuario.Nombre), t.push("</option>")) : (o.push("<option value='"), o.push(a.Identificador), o.push("'>"), o.push(a.Usuario.Nombre), o.push("</option>"))
                    }), n.push("<div class='form-group'>"), n.push("<div class='col-md-8'>"), n.push("<label class='control-label'>Responsable Willis</label>"), n.push("<select id='responsablewillis' class='form-control'>"), n.push(t.join("")), n.push("</select>"), n.push("</div>"), n.push("</div>"), n.push(" <div class='form-group'>"), n.push("<div class='col-md-8'>"), n.push("<label class='control-label'>Team Leader Willis</label>"), n.push("<select id='teamleaderwillis' class='form-control'>"), n.push(o.join("")), n.push("</select>"), n.push("</div>"), n.push("</div>");
                    break;
                case 23:
                    n.push("<div class='form-group'>"), n.push("<div class='col-md-12'>"), n.push("<div class='col-md-6'><label class='control-label'>¿Documentación completa?</label></div>"), n.push("<div class='col-md-6'><label class='radio-inline'><input name='optradio' type='radio' id='docCompletaSi'>SI</label>"), n.push("<label class='radio-inline'><input type='radio' name='optradio' id='docCompletaNo'>NO</label></div>"), n.push("</div>"), n.push("</div>");
                    break;
                case 24:
                    n.push(" <div class='form-group'>"), n.push("<div class='col-md-8'>"), n.push("<label class='control-label'>Tipo de resolución</label>"), n.push("<select id='teamleaderwillis' class='form-control'>"), n.push("<option value='1'>Liquidación de saldo deudor</option>"), n.push("<option value='2'>Reposición de unidad</option>"), n.push("</select>"), n.push("</div>"), n.push("</div>"), n.push('<div class="table table-striped" class="files" id="previews">'), n.push(' <div id="template" class="file-row">'), n.push("<div>"), n.push(' <span class="preview"><img data-dz-thumbnail /></span>'), n.push("</div>"), n.push("<div>"), n.push('<p class="name" data-dz-name></p>'), n.push('<strong class="error text-danger" data-dz-errormessage></strong>'), n.push("</div>"), n.push("<div>"), n.push('<p class="size" data-dz-size></p>'), n.push('<div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">'), n.push('<div class="progress-bar progress-bar-success" style="width:0%;" data-dz-uploadprogress></div>'), n.push("</div>"), n.push("</div>"), n.push("<div>"), n.push('<button type="button" class="btn btn-primary start">'), n.push('<i class="glyphicon glyphicon-upload"></i>'), n.push("<span>Start</span>"), n.push(" </button>"), n.push('<button type="button" data-dz-remove class="btn btn-warning cancel">'), n.push('<i class="glyphicon glyphicon-ban-circle"></i>'), n.push("<span>Cancel</span>"), n.push("</button>"), n.push('<button type="button" data-dz-remove class="btn btn-danger delete">'), n.push('<i class="glyphicon glyphicon-trash"></i>'), n.push("<span>Delete</span>"), n.push("</button>"), n.push("</div>"), n.push("</div>"), n.push("</div>");
                    break;
                case 25:
                    n.push(" <div class='form-group'>"), n.push("<div class='col-md-8'>"), n.push("<label class='control-label'>Saldo deudor</label>"), n.push("<div class='input-group'>"), n.push("<span class='input-group-addon'>$</span>"), n.push("<input id='saldodeudor' type='number' step='0.01' class='form-control'/>"), n.push("</div>"), n.push("</div>"), n.push("</div>"), n.push(" <div class='form-group'>"), n.push("<div class='col-md-8'>"), n.push("<label class='control-label'>Vencimiento de deuda</label>"), n.push("<input id='vencimientodeuda' type='date' class='form-control'/>"), n.push("</div>"), n.push("</div>")
            }
            n = n.join(""), s("#modalsContainer", "#modalTask-template", sinaptic.context), $("#taskcontent").append(n), e(), $("#modaltask").modal()
        },
        showCreateSinister: function () {
            var a = [];
            $(sinaptic.vm.carriers).each(function (s, e) {
                a.push({
                    id: e.Identificador,
                    name: e["Título"]
                })
            }), s("#modalsContainer", "#newSinister-template", {
                carriers: a
            }), $("#newSinister").modal()
        },
        addComment: function (s) {
            $("#estado" + s + "comentarios").css("display", "none"), $("#estado" + s + "acciones").css("display", "inline")
        },
        completeTask: function (s) {
            switch (s) {
                case 21:
                    var a = $("#siniestronombre").text().trim();
                    o(a);
                    break;
                case 25:
                    $("#saldodeudor").val(), $("#vencimientodeuda").val()
            }
            
        }
    }
}();