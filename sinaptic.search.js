"use strict";
var sinaptic = sinaptic || {};

sinaptic.sinisterSearch = function (options) {
    var settings = $.extend({
        element: "#buscadorContainer",
        listName: "Siniestros",
        listColumns: ["Siniestro", "Grupo", "Orden", "Tomador", "Dni", "Dominio", "Estado"]
    }, options);

    function queryList(settings) {
        var statusList = settings.listName;
        var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        var queryUrl = host + "/_vti_bin/listdata.svc/" + statusList + "?$expand=Estado";
        $.ajax({
            url: queryUrl,
            type: "GET",
            async: false,
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) { loadData(data, settings); },
            error: onError
        })
    }

    function onError(err) {
        console.log("Error: " + err.message);
    }

    var loadData = function (data, settings) {
        var structure = '<table id="listaSiniestros" class="table table-striped table-bordered dataTable no-footer" cellspacing="0" width="100%"><thead><tr>';
        $.each(settings.listColumns, function (key, value) {
            structure += '<th>' + value + '</th>';
        });
        structure += '</tr></thead><tbody>';

        var results = data.d.results;
        var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        $(results).each(function (i, item) {
            structure += '<tr onClick="openUrl(\'' + host + '/Paginas/DetallesSiniestro.aspx?#ID=' + item["Identificador"] + '\')">';
            var isClosed = item["SiniestroCancelado"];
            $.each(settings.listColumns, function (key, value) {
                var cellValue = " - ";

                switch (value) {
                    case "Estado":
                        if (item[value] !== null) {

                            cellValue = item[value]["Descripci\u00F3n"];
                            if (isClosed === true) {
                                cellValue += " (Cerrado - " + item["MotivoSiniestroCerrado"] + ")";
                            }
                        }
                        break;
                    default:
                        if (item[value] !== null) {
                            cellValue = item[value];
                        }
                }
                structure += '<td>' + cellValue + '</td>';
            });

            structure += '</tr>';
        });

        structure += '</tbody></table>';
        $(settings.element).html(structure);
        loadFiltersAndSearch(settings.element);
        setSearch();
    };

    var loadFiltersAndSearch = function (container) {
        $('.table').DataTable({
            "language": {
                "sProcessing": "Procesando...",
                "sLengthMenu": "Mostrar _MENU_ siniestros",
                "sZeroRecords": "No se encontraron resultados",
                "sEmptyTable": "Ningún dato disponible en esta tabla",
                "sInfo": "Mostrando tareas del _START_ al _END_ de un total de _TOTAL_ siniestros",
                "sInfoEmpty": "Mostrando tareas del 0 al 0 de un total de 0 siniestros",
                "sInfoFiltered": "(filtrado de un total de _MAX_ siniestros)",
                "sInfoPostFix": "",
                "sSearch": "Buscar:",
                "sUrl": "",
                "sInfoThousands": ",",
                "sLoadingRecords": "Cargando...",
                "oPaginate": {
                    "sFirst": "Primero",
                    "sLast": "Último",
                    "sNext": "Siguiente",
                    "sPrevious": "Anterior"
                },
                "oAria": {
                    "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                    "sSortDescending": ": Activar para ordenar la columna de manera descendente"
                }
            },
            "dom": "Bfrtip",
            "buttons": [
                "copy", "csv", "excel", "pdf", "print"
            ]
        });

    };

    var openUrl = function (url) {
        window.open(url, '_blank');
    };

    $(document).ready(function () {
        queryList(settings);
    });

    var getURLParameter = function (name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }

    var setSearch = function () {
        var criteria = getURLParameter("Search");
        if (criteria != null) {
            $("#listaSiniestros_filter input").val(criteria);
            var table = $('.table').DataTable();
            table.search(criteria).draw();
        }
    }
}();



