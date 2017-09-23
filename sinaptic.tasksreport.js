﻿
var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;

$(document).ready(function () {
    
    getFromHistory();
    buildDatatask();

    $("#reportContainerTable").DataTable();
});



function getFromHistory() {
    var usersUrl = host + "/_vti_bin/listdata.svc/Historial?$top=9000";

    $.ajax({
        url: usersUrl,
        type: "GET",
        async: true,
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function (data) {
            var result = data.d.results.length;
            console.log(data.d.results);

            var sinisterData = {
                Siniestro: "",
                Estado: "",
                FechaDesde: "",
                FechaHasta:""
            }

            for (var i = 0; i < result; i++) {
                sinisterData.Siniestro = data.d.results[i].Siniestro;
                sinisterData.Estado = data.d.results[i].EstadoId;
                sinisterData.FechaDesde = data.d.results[i].FechaDesde;
                sinisterData.FechaHasta = data.d.results[i].FechaHasta;

                $("#reportBody").append("<tr><td>" + sinisterData.Siniestro + "</td><td>" + sinisterData.Estado + "</td><td>" + sinisterData.FechaDesde + "</td><td>" + sinisterData.FechaHasta + "</td></tr>");

            }


        },
        error: console.log("error.")
    });
}

function buildDatatask() {

}

