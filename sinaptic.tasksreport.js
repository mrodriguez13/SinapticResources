
$(document).ready(function () {
    
    getFromHistory();
    buildDatatask();
});



function getFromHistory() {
    var usersUrl = settings.host + "/_vti_bin/listdata.svc/Historial";

    $.ajax({
        url: usersUrl,
        type: "GET",
        async: true,
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function (data) {

            console.log(data.d.results);

        },
        error: errorHandler
    });
}

function buildDatatask() {

}

