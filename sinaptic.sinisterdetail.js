﻿var currentSinister = {};

var detailsSinister = function () {
    var e = 0;
    var fields = ["Siniestro", "Grupo", "Orden", "Carrier", "Tomador", "DNI", "Fecha Siniestro", "Tipo de Siniestro", "Modelo Vehiculo", "Tipo Vehiculo", "Dominio", "Suma Asegurada"]
    var s = function (e) { return e.toString() }
    var t = function (e) { $("#PrincipalData").html("<h4>No hay detalles asociados a este Siniestro</h4>") }
    var o = function (e) { return void 0 == e || null == e || "" == e ? " - " : e }, n = function (e) {
         var r = ""; if (null != e) {
             r = e.replace("/Date(", "");
             var s = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"];
             r = (r = new Date(Number(r.replace(")/", "")))).getDate() + "/" + (parseInt(r.getMonth()) + 1) + "/" + r.getFullYear()
         }
         else r = " - "; return r
    }
    var i = function (e) {
         var r = new Date, s = e.replace("/Date(", "");
         return s = new Date(Number(s.replace(")/", ""))), Math.round(Math.abs((s.getTime() - r.getTime()) / 864e5))
     }
     var a = function (data) {
         var s = data.d.results[0];
         $("#SinesterTitleID h1").html("Siniestro: " + s.Siniestro);
         var t = window.location.protocol + "//access.willis.com/site/ExpertiseBrokersArgentina/Paginas/AdminTasks.aspx?";
         t += "gp=" + s.Grupo + "&or=" + s.Orden + "&title=" + s.Estado["Descripción"];
         getUserGruop('<a  href="' + t + '"><img src="' + window.location.protocol + '//access.willis.com/site/ExpertiseBrokersArgentina/SiteAssets/img/settings2.png" style="padding-top: 8px;" height="25" width="25"></a>');
         //if(true){
         //    $("#SinesterTitleID h1").after('<a  href="' + t + '"><img src="'+window.location.protocol+'://access.willis.com/site/ExpertiseBrokersArgentina/SiteAssets/img/settings2.png" style="padding-top: 8px;" height="25" width="25"></a>');
         //}
         $("#SinesterTitleID h1").css("display", "inline");
         $("#SinesterTitleID img").after("<h2 class='StatusTitle'>Estado: " + s.Estado["Descripción"] + "</h2>");
         currentSinister = s;
         var a = n(s.Creado), u = n(s.FechaSiniestro), l = i(s.Creado), p = void 0 != s.TeamLeader && null != s.TeamLeader ? s.TeamLeader.Nombre : "",
         h = void 0 != s.Responsable && null != s.Responsable ? s.Responsable.Nombre : "", c = void 0 != s.Carrier && null != s.Carrier ? o(s.Carrier.Título) : "", d = [];
         var sumaAsegurada = s.SumaAsegurada || 0;
         var saldoPendiente = s.SaldoPendiente || 0;
         var importeACancelar = s.ImporteACancelar || 0;
         var tipoSiniestro = s.TipoDeSiniestroValue == 1 || s.TipoDeSiniestroValue == "ROBO TOTAL"  ? "Robo total" : "Destrucción total";

         d.push("<div id='tabs'><ul><li><a href='#containerData-1'>Detalle</a></li>"),
         d.push("<li><a href='#containerData-2'>Contacto</a></li>"),
         d.push("<li><a href='#containerData-3'>Responsables</a></li>"),
         d.push("</ul>"),

         d.push("<div id='containerData-1'><div style='width:49%;display:inline-block'><strong>Siniestro: </strong>"), d.push(o(s.Siniestro)),
         d.push("</br><strong>ID: </strong>"), d.push(o(e)),
         d.push("</br><strong>Grupo: </strong> "), d.push(o(s.Grupo)),
         d.push("</br><strong>Orden: </strong>"), d.push(o(s.Orden)),
         d.push("</br><strong>Fecha de Siniestro: </strong>"), d.push(adjustDate(s.FechaSiniestro)),
         d.push("</br><strong>Tipo de Siniestro: </strong>"), d.push(tipoSiniestro),
         d.push("</br><strong>Modelo de vehículo: </strong>"), d.push(s.ModeloVehiculo),
         d.push("</br><strong>Dominio: </strong>"), d.push(o(s.Dominio)),
         d.push("</br><strong>Suma Asegurada: </strong>"), d.push("$" + o(sumaAsegurada.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'))),
         d.push("</br><strong>Tipo de Resolucion: </strong>"), d.push(o(s.TipoDeResulociónValue)),
         d.push("</br><strong>Tomador: </strong>"), d.push(o(s.Tomador)),
         d.push("</br><strong>Creacion del Siniestro: </strong>"), d.push(adjustDate(s.Creado)),
         d.push("</br><strong>Días Transcurridos: </strong>"), d.push(o(l)),
         d.push("</div><div style='width:49%;display:inline-block'>"),
         d.push("<strong>Saldo Enviado: </strong>"), d.push("$" + o(saldoPendiente.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'))),
         d.push("</br><strong>Vencimiento Saldo Enviado: </strong>"), d.push(adjustDate(s.VencimientoDeuda)),
         d.push("</br><strong>Saldo Acreditado: </strong>"), d.push("$" + o(importeACancelar.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'))),
         d.push("</br><strong>Vencimiento Saldo Acreditado: </strong>"), d.push(adjustDate(s["FechaDeCancelaci\u00f3n"])),
         d.push("</div>"),
         d.push("</div>")


         d.push("<div id='containerData-2'><strong>Carrier: </strong>"), d.push(c),
         d.push("</br><strong>Mail Cliente: </strong>"), d.push(o(s.MailCliente)),
         d.push("</br><strong>Tel Cliente: </strong>"), d.push(o(s.TelCliente)),
         d.push("</br><strong>Mail Cia: </strong>"), d.push(o(s.MailCia)),
         d.push("</br><strong>Tel Cia: </strong>"), d.push(o(s.TelCia)),
         d.push("</div>")

         d.push("<div id='containerData-3'><strong>Team-Leader: </strong>"), d.push(p),
         d.push("</br><strong>Responsable: </strong>"), d.push(h),
         d.push("</div>"),

         d.push("</div>"), d = d.join(""), $("#PrincipalData").html(d)
         $("#tabs").tabs();

     }

    var u = function (e) { $("#tabs").tabs(); };

    function adjustDate(oridate) {
        if (oridate) {
            var date = moment(oridate);
            date.add(date.utcOffset() * -1, 'm');
            return dateToString(date._d);
        }
        return ""
    }
    function dateToString(date) {
        return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    };
    function getUserGruop(adminLink) {
        var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        var usersUrl = host + "/_vti_bin/listdata.svc/Usuarios?$expand=Grupo&$filter=(UsuarioId eq " + _spPageContextInfo.userId + ")";
        $.ajax({
            url: usersUrl,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) {
                var group = data.d.results[0].GrupoId;
                if (group === 1 || group === 4) {
                    insertAdminLink(adminLink);
                }
            },
            error: function(error){console.log(error.message)}
        });
    }
    function insertAdminLink(adminLink) {
        $("#SinesterTitleID h1").after(adminLink);
    }
    return {
        getPrincipalData: function () {
            $.getScript("https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js", function () {
                var listFields = fields.toString();
                var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
                var navParams = window.location.href.split("ID=");
                var sinisterId = 0;
                if (navParams.length > 0) {
                    var andIndex = navParams[1].indexOf("&");
                    if (andIndex > 0) {
                        sinisterId = navParams[1].substr(0, andIndex);
                    }
                    else {
                        sinisterId = navParams[1];
                    }
                }

                $.ajax({
                    url: host + "/_vti_bin/listdata.svc/Siniestros?select=" + listFields + ",Identificador&$expand=Carrier,Estado,TeamLeader,Responsable&$filter=(Identificador eq " + sinisterId + ")",
                    type: "GET",
                    async: !0,
                    headers: { accept: "application/json;odata=verbose" },
                    success: a,
                    complete: u,

                    error: t
                })



            })
        },
        setSinisterID: function () {
            var r = window.location.href.split("ID=");
            e = r[1];
        }
    }
}(jQuery);


$(window).load(function () {
    while ($('#statusContainer').find('h4').length > 1) {
        $('#statusContainer').find('h4')[0].remove()
    }
    if ($('#statusContainer').find('canvas').width() < 500)
        $('#statusContainer').find('h4')[0].remove()
});

