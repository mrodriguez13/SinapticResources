"use strict";

var sinaptic = sinaptic || {};

sinaptic.vm = sinaptic.vm || {};

sinaptic.posa = function (options) {
    var settings = {
        userId: _spPageContextInfo.userId,
        host: window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl,
        tasksByStatusChartId: "#tasksByStatusChart",
        sinistersByStatusChartId: "#sinistersByStatusChart"
    };

    var vm = [];

    refreshContents();

    function getUserGruop() {
        var usersUrl = settings.host + "/_vti_bin/listdata.svc/Usuarios?$expand=Grupo&$filter=(UsuarioId eq " + settings.userId + ")";
        $.ajax({
            url: usersUrl,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: getLoadContentByGroup,
            error: errorHandler
        });
    }

    function getLoadContentByGroup(data) {
        var group = data.d.results[0].GrupoId;

        var accionesUrl = settings.host + "/_vti_bin/listdata.svc/Acciones?$filter=(CategoriaId eq " + group + ")";
        $.ajax({
            url: accionesUrl,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: showActionButtons,
            error: errorHandler
        });

        var url = settings.host + "/_vti_bin/listdata.svc/Estados?$filter=(GrupoId eq " + group + ")";
        $.ajax({
            url: url,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: getTasksByStatus,
            error: errorHandler
        });
    }

    function showActionButtons(data) {
        var actions = data.d.results;
        var struActions = [];
        $(actions).each(function (i, action) {
            switch (action.Identificador.toUpperCase()) {
                case "ALTASINIESTRO":
                    struActions.push("<div class=\"btn actionButton\" onclick=\"sinaptic.wf.showCreateSinister();\"><i class=\"glyphicon glyphicon-list-alt pull-left\"></i> Nuevo Siniestro</div>");
                    break;
                case "ADMINSINIESTRO":
                    struActions.push("<div class=\"btn actionButton\" onclick=\"window.location.href='" + settings.host + "/Paginas/AdminTasks.aspx'\"><i class=\"glyphicon glyphicon-cog pull-left\"></i> Aministraci\u00F3n de Siniestros</div>");
                    break;
            }
        });
        struActions.push("<div id=\"Buscador\" class=\"pull-right\"><input type=\"text\" class=\"searchBox\" placeholder=\"Buscador de siniestros\" onkeyup=\"return sinaptic.wf.hasPressedEnter(event)\"><img class=\"searchImg\" src=\"/site/ExpertiseBrokersArgentina/SiteAssets/home/img/search-icon-marine-hi.png\" height=\"15px\" alt=\"\"></div>");
        struActions = "<div class=\"row\">" + struActions.join("") + "</div>";
        $("#actionsBar").html(struActions);
    }

    function getTasksByStatus(data) {
        var status = data.d.results;
        var filter = getStatusFilter(status);
        var url = settings.host + "/_vti_bin/listdata.svc/Siniestros?$expand=Estado,Carrier&$filter=( " + filter + ") and EstadoId ne 32";
        $.ajax({
            url: url,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: renderTasks,
            error: errorHandler
        });
    }

    function getStatusFilter(data) {
        var ret = "EstadoId eq ";
        $(data).each(function (i, state) {
            ret += state.Identificador + " or EstadoId eq ";
        });
        ret = ret.substring(0, ret.length - 16);
        return ret;
    }

    function getAgingByStatus() {
        var url = settings.host + "/_vti_bin/listdata.svc/Historial?$expand=Estado&$filter=EstadoId ne 32&$top=5000";
        $.ajax({
            url: url,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: processAgingResults,
            error: errorHandler
        });
    }

    function processAgingResults(data) {
        var results = data.d.results;
        vm.agingByStatus = vm.agingByStatus || [];
        $(results).each(function (i, item) {
            var exists = false;
            for (var j = 0; j < vm.agingByStatus.length; ++j) {
                if (vm.agingByStatus[j].Estado == item.Estado["Descripci\u00F3n"]) {
                    vm.agingByStatus[j].Qty += 1;
                    vm.agingByStatus[j].Aging += Number(item.Aging);
                    exists = true;
                }
            }
            if (!exists) {
                vm.agingByStatus.push({ Estado: item.Estado["Descripci\u00F3n"], Qty: 1, Aging: Number(item.Aging) });
            }
        });
        $(vm.agingByStatus).each(function (i, item) {
            item.Aging = Math.round(Number(item.Aging) / item.Qty);
            if (item.Aging === 0) {
                item.Aging = 1;
            }
        });
        renderAgingByStatusChart();
    }

    function sumTaskByStatus(status) {
        vm.tasksByStatus = vm.tasksByStatus || [];
        var exists = false;
        $(vm.tasksByStatus).each(function (i, task) {
            if (task.Estado == status) {
                task.Qty++;
                exists = true;
            }
        })
        if (!exists) {
            vm.tasksByStatus.push({ Estado: status, Qty: 1 });
        }
    }

    function sumOverdueTaskByStatus(status) {
        vm.overdueByStatus = vm.overdueByStatus || [];
        var exists = false;
        $(vm.overdueByStatus).each(function (i, task) {
            if (task.Estado == status) {
                task.Qty++;
                exists = true;
            }
        })
        if (!exists) {
            vm.overdueByStatus.push({ Estado: status, Qty: 1 });
        }
    }

    function sumSinisterByStatus(status) {
        vm.sinisterByStatus = vm.sinisterByStatus || [];
        var exists = false;
        $(vm.sinisterByStatus).each(function (i, sinister) {
            if (sinister.Estado == status) {
                sinister.Qty++;
                exists = true;
            }
        })
        if (!exists) {
            vm.sinisterByStatus.push({ Estado: status, Qty: 1 });
        }
    }

    function sumSinisterByCreatedDate(date) {
        date = date.replace("/Date(", "");
        date = new Date(Number(date.replace(")/", "")));
        var idx = date.getDate();
        date = date.setHours(0, 0, 0, 0);
        vm.sinistersByCreatedDate = vm.sinistersByCreatedDate || [];
        var exists = false;
        for (var i = 0; i < vm.sinistersByCreatedDate.length; ++i) {
            if (vm.sinistersByCreatedDate[i].Date === date) {
                vm.sinistersByCreatedDate[i].Qty += 1;
                exists = true;
            }
        }
        if (!exists) {
            vm.sinistersByCreatedDate.push({ Date: date, Idx: idx, Qty: 1 });
        }
    }

    function sumSinisterByClosedDate(date) {
        var date = moment(date);
        date.add(date.utcOffset() * -1, 'm');
        date = date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        var idx = date._d.getDate();
        vm.sinistersByClosedDate = vm.sinistersByClosedDate || [];
        var exists = false;
        for (var i = 0; i < vm.sinistersByClosedDate.length; ++i) {
            if (vm.sinistersByClosedDate[i].Date === date) {
                vm.sinistersByClosedDate[i].Qty += 1;
                exists = true;
            }
        }
        if (!exists) {
            vm.sinistersByClosedDate.push({ Date: date, Idx: idx, Qty: 1 });
        }
    }

    function renderTasks(data) {
        var sinisters = data.d.results;
        var content = ""
        var tasks = [];
        $(sinisters).each(function (i, sinister) {
            var descStatus = sinister.Estado["Descripci\u00F3n"] || "";
            var vencimientoDeuda = "";
            var vencimientoTarea = "";
            var fechaCancelacion = "";
            var dueDate = new Date();
            if (sinister.VencimientoDeuda != undefined && sinister.VencimientoDeuda != null) {
                vencimientoDeuda = sinister.VencimientoDeuda.replace("/Date(", "");
                vencimientoDeuda = new Date(Number(vencimientoDeuda.replace(")/", "")));
                vencimientoDeuda = dateToString(vencimientoDeuda);
            }
            if (sinister.VencimientoEstado != undefined && sinister.VencimientoEstado != null) {
                var date = moment(sinister.VencimientoEstado);
                date.add(date.utcOffset() * -1, 'm');
                vencimientoTarea = dateToString(date._d);
                dueDate = date._d;
            }
            if (sinister["FechaDeCancelaci\u00f3n"] != undefined && sinister["FechaDeCancelaci\u00f3n"] != null) {
                fechaCancelacion = sinister["FechaDeCancelaci\u00f3n"].replace("/Date(", "");
                fechaCancelacion = new Date(Number(fechaCancelacion.replace(")/", "")));
                fechaCancelacion = dateToString(fechaCancelacion);
            }
            var currSinister = {
                siniestro: sinister.Siniestro,
                identificador: sinister.Identificador,
                idhistorial: sinister.IdHistorial,
                estado: descStatus,
                grupo: sinister.Grupo,
                orden: sinister.Orden,
                tomador: sinister.Tomador,
                carrier: sinister.Carrier["T\u00edtulo"],
                dominio: sinister.Dominio,
                responsableId: sinister.ResponsableId,
                fechaSiniestro: sinister.FechaSiniestro,
                mailcliente: sinister.MailCliente,
                mailcompania: sinister.MailCia,
                modelovehiculo: sinister.ModeloVehiculo,
                numerodecheque: sinister.NumeroDeCheque,
                modocancelacion: sinister["ModoDeCancelaci\u00f3nValue"],
                fechadecancelacion: fechaCancelacion,
                comprobantenumero: sinister.ComprobanteN,
                saldopendiente: sinister.SaldoPendiente,
                sumaasegurada: sinister.SumaAsegurada,
                telefonocliente: sinister.TelCliente,
                telefonocompania: sinister.TelCia,
                tipovehiculo: sinister.TipoVehiculo,
                tiporesolucion: sinister["TipoDeResuloci\u00f3nValue"],
                tiposiniestro: sinister.TipoDeSiniestroValue,
                teamleaderId: sinister.TeamLeaderId,
                vencimientodeuda: vencimientoDeuda,
                linksiniestro: settings.host + "/Paginas/DetallesSiniestro.aspx?#ID=" + sinister.Identificador,
                motivoRechazo: sinister.MotivoRechazo
            };
            var task = {
                ID: sinister.Identificador,
                ACTION_LINK: "sinaptic.wf.showTaskForm(\'" + JSON.stringify(currSinister) + "\', " + sinister.Estado["Identificador"] + ")",
                TASK: descStatus,
                SINISTER: sinister.Siniestro || "",
                GROUP: sinister.Grupo || "0",
                ORDER: sinister.Orden || "0",
                EXP_DATE: vencimientoTarea
            };
            if (descStatus !== "")
                sumTaskByStatus(descStatus);
            if (descStatus !== "" && dueDate <= new Date())
                sumOverdueTaskByStatus(descStatus);
            tasks.push(task);
        })
        var context = {
            TASKS: tasks
        };

        var source = $("#userTasks-template").html();
        var template = Handlebars.compile(source);
        var estructura = template(context);
        $("#userTasksContainer").html(estructura);
        $("#userTasks").DataTable({
            "language": {
                "sProcessing": "Procesando...",
                "sLengthMenu": "Mostrar _MENU_ tareas",
                "sZeroRecords": "No se encontraron resultados",
                "sEmptyTable": "Ningún dato disponible en esta tabla",
                "sInfo": "Mostrando tareas del _START_ al _END_ de un total de _TOTAL_ tareas",
                "sInfoEmpty": "Mostrando tareas del 0 al 0 de un total de 0 tareas",
                "sInfoFiltered": "(filtrado de un total de _MAX_ tareas)",
                "sInfoPostFix": "",
                "sSearch": "Buscar Tarea:",
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
        renderTasksByStatusChart();
        renderOverdueByStatuschart();

    
    }

    function renderTasksByStatusChart() {
        var dataTasks = [];
        $(vm.tasksByStatus).each(function (i, status) {
            dataTasks.push({ estado: status.Estado, cantidad: status.Qty })
        })
        $("#tasksByStatus").empty();
        new Morris.Bar({
            // ID of the element in which to draw the chart.
            element: "tasksByStatus",
            // Chart data records -- each entry in this array corresponds to a point on
            // the chart.
            data: dataTasks,
            // The name of the data record attribute that contains x-values.
            xkey: "estado",
            // A list of names of data record attributes that contain y-values.
            ykeys: ["cantidad"],
            // Labels for the ykeys -- will be displayed when you hover over the
            // chart.
            labels: ["Cantidad"]
        });
    }

    function renderSinistersByStatusChart() {
        var dataSinisters = [];
        $(vm.sinisterByStatus).each(function (i, status) {
            dataSinisters.push({ label: status.Estado, value: status.Qty })
        })

        $("#sinistersByStatus").empty();

        new Morris.Donut({
            element: "sinistersByStatus",
            data: dataSinisters
        });
    }

    function renderAgingByStatusChart() {
        var dataAging = [];
        $(vm.agingByStatus).each(function (i, status) {
            dataAging.push({ estado: status.Estado, cantidad: status.Aging })
        })
        $("#agingByStatus").empty();
        new Morris.Bar({
            // ID of the element in which to draw the chart.
            element: "agingByStatus",
            // Chart data records -- each entry in this array corresponds to a point on
            // the chart.
            data: dataAging,
            // The name of the data record attribute that contains x-values.
            xkey: "estado",
            // A list of names of data record attributes that contain y-values.
            ykeys: ["cantidad"],
            // Labels for the ykeys -- will be displayed when you hover over the
            // chart.
            labels: ["Cantidad de d\u00edas"]
        });
    }

    function renderOverdueByStatuschart() {
        var dataOverdue = [];
        $(vm.overdueByStatus).each(function (i, status) {
            dataOverdue.push({ estado: status.Estado, cantidad: status.Qty })
        })
        $("#overdueTasksContainer").empty();
        $("#overdueTasksContainer").width(500).height(250);
        new Morris.Bar({
            // ID of the element in which to draw the chart.
            element: "overdueTasksContainer",
            // Chart data records -- each entry in this array corresponds to a point on
            // the chart.
            data: dataOverdue,
            // The name of the data record attribute that contains x-values.
            xkey: "estado",
            // A list of names of data record attributes that contain y-values.
            ykeys: ["cantidad"],
            // Labels for the ykeys -- will be displayed when you hover over the
            // chart.
            labels: ["Cantidad de Tareas"]
        });
    }

    function renderCreatedClosedSinistersChart() {
        var labels = [];
        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 0);
        var lastDayNumber = lastDay.getDate();
        var newSinistersValues = Array.apply(null, Array(lastDayNumber)).map(Number.prototype.valueOf, 0);
        var closedSinistersValues = Array.apply(null, Array(lastDayNumber)).map(Number.prototype.valueOf, 0);;


        for (var i = 1; i <= lastDayNumber; i++) {
            labels.push(i.toString());
        }

        $(vm.sinistersByCreatedDate).each(function (i, sinister) {
            if (sinister.Date >= firstDay && sinister.Date <= lastDay) {
                newSinistersValues[sinister.Idx - 1] = sinister.Qty;
            }
        })

        $(vm.sinistersByClosedDate).each(function (i, sinister) {
            if (sinister.Date >= firstDay && sinister.Date <= lastDay) {
                closedSinistersValues[sinister.Idx - 1] = sinister.Qty;
            }
        })

        var ctx = document.getElementById("newsAndClosedSinisters").getContext("2d");
        var myChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Nuevos",
                    borderColor: "rgb(0, 204, 51)",
                    data: newSinistersValues
                },
                    {
                        label: "Cerrados",
                        borderColor: "rgb(204, 51, 0)",
                        data: closedSinistersValues,
                    }]
            }
        });
    }

    function errorHandler(data) {
        console.log("Error: " + data);
    }

    var hasPressedEnter = function(e) {
        var keynum;

        if (window.event) { // IE                    
            keynum = e.keyCode;
        } else if (e.which) { // Netscape/Firefox/Opera                   
            keynum = e.which;
        }

        if (keynum == 13) {
            var serchString = $(".searchBox").val();
            window.location.href = "/site/expertisebrokersargentina/paginas/buscador.aspx?Search=" + serchString;
        }
    }

    function getStatus() {
        var url = settings.host + "/_vti_bin/listdata.svc/Estados";
        $.ajax({
            url: url,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) {
                var res = data.d.results;
                var status = [];
                $(res).each(function (i, state) {
                    var st = {
                        Id: state.Identificador,
                        Title: state["Descripci\u00F3n"],
                        Color: state.Color,
                        Alert1: state.Alerta1,
                        Alert2: state.Alerta2,
                        Qty: 0
                    };
                    status.push(st);
                })
                vm.push(status);
            },
            error: errorHandler
        });
    }

    function getSinisters() {
        var url = settings.host + "/_vti_bin/listdata.svc/Siniestros?$expand=Estado&$top=50000";
        $.ajax({
            url: url,
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) {
                var res = data.d.results;
                var sinisters = [];
                $(res).each(function (i, sinister) {
                    if (sinister.Creado != null)
                        sumSinisterByCreatedDate(sinister.Creado);
                    if (sinister.EstadoId !== 32) {
                        var descStatus = sinister.Estado["Descripci\u00F3n"];
                        if (descStatus !== "")
                            sumSinisterByStatus(descStatus);
                    }
                    else {
                        if (sinister.FechaDeCierreDeSiniestro != null)
                            sumSinisterByClosedDate(sinister.FechaDeCierreDeSiniestro);
                    }
                })
                renderSinistersByStatusChart();
                renderCreatedClosedSinistersChart();
            },
            error: errorHandler
        });
    }

    function dateToString(date) {
        return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    };

    function refreshContents() {
        getUserGruop();
        getStatus();
        getSinisters();
        getAgingByStatus();
    }

    var refresh = function () {
        refreshContents();
    }

    return {
        refresh: refresh,
        vm: vm
    }

};
