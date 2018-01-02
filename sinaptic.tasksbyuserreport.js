"use strinct"
var sinaptic = sinaptic || {};

sinaptic.tasksByUserReport = function () {
    var settings = {
        userId: _spPageContextInfo.userId,
        host: window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl,
        listColumnsNames: ["Siniestro", "Estado", "Desde", "Hasta", "Aging"],
        headerSelector: "#header-container",
        bodySelector: "#body-container",
        footerSelector: "footer-container"
    };

    getTasksByUser(23);

    function getTasksByUser(userId) {
        var reportUrl = settings.host + "/_vti_bin/listdata.svc/Historial?$filter=(ModificadoPorId eq " + userId + ") and FechaHasta ne null&$expand=Siniestro,Estado";
        $.ajax({
            url: reportUrl,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: loadReportDta,
            error: function (data) {
                alert("error:" + JSON.stringify(data));
            }
        });
    }

    function loadReportDta(data) {
        var tasks = data.d.results;
        var structure = ['<table id="tasksList" class="table table-striped table-bordered dataTable no-footer" cellspacing="0" width="100%"><thead><tr>'];
        var struFooter = [];
        $.each(settings.listColumnsNames, function (key, value) {
            structure.push('<th>' + value + '</th>');
            struFooter.push('<th>' + value + '</th>');
        });
        structure.push('</tr></thead>');
        structure.push('<tfoot><tr>' + struFooter.join(""));
        structure.push('</tr></tfoot>');
        structure.push('<tbody>');
        $(tasks).each(function (i, item) {
            structure.push('<tr onClick="openUrl(\'' + settings.host + '/Paginas/DetallesSiniestro.aspx?#ID=' + item["Identificador"] + '\')">');
            structure.push('<td>' + item["Siniestro"].Siniestro + '</td>');
            structure.push('<td>' + item["Estado"].Descripción + '</td>');
            structure.push('<td>' + item.FechaDesde + '</td>');
            structure.push('<td>' + item.FechaHasta + '</td>');
            structure.push('<td>' + item.Aging + '</td>');
            structure.push('</tr>');
        }
        )

        structure.push('</tbody></table>');

        $(settings.bodySelector).html(structure.join(""));

        loadFooterSearchInputs();
    }

    function loadFooterSearchInputs(elemnt) {
        // Setup - add a text input to each footer cell
        $('#tasksList tfoot th').each(function () {
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

    return {
        getTasksByUser: getTasksByUser
    }

}

$(document).ready(function(){
    sinaptic.tasksByUserReport();
})