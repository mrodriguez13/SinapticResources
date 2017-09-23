
var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;

$(document).ready(function () {
    
    getFromHistory();
    buildDatatask();
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

            console.log(data.d.results);

        },
        error: console.log("error.")
    });
}

function buildDatatask() {

}

