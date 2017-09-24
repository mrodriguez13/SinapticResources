
var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;

$(document).ready(function () {
    
    getFromHistory();
    buildDatatask();

});



function getFromHistory() {
    var usersUrl = host + "/_vti_bin/listdata.svc/Historial?$expand=Siniestro,Estado";

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
                sinisterData.Siniestro = (data.d.results[i].Siniestro != null) ? data.d.results[i].Siniestro.Siniestro : "";
                sinisterData.Estado = data.d.results[i].Estado.Descripción;

                var fechaDesde = data.d.results[i].FechaDesde;
                fechaDesde = fechaDesde.replace("/Date(", "");
                fechaDesde = fechaDesde.replace(")/", "");

                var date_Desde = new Date(fechaDesde);
                var diaDesde = date_Desde.getDay();
                var mesDesde = date_Desde.getMonth() + 1;
                var añoDesde = date_Desde.getYear();

                sinisterData.FechaDesde = diaDesde + "/" + mesDesde + "/" + añoDesde;


                var fechaHasta = data.d.results[i].FechaHasta;
                fechaHasta = fechaHasta.replace("/Date(", "");
                fechaHasta = fechaHasta.replace(")/", "");

                var date_Hasta = new Date(fechaHasta);
                var diaHasta = date.getDay();
                var mesHasta = date.getMonth() + 1;
                var añoHasta = date.getYear();
                sinisterData.FechaHasta = diaHasta + "/" + mesHasta + "/" + añoHasta;
 
                if (sinisterData.FechaHasta != null && sinisterData.Siniestro != "") {
                    $("#reportBody").append("<tr><td>" + sinisterData.Siniestro + "</td><td>" + sinisterData.Estado + "</td><td>" + sinisterData.FechaDesde + "</td><td>" + sinisterData.FechaHasta + "</td></tr>");
                }

            }

            $("#reportContainerTable").DataTable();

        },
        error: console.log("error.")
    });
}

function buildDatatask() {

}

