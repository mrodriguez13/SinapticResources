"use strinct"
var sinaptic = sinaptic || {};

$.getScript("https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js");

sinaptic.tasksByUserReport = function () {
    var settings = {
        userId: _spPageContextInfo.userId,
        host: window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl,
        listColumnsNames: ["Siniestro", "Estado", "Grupo", "Orden", "Importe Saldo Enviado", "Venc. Saldo Enviado", "Importe Saldo Acreditado", "Venc. Saldo Acreditado", "Desde", "Hasta", "Aging"],
        headerSelector: "#header-container",
        bodySelector: "#body-container",
        footerSelector: "footer-container"
    };

    var users = [];
    getUsersList();

    function getUsersList() {
        var reportUrl = settings.host + "/_vti_bin/listdata.svc/Usuarios?$expand=Usuario";
        $.ajax({
            url: reportUrl,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: loadUsersFilter,
            error: function (data) {
                alert("error:" + JSON.stringify(data));
            }
        });
    }

    function loadUsersFilter(data) {
        var res = data.d.results;
        var structure = [];
        $(res).each(function (i, item) {
            users.push(item.Usuario)
        });
        if (users.length > 0) {
            structure.push('<div class="reportFilter"><select class="form-control" id="usersFilter"><label>USUARIO</label><option selected value="0">TODOS</option>');
            $(users).each(function (i, user) {
                structure.push("<option value='" + user.Identificador + "'>" + user.Nombre + "</option>");
            });
            structure.push("</select></div>");
        }
        $("#header-container").html(structure.join(""));
        $("#usersFilter").change(function () {
            getTasksByUser(this.value);
        });
        getTasksByUser(0);
    }

    function getTasksByUser(userId) {
        var filterByUser = "";
        $(settings.bodySelector).html('<div class="loader"></div>');
        if (userId !== 0){
            filterByUser = '(ModificadoPorId eq ' + userId + ') and ';
        } else {
            filterByUser = '(ModificadoPorId ne null) and ';
        }
        var reportUrl = settings.host + "/_vti_bin/listdata.svc/Historial?$filter=" + filterByUser + "FechaHasta ne null and Siniestro ne null&$expand=Siniestro,Estado";
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
        var structure = [];
        structure.push('<table id="tasksList" class="table table-striped table-bordered dataTable no-footer" cellspacing="0" width="100%"><thead><tr>');
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
            var saldo = parseFloat(item["Siniestro"].SaldoPendiente || "0.00");
            var impoCanc = parseFloat(item["Siniestro"].ImporteACancelar || "0.00");
            var vencimientoDeuda = "";
            var vencimientoCancelacion = "";
            var fechaDesde = "";
            var fechaHasta = "";
            if (item["Siniestro"].VencimientoDeuda){
                var date = moment(item["Siniestro"].VencimientoDeuda);
                date.add(date.utcOffset() * -1, 'm');
                vencimientoDeuda = FormatDate(date._d);
            }
            if (item["Siniestro"]["FechaDeCancelaci\u00f3n"]) {
                var date = moment(item["Siniestro"]["FechaDeCancelaci\u00f3n"]);
                date.add(date.utcOffset() * -1, 'm');
                vencimientoCancelacion = FormatDate(date._d);
            }
            if (item.FechaDesde) {
                var date = moment(item.FechaDesde);
                date.add(date.utcOffset() * -1, 'm');
                fechaDesde = FormatDate(date._d);
            }
            if (item.FechaHasta) {
                var date = moment(item.FechaHasta);
                date.add(date.utcOffset() * -1, 'm');
                fechaHasta = FormatDate(date._d);
            }

            structure.push('<tr onClick="openUrl(\'' + settings.host + '/Paginas/DetallesSiniestro.aspx?#ID=' + item["Identificador"] + '\')">');
            structure.push('<td>' + item["Siniestro"].Siniestro + '</td>');
            structure.push('<td>' + item["Estado"].Descripción + '</td>');
            structure.push('<td>' + item["Siniestro"].Grupo + '</td>');
            structure.push('<td>' + item["Siniestro"].Orden + '</td>');
            structure.push('<td>$' + saldo.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + '</td>');
            structure.push('<td>' + vencimientoDeuda + '</td>');
            structure.push('<td>$' + impoCanc.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + '</td>');
            structure.push('<td>' + vencimientoCancelacion + '</td>');
            structure.push('<td>' + fechaDesde + '</td>');
            structure.push('<td>' + fechaHasta + '</td>');
            structure.push('<td>' + Math.round(item.Aging) + '</td>');
            structure.push('</tr>');
        }
        )

        structure.push('</tbody></table>');

        $(settings.bodySelector).html(structure.join(""));

        loadFooterSearchInputs();
    }

    function FormatDate(date) {
        if(date !== null){
            var auxDate = date.replace("/Date(", "");
            auxDate = new Date(Number(auxDate.replace(")/", "")));
            auxDate = dateToString(auxDate);
            return auxDate;
        }
        return "";
    }

    function dateToString(date) {
        return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    };

    function loadFooterSearchInputs(elemnt) {
        // Setup - add a text input to each footer cell
        $('#tasksList tfoot th').each(function () {
            var title = $(this).text();
            $(this).html('<input type="text" placeholder="Buscar por ' + title + '" />');
        });

        // DataTable
        var table = $('.table').DataTable({
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
        });;

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