"use strict";
(function ($) {
    $.fn.crearBuscadorSiniestros = function (options) {
        var settings = $.extend({
            element: "#buscadorContainer",
            listName: "Siniestros",
            listColumns: ["Siniestro", "Grupo", "Orden", "Tomador", "Dominio", "Estado", "VencimientoEstado"],
            listColumnsNames: ["Siniestro", "Grupo", "Orden", "Tomador", "Dominio", "Estado", "Vencimiento"]
        }, options);
        settings.element = "#" + $(this).attr("id");
        queryList(settings);
    };

}(jQuery));


var queryList = function (settings) {
    var statusList = settings.listName;
    var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
    var queryUrl = host + "/_vti_bin/listdata.svc/" + statusList + "?$expand=Estado";
    $.ajax({
        url: queryUrl,
        type: "GET",
        async: false,
        headers: { "accept": "application/json;odata=verbose" },
        success: function (data) { loadData(data, settings); },
        error: function (data) {
            alert("error");
        }
    });
};

var getSemaphore = function (dueDate) {
    var status = getStatusCode(dueDate);
    var ret = "";
    switch (status) {
        case 1:
            ret = '<img class="statusIcon" src="/site/ExpertiseBrokersArgentina/siteassets/img/green_circle.gif" alt="Vigente" height="16" width="16">';
            break;
        case 2:
            ret = '<img class="statusIcon" src="/site/ExpertiseBrokersArgentina/siteassets/img/yellow_circle.png" alt="Próxima a vencer" height="16" width="16">';
            break;
        case 3:
            ret = '<img class="statusIcon" src="/site/ExpertiseBrokersArgentina/siteassets/img/red_circle.gif" alt="Vencida" height="16" width="16">';
            break;

    }
    return ret;
};

var getStatusCode = function (dueDate) {
    dueDate = dueDate.replace("/Date(", "");
    dueDate = new Date(Number(dueDate.replace(")/", "")));
    dueDate = dueDate.setHours(0, 0, 0, 0);

    var currDate = new Date();
    currDate = currDate.setHours(0, 0, 0, 0);

    var tomorrow = new Date();
    tomorrow = tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow = new Date(tomorrow).setHours(0, 0, 0, 0);

    if (tomorrow === dueDate) {
        return 2;
    }
    if (currDate >= dueDate) {
        return 3;
    }

    return 1;
}

var loadData = function (data, settings) {
    var structure = '<table id="listaSiniestros" class="table table-striped table-bordered dataTable no-footer" cellspacing="0" width="100%"><thead><tr>';
    var strufooter = '';
    $.each(settings.listColumnsNames, function (key, value) {
        structure += '<th>' + value + '</th>';
        strufooter += '<th>' + value + '</th>';
    });
    structure += '</tr></thead>';
    structure += '<tfoot><tr>' + strufooter;
    structure += '</tr></tfoot>';
    structure += '<tbody>';

    var results = data.d.results;
    var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
    $(results).each(function (i, item) {
        structure += '<tr onClick="openUrl(\'' + host + '/Paginas/DetallesSiniestro_desa.aspx?#ID=' + item["Identificador"] + '\')">';
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
                case "VencimientoEstado":
                    if (item[value] !== null) {
                        cellValue = getSemaphore(item[value]);
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
    loadFooterSearchInputs(settings.element);
};

var loadFooterSearchInputs = function (element) {
    // Setup - add a text input to each footer cell
    $(element +' tfoot th').each(function () {
        var title = $(this).text();
        $(this).html('<input type="text" placeholder="Buscar por ' + title + '" />');
    });

    // DataTable
    var table = $('.table').DataTable();;

    // Apply the search
    table.columns().every(function () {
        var that = this;

        $('input', this.footer()).on('keyup change', function () {
            if (that.search() !== this.value) {
                that
                    .search(this.value)
                    .draw();
            }
        });
    });
}

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
        "targets": [6], "searchable": false, "orderable": false, "visible": true,
        "buttons": [
            "copy", "csv", "excel", "pdf", "print"
        ]
    });
};

var openUrl = function (url) {
    window.open(url, '_blank');
};


$(document).ready(function () {
    $('#buscadorContainer').crearBuscadorSiniestros();
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




