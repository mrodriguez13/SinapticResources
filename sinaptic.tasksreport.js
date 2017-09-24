
var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;

$(document).ready(function () {
    getCurrentUser();
    getFromHistory();


});

function getCurrentUser() {

}

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
            var currentUserId = _spPageContextInfo.userId;

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

                if (fechaDesde != null && fechaDesde != "") {
                    fechaDesde = fechaDesde.replace("/Date(", "");
                    fechaDesde = fechaDesde.replace(")/", "");

                    var date_Desde = new Date(parseInt(fechaDesde));
                    var diaDesde = date_Desde.getDate() < 10 ? "0" + date_Desde.getDate() : date_Desde.getDate();

                    var mesDesde = date_Desde.getMonth() + 1;

                    if (mesDesde < 10) {
                        mesDesde = "0" + mesDesde;
                    }

                    var añoDesde = date_Desde.getFullYear();

                    sinisterData.FechaDesde = diaDesde + "/" + mesDesde + "/" + añoDesde;
                }

                var fechaHasta = data.d.results[i].FechaHasta;

                if (fechaHasta != null && fechaHasta != "") {
                
                fechaHasta = fechaHasta.replace("/Date(", "");
                fechaHasta = fechaHasta.replace(")/", "");
                var date_Hasta = new Date(parseInt(fechaHasta));
                var diaHasta = date_Hasta.getDate() < 10 ? "0" + date_Hasta.getDate() : date_Hasta.getDate();
                var mesHasta = date_Hasta.getMonth() + 1;

                if (mesHasta < 10) {
                    mesHasta = "0" + mesHasta;
                }

                var añoHasta = date_Hasta.getFullYear();
                sinisterData.FechaHasta = diaHasta + "/" + mesHasta + "/" + añoHasta;
                }

                


                if (sinisterData.FechaHasta != null && sinisterData.Siniestro != "" && data.d.results[i].ModificadoPorId == currentUserId) {
                    $("#reportBody").append("<tr><td>" + sinisterData.Siniestro + "</td><td>" + sinisterData.Estado + "</td><td>" + sinisterData.FechaDesde + "</td><td>" + sinisterData.FechaHasta + "</td></tr>");
                }

            }

            //$("#reportContainerTable").DataTable();

            $('#reportContainerTable').DataTable({
                dom: 'Bfrtip',
                buttons: [
                    'copy', 'csv', 'excel', 'pdf', 'print'
                ]
            });


        },
        error: console.log("error.")
    });
}