//"use strict";
//(function ($) {
//    $.fn.crearBuscadorSiniestros = function (options) {
//        var settings = $.extend({
//            element: "#buscadorContainer",
//            listName: "Siniestros",
//            listColumns: ["Siniestro", "Grupo", "Orden", "Tomador", "Dominio", "Estado"]
//        }, options);
//        settings.element = "#" + $(this).attr("id");
//        queryList(settings);
//    };

//}(jQuery));


//var queryList = function (settings) {
//    var statusList = settings.listName;
//    var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
//    var queryUrl = host + "/_vti_bin/listdata.svc/" + statusList + "?$expand=Estado";
//    $.ajax({
//        url: queryUrl,
//        type: "GET",
//        async: false,
//        headers: { "accept": "application/json;odata=verbose" },
//        success: function (data) { loadData(data, settings); },
//        error: function (data) {
//            alert("error");
//        }
//    });
//};

//var loadData = function (data, settings) {
//    var structure = '<table id="listaSiniestros" class="table table-striped table-bordered dataTable no-footer" cellspacing="0" width="100%"><thead><tr>';
//    $.each(settings.listColumns, function (key, value) {
//        structure += '<th>' + value + '</th>';
//    });
//    structure += '</tr></thead><tbody>';

//    var results = data.d.results;
//    var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
//    $(results).each(function (i, item) {
//        structure += '<tr onClick="openUrl(\'' + host + '/Paginas/DetallesSiniestro.aspx?#ID=' + item["Identificador"] + '\')">';
//        var isClosed = item["SiniestroCancelado"];
//        $.each(settings.listColumns, function (key, value) {
//            var cellValue = " - ";

//            switch (value) {
//                case "Estado":
//                    if (item[value] !== null) {

//                        cellValue = item[value]["Descripci\u00F3n"];
//                        if (isClosed === true) {
//                            cellValue += " (Cerrado - " + item["MotivoSiniestroCerrado"] + ")";
//                        }
//                    }
//                    break;
//                default:
//                    if (item[value] !== null) {
//                        cellValue = item[value];
//                    }
//            }
//            structure += '<td>' + cellValue + '</td>';
//        });

//        structure += '</tr>';
//    });

//    structure += '</tbody></table>';
//    $(settings.element).html(structure);
//    loadFiltersAndSearch(settings.element);
//    setSearch();
//};

//var loadFiltersAndSearch = function (container) {
//    $('.table').DataTable({
//        "language": {
//            "sProcessing": "Procesando...",
//            "sLengthMenu": "Mostrar _MENU_ siniestros",
//            "sZeroRecords": "No se encontraron resultados",
//            "sEmptyTable": "Ningún dato disponible en esta tabla",
//            "sInfo": "Mostrando tareas del _START_ al _END_ de un total de _TOTAL_ siniestros",
//            "sInfoEmpty": "Mostrando tareas del 0 al 0 de un total de 0 siniestros",
//            "sInfoFiltered": "(filtrado de un total de _MAX_ siniestros)",
//            "sInfoPostFix": "",
//            "sSearch": "Buscar:",
//            "sUrl": "",
//            "sInfoThousands": ",",
//            "sLoadingRecords": "Cargando...",
//            "oPaginate": {
//                "sFirst": "Primero",
//                "sLast": "Último",
//                "sNext": "Siguiente",
//                "sPrevious": "Anterior"
//            },
//            "oAria": {
//                "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
//                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
//            }
//        },
//        "dom": "Bfrtip",
//        "buttons": [
//            "copy", "csv", "excel", "pdf", "print"
//        ]
//    });

//};

//var openUrl = function (url) {
//    window.open(url, '_blank');
//};


//$(document).ready(function () {
//    $('#buscadorContainer').crearBuscadorSiniestros();
//});

//var getURLParameter = function (name) {
//    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
//}

//var setSearch = function () {
//    var criteria = getURLParameter("Search");
//    if (criteria != null) {
//        $("#listaSiniestros_filter input").val(criteria);
//        var table = $('.table').DataTable();
//        table.search(criteria).draw();
//    }
//}




