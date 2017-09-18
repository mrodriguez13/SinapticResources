"use strict";
var sinaptic = sinaptic || {};


sinaptic.adminTasks = (function () {
    var context;
    var web;

    var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
    var listSiniestros = "Siniestros";
    var listEstados = "Estados";
    var templateListTasks = "";
    var listFields = "ID,Siniestro,Estado,Tomador,Carrier,Tipo,Título";
    var allStatus = [{ statusId: 21, status: "A - Asignacion de responsable", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: '' },
    { statusId: 22, status: "B - Procesar formularios y certificado", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: '' },
    { statusId: 23, status: "C - Certificar formulario de baja", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: '' },
    { statusId: 24, status: "D - Obtener Conformidad Documentacion Compañia", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: '' },
    { statusId: 25, status: "F - Informar Saldo Deudor a Willis", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'LSD' },
    { statusId: 26, status: "G - Informar Saldo Deudor a Compañia", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'LSD' },
    { statusId: 27, status: "H - Informar Rendicion a Plan Ovalo", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'LSD' },
    { statusId: 28, status: "I - Acreditar Fondos a Cuenta Plan Ovalo", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'LSD' },
    { statusId: 29, status: "J - Aplicar Fondos al Plan de Ahorros", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'LSD' },
    { statusId: 30, status: "K - Liberar Prenda Cancelada", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: '' },
    { statusId: 31, status: "L - Enviar Prenda a Compañia", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: '' },
    { statusId: 32, status: "M - Siniestro Cerrado", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: '' },
    { statusId: 33, status: "N - Autorizar Reposicion", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'RU' },
    { statusId: 34, status: "O - Solicitar Factura a Compañia", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'RU' },
    { statusId: 35, status: "P - Remitir Factura a Plan Ovalo", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'RU' },
    { statusId: 36, status: "Q - Enviar Formularios por Reposicion a Willis", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'RU' },
    { statusId: 37, status: "R - Remitir Formularios por Reposicion a Compañia", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'RU' },
    { statusId: 38, status: "S - Remitir Nueva Prenda a Plan Ovalo", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'RU' },
    { statusId: 39, status: "T - Verificar Nueva Prenda", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'RU' },
    { statusId: 40, status: "U - Enviar Prenda Rechazada a Compañia", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'RU' },
    { statusId: 41, status: "V - Remitir Prenda Corregida a Plan Ovalo", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: 'RU' },
    { statusId: 42, tatus: "E - Solicitar Documentacion al Cliente", venc1: "", venc2: "", gen: false, group: '', days1: '', days2: '', tipoResolucion: '' }];
    var allClosedCategories = ["Cerrado - No Configura Destrucción Total", "Cerrado - Plan de Ahorro Cancelado", "Cerrado - Prescripto", "Cerrado - Rechazado", "Cerrado - Titular Fallecido", "Cerrado - Vehículo Aparecido"];
    var listSiniestrosURL = host + "/_vti_bin/listdata.svc/" + listSiniestros + "?$expand=CreadoPor,Carrier,AsignadoA,Estado&$filter=(Estado/T%C3%ADtulo ne 'M - Siniestro Cerrado')";// and (SiniestroCancelado ne true)"//$select='" + listFields + "'";
    var Task = "";
    var getAllStatus = function () {
        return allStatus;
    }
    var usrAssigned;
    var idVencRelated;
    var oldTaskIDRelated = 0;
    var newTaskID = "";
    var newTaskListName = "";
    var idCurrentSinisterInProccess = 0;
    var newCurrentStatusNameInProccess = "";
    var SinisterRecovering = false;
    var openTasks = [];
    var sinistersObjs = [];

    var groupNew = "";
    var orderNew = "";
    var historyID = "";

    var SinisterObject = {
        name: "",
        idHistorial: "",
        idSin: "",
        group: "",
        order: "",
        responsable: ""

    }
    var destinatariosAlerta1Restore = "";
    var getAllStatusFromList = function () {
        var listEstadosURL = host + "/_vti_bin/listdata.svc/Estados?$expand=Grupo";
        $.ajax({
            url: listEstadosURL,
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: retrieveAllStatus,
            complete: getAllClosedStatusFromList,
        });
    };
    var retrieveAllStatus = function (data) {
        var resData = data.d.results;
        $(resData).each(function (i, item) {
            allStatus[i].status = item.Título;
            allStatus[i].gen = item["TareaGenérica"];
            allStatus[i].venc1 = calculateVencDate(item["Alerta1"]);
            allStatus[i].venc2 = calculateVencDate(item["Alerta2"]);
            allStatus[i].days1 = Number(item["Alerta1"]);
            allStatus[i].days2 = Number(item["Alerta2"]);
            var groupName = item["Grupo"];
            if (groupName != null) {
                groupName = groupName.Título;
            } else {
                groupName = "";
            }
            allStatus[i].group = groupName

        });
    }
    var getAllClosedStatusFromList = function () {
        var listClosedCategoriesURL = host + "/_vti_bin/listdata.svc/CategoriasCerrado?";
        $.ajax({
            url: listClosedCategoriesURL,
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: retrieveAllClosedStatus,
            complete: function () {
                if (window.location.search.substring(1) == "") {
                    getOpenSiniestros();
                }
                else {
                    getExactlySiniestro();
                }
            },
        });
    };
    var retrieveAllClosedStatus = function (data) {
        var resData = data.d.results;
        $(resData).each(function (i, item) {
            allClosedCategories[i] = item.Título;
        });
    };
    var init = function () {
        getAllStatusFromList();
        //if (window.location.search.substring(1) == "") {
        //    getOpenSiniestros();
        //}
        //else {
        //    getExactlySiniestro();
        //}
    }
    var GetURLParameter = function (sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }
    var getExactlySiniestro = function () {
        var groupURL = GetURLParameter('gp');
        var orderURL = GetURLParameter('or');
        var titleURL = decodeURI(GetURLParameter('title'));
        titleURL = titleURL.replace("á", "a")
        titleURL = titleURL.replace("é", "e")
        titleURL = titleURL.replace("í", "i")
        titleURL = titleURL.replace("ó", "o")
        titleURL = titleURL.replace("ú", "u")
        if (titleURL == "Asignacion de Responsable") {
            titleURL = "Asignacion de responsable";
        }

        titleURL = getStatusFullName(titleURL);


        var listSiniestrosURLWithParams = host + "/_vti_bin/listdata.svc/" + listSiniestros + "?$expand=CreadoPor,Carrier,AsignadoA,Estado&$filter=(Estado/T%C3%ADtulo ne 'M - Siniestro Cerrado') and (Grupo eq '" + groupURL + "') and (Orden eq '" + orderURL + "') and (Estado/T%C3%ADtulo eq '" + titleURL + "')";
        $.ajax({
            url: listSiniestrosURLWithParams,
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: getSiniestrosData,
        });
    }


    var getOpenSiniestros = function () {
        $.ajax({
            url: listSiniestrosURL,
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: getSiniestrosData,
        });
    }
    var getSiniestrosData = function (data) {
        var resData = data.d.results;
        var tasksStructure = "<div class='itemTask header'><div class='title'>Siniestro</div><div class='idSinister'>ID Siniestro</div><div class='status'>Estado</div><div class='group'>Grupo</div><div class='order'>Orden</div><div class='button'></div></div>";
        var headerContainer = "<div class='titleContainer'><h2>Panel de Control de Siniestros Abiertos</h2>" +
            "<div class='searchContainer'>" +
  		"<input type='text' class='searchBox' placeholder='Escriba su Búsqueda...' onkeypress='return adminTasks.enterPressed(event)'><div class='searchButton'>" +
	"<img src='https://access.willis.com/site/ExpertiseBrokersArgentina/PublishingImages/search-3-xxl.png'>" +
"</div>" +
  "</div>" +
            "<div id='SinisterContainer'>" +
            "</div>";
        $("#Sinisters").html(headerContainer);
        $(resData).each(function (i, item) {
            sinistersObjs.push(item);
            var asignado = "";
            if (item.AsignadoA != null) {
                asignado = item.AsignadoA.Título;
            }
            var estado = item.Estado.Título;
            var siniestro = item.Siniestro;
            var grupo = item.Grupo;
            var orden = item.Orden;
            var idSiniestro = item.Identificador;
            if (item["SiniestroCancelado"]) {
                tasksStructure += "<div class='itemTask canceled' data-idHistory='" + item.IdHistorial + "'><div class='title' data-sinister='" + siniestro + "'>" + siniestro.toUpperCase() + "</div><div class='idSinister'>" + idSiniestro + "</div><div class='status'>" + buildComboBox(estado) + "</div><div class='group' data-group='" + grupo + "'><input type='text' class='groupInbox' value='" + grupo + "'/></div><div class='order' data-order='" + orden + "'><input type='text' class='orderInbox' value='" + orden + "'/></div><div class='button' data-oldTask='" + estado + "'><button type='button' class='restoreSinister'>Restaurar Siniestro Cancelado</button></div></div>";

            } else {
                tasksStructure += "<div class='itemTask' data-idHistory='" + item.IdHistorial + "'><div class='title' data-sinister='" + siniestro + "'>" + siniestro.toUpperCase() + "</div><div class='idSinister'>" + idSiniestro + "</div><div   class='status'>" + buildComboBox(estado) + "</div><div class='group' data-group='" + grupo + "'><input type='text' class='groupInbox' value='" + grupo + "'/></div><div class='order' data-order='" + orden + "'><input type='text' class='orderInbox' value='" + orden + "'/></div><div class='button' data-oldTask='" + estado + "'></div></div>";
            }

            //<div class='asigned'>"+asignado+"</div>

        });

        $("#SinisterContainer").html(tasksStructure);
        changeState();
        updateButton();
        $(".searchButton").click(function () {
            seachOpenSinister();
        })
        restoreSinisterClick()
        $(".canceled select").prop("disabled", true);
        $(".canceled input").prop("disabled", true);

    }
    var enterPressed = function (e) {
        if (e.keyCode == 13) {
            seachOpenSinister();
            return false;
        }
    }
    var seachOpenSinister = function () {
        var filter = $("input.searchBox").val();
        $(".itemTask:not('.header')").css("display", "none");
        $(".itemTask:contains('" + filter.toUpperCase() + "'):not('.header')").css("display", "block");
        $(".itemTask input").each(function (i, item) {
            if ($(item).val().indexOf(filter) >= 0) {
                $(item).parent().parent().css("display", "block");
            }
        })
        //var listSiniestrosURLSearch = host + "/_vti_bin/listdata.svc/" + listSiniestros + "?$select=*,Siniestro&$expand=CreadoPor,Carrier,AsignadoA,Estado&$filter=(Estado/Título ne 'M - Siniestro Cerrado') and (Siniestro eq '" + filter + "')";
        //$.ajax({
        //    url: listSiniestrosURLSearch,
        //    async: true,
        //    headers: { "accept": "application/json;odata=verbose" },
        //    success: getSiniestrosData,
        //});
    }

    var restoreSinisterClick = function () {
        $("button.restoreSinister").click(function () {
            var sin = $(this).parent().parent().find(".title").attr("data-sinister");
            var idSin = $(this).parent().parent().find(".idSinister").text();
            var oldStatus = $(this).parent().attr("data-oldTask");
            //var newStatus = $(this).attr("data-newTask");
            var group = $(this).parent().parent().find(".group").attr("data-group");
            var order = $(this).parent().parent().find(".order").attr("data-order");
            var venc1 = getVencByStatus(oldStatus, "venc1");
            var venc2 = getVencByStatus(oldStatus, "venc2");
            if (confirm("Esta seguro que quiere restaurar un Siniestro Cancelado?") == true) {
                historyID = $(this).parent().parent().attr("data-idHistory");
                recoverOldTask(sin, idSin, oldStatus, "", oldStatus, "", group, order, venc1, venc2, "");
            }
            //updateSinisterRestore(sin, idSin, oldStatus, "", oldStatus, "", group, order, venc1, venc2);


        });
    }
    var updateSinisterRestore = function (sin, idSin, oldStatus, listTareasURL, oldStatus, statusLetter, group, order, venc1, venc2) {
        var siteURL = $(location).attr('href');
        context = new SP.ClientContext.get_current();
        web = context.get_web();
        SP.ClientContext.prototype.executeQuery = function () {
            var deferred = $.Deferred();
            this.executeQueryAsync(
                function () { deferred.resolve(arguments); },
                function () { deferred.reject(arguments); }
            );
            return deferred.promise();
        };
        //var titleName = document.title;
        var mListName = "Siniestros";
        var mList = web.get_lists().getByTitle(String(mListName));
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>100</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);
        context.load(collListItem);
        var promiseList = context.executeQuery();
        promiseList.done(function () {

            console.log("done!!!");
        });
        promiseList.then(function (sArgs) {
            restoreSinister(sin, idSin, oldStatus, "", oldStatus, "", group, order, venc1, venc2);
        }, function (fArgs) {
            console.log("error");
            console.log(fArgs[1].get_message());
        });
        return promiseList;
    }
    var restoreSinister = function (sin, id, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {

        console.log('Got the collection!');

        var listItemEnumerator = collListItem.getEnumerator();
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();
                if (curritem.get_id() == id) {
                    curritem.set_item("IdHistorial", historyID);
                    curritem.set_item("Siniestro_x0020_Cancelado", false);
                    SinisterObject.responsable = curritem.get_item("Responsable").get_lookupId();
                    curritem.update();
                    //alert("updated!!!");
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        console.log("Siniestro Restaurado!!");
                        getUserDetails(venc1, venc2, newStatus, SinisterObject.responsable);
                    }, function (fArgs) {
                        console.log("error");
                        console.log(fArgs[1].get_message());
                    });
                }
            })();
        }
    }

    var getUserProfileProperties = function (venc1, venc2, newStatus) {
        var userId = SinisterObject.responsable;
        this.user = context.get_web().getUserById(userId);
        context.load(user);
        var promise = context.executeQuery();
        promise.done(function () {
            console.log("done!!!");
        });
        promise.then(function (sArgs) {
            SinisterObject.responsable = user.get_email();
            getDestSecondAlert(venc1, venc2, newStatus);
        }, function (fArgs) {
            console.log(fArgs[1].get_message());
        })
    }
    var getUserDetails = function (venc1, venc2, newStatus, userID) {
        var web = context.get_web();
        var userInfoList = web.get_siteUserInfoList();
        var camlQuery = new SP.CamlQuery();

        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>' + userID + '</Value></Eq>' +
        '</Where></Query><RowLimit>1</RowLimit></View>');

        this.collListItem = userInfoList.getItems(camlQuery);
        context.load(collListItem);
        var promise = context.executeQuery();
        promise.done(function () {
            console.log("done!!!");
        });
        promise.then(function (sArgs) {
            var item = collListItem.itemAt(0);
            console.log(item);

            var email = item.get_item('EMail');
            console.log(email);
            SinisterObject.responsable = email;
            getDestSecondAlert(venc1, venc2, newStatus);
        }, function (fArgs) {
            console.log(fArgs[1].get_message());
        })
    }


    ////-----DELETE LIST ITEM FROM "TAREAS CERRADAS" LIST-----/////
    var deleteTaskFromClosedTasks = function (idSin) {
        var siteURL = $(location).attr('href');
        //var titleName = document.title;
        var mListName = "Tareas Cerradas";
        var mList = web.get_lists().getByTitle(String(mListName));
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>100</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);

        context.load(collListItem);
        var promiseList = context.executeQuery();
        promiseList.done(function () {

            console.log("done!!!");
        });
        promiseList.then(function (sArgs) {
            deleteClosedTask(idSin)
            //if (listName.search("Generica") >= 0) {
            //    updateInGenericList(sin, idSin, oldStatus, group, order);
            //} else {
            //    updateInList(sin, idSin, oldStatus, group, order);
            //}
            //console.log("ListAcceded!!");
        }, function (fArgs) {
            console.log("error");
            console.log(fArgs[1].get_message());
        });
        return promiseList;
    }
    var deleteClosedTask = function (idSin) {
        var listItemEnumerator = collListItem.getEnumerator();
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();

                //alert(curritem.get_id());
                if (curritem.get_item("ID_x0020_Siniestro") == idSin) {
                    curritem.deleteObject()
                    //curritem.set_item("Siniestro_x0020_Cancelado", false);
                    //curritem.update();
                    //alert("updated!!!");
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        console.log("Registro de tarea cerrada eliminada");

                    }, function (fArgs) {
                        console.log("error");
                        console.log(fArgs[1].get_message());
                    });
                }
            })();

        }
    }



    /////////

    var recoverOldTask = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {
        context = new SP.ClientContext.get_current();
        web = context.get_web();

        SP.ClientContext.prototype.executeQuery = function () {
            var deferred = $.Deferred();
            this.executeQueryAsync(
                function () { deferred.resolve(arguments); },
                function () { deferred.reject(arguments); }
            );
            return deferred.promise();
        };
        var listName = getListNameFromStatusToUpdate(oldStatus, oldStatus[0]);
        newTaskListName = listName;
        var mList = context.get_web().get_lists().getByTitle(listName);
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>500</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);
        context.load(collListItem);
        var promiseList = context.executeQuery();
        promiseList.done(function () {
            console.log("done!!!");
        });
        promiseList.then(function (sArgs) {
            SinisterRecovering = true
            if (listName.search("Generica") >= 0) {
                restoreInGenericList(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
            } else {
                restoreInList(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
            }
            console.log("ListAcceded!!")
        }, function (fArgs) {
            console.log("error");
            console.log(fArgs[1].get_message());
        });
        return promiseList;

    }
    var restoreInList = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {
        var listItemEnumerator = collListItem.getEnumerator();
        var idTaskToClose = 0;
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();

                //alert(curritem.get_id());
                if (curritem.get_item("ID_x0020_Siniestro") == idSin) {
                    curritem.set_item("Status", "No Iniciada");
                    curritem.set_item("Salto", 0);
                    newTaskID = curritem.get_id();
                    curritem.update();
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        console.log("data updated!!")
                        SinisterRecovering = true;
                        var taskID = curritem.get_id()
                        usrAssigned = curritem.get_item("AssignedTo");
                        createTaskInHistoryFromRestore(sin, idSin, newStatus, taskID, group, order, venc1, venc2)
                        //getDestSecondAlert(venc1, venc2, newStatus);
                    }, function (fArgs) {
                        console.log("error");
                        console.log(fArgs[1].get_message());
                    });

                }
            })();

        }
    }
    var restoreInGenericList = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {
        var listItemEnumerator = collListItem.getEnumerator();
        var idTaskToClose = 0;
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();

                //alert(curritem.get_id());
                if ((curritem.get_item("ID_x0020_Siniestro") == idSin) && (curritem.get_item("Estado_x0020_Siniestro").get_lookupValue() == oldStatus)) {
                    curritem.set_item("Status", "No Iniciada");
                    curritem.set_item("Salto", 0);
                    newTaskID = curritem.get_id();
                    curritem.update();
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        console.log("data updated!!");
                        SinisterRecovering = true;
                        var taskID = curritem.get_id();
                        createTaskInHistoryFromRestore(sin, idSin, newStatus, taskID, group, order, venc1, venc2)
                        //getDestSecondAlert(venc1, venc2, newStatus);
                        // updateSinisterOrderAndGroup(sin, idSin, oldStatus, group, order);
                    }, function (fArgs) {
                        console.log("error");
                        console.log(fArgs[1].get_message());
                    });

                }
            })();

        }
    }

    var createTaskInHistoryFromRestore = function (sin, idSin, newStatus, taskID, group, order, venc1, venc2) {
        var oList = context.get_web().get_lists().getByTitle("Historial");

        var itemCreateInfo = new SP.ListItemCreationInformation();
        this.oListItemCreated = oList.addItem(itemCreateInfo);
        oListItemCreated.set_item("FechaDesde", new Date());
        var sinLookupField = new SP.FieldLookupValue();
        sinLookupField.set_lookupId(idSin);
        oListItemCreated.set_item("Siniestro", sinLookupField);
        var idEstado = getStatusValue(newStatus);
        var statusLookupField = new SP.FieldLookupValue();
        statusLookupField.set_lookupId(idEstado);
        oListItemCreated.set_item("Estado", statusLookupField);
        oListItemCreated.set_item("Title", oldTaskIDRelated);
        oListItemCreated.set_item("IdTarea", taskID);
        oListItemCreated.update();
        var promiseHistory = context.executeQuery();
        promiseHistory.done(function () {
            console.log("done!!!");
        });
        promiseHistory.then(function (sArgs) {
            //var vencID = oListItem.get_id();
            //updateNewTaskCreated(vencID);
            historyID = oListItemCreated.get_id();
            console.log("historyCreated!!")
            updateSinisterRestore(sin, idSin, newStatus, "", newStatus, "", group, order, venc1, venc2)
            //getDestSecondAlert(venc1, venc2, newStatus);
            //createNewVenc(venc1, venc2, newStatus)
            //sArgs[0] == success callback sender
            //sArgs[1] == success callback args
        }, function (fArgs) {
            console.log("error");
            //fArgs[0] == fail callback sender
            //fArgs[1] == fail callback args.
            //in JSOM the callback args aren't used much - 
            //the only useful one is probably the get_message() 
            //on the fail callback
            console.log(fArgs[1].get_message());
        });



    }
    var getHistoryListToRestore = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2, idTaskToClose) {
        context = new SP.ClientContext.get_current();
        web = context.get_web();

        SP.ClientContext.prototype.executeQuery = function () {
            var deferred = $.Deferred();
            this.executeQueryAsync(
                function () { deferred.resolve(arguments); },
                function () { deferred.reject(arguments); }
            );
            return deferred.promise();
        };
        var listName = "Historial";
        var mList = context.get_web().get_lists().getByTitle(listName);
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>500</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);
        context.load(collListItem);
        var historyList = context.executeQuery();
        historyList.done(function () {

            console.log("done!!!");
        });
        historyList.then(function (sArgs) {
            //var vencID = oListItem.get_id();
            //updateNewTaskCreated(vencID);
            closeTaskInHistoryToRestore(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2, idTaskToClose);
            //retrieveAllUsersAllGroups();
            console.log("ListAcceded!!")

        }, function (fArgs) {
            console.log("error");

            console.log(fArgs[1].get_message());
        });
        return historyList;
    }
    var closeTaskInHistoryToRestore = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2, idTaskToClose) {


        var listItemEnumerator = collListItem.getEnumerator();

        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();

                //alert(curritem.get_id());
                if (curritem.get_id() == historyID) {

                    curritem.set_item("FechaHasta", new Date());
                    curritem.update();
                    var promiseHistory = context.executeQuery();
                    promiseHistory.done(function () {
                        console.log("done!!!");
                    });
                    promiseHistory.then(function (sArgs) {
                        recoverOldTask(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
                        // updateSinisterJSOM(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
                        console.log("task updated!!")
                    }, function (fArgs) {
                        console.log("error");
                        console.log(fArgs[1].get_message());
                    });
                }
            })();
        }






    };
    var checkItemStatus = function () {
    }
    var buildURLFromStatusToList = function () {

    }
    var getTaskItemFromList = function () {
    }

    var getDataTaskItem = function () {
    }

    var buildData = function () {
    }
    var getStatusItem = function (id, obj, idSin) {
        var listEstadosURL = host + "/_vti_bin/listdata.svc/Estados(" + id + ")";
        $.ajax({
            url: listEstadosURL,
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) {
                finalStepUpdateSinister(data.d, obj, idSin);
            },
        });
    }
    var updateButton = function () {
        $('body').on('click', '.update', function () {
            //$(".update").click(function () {
            var sin = $(this).parent().parent().find(".title").attr("data-sinister");
            var idSin = $(this).parent().parent().find(".idSinister").text();
            var oldStatus = $(this).parent().attr("data-oldTask");
            var newStatus = $(this).attr("data-newTask");
            var group = $(this).parent().parent().find(".group").attr("data-group");
            groupNew = $(this).parent().parent().find(".group").find(".groupInbox").val();
            var order = $(this).parent().parent().find(".order").attr("data-order");
            orderNew = $(this).parent().parent().find(".order").find(".orderInbox").val();
            var venc1 = "";
            var venc2 = "";
            var statusLetter = "";
            var statusList = "";
            historyID = $(this).parent().parent().attr("data-idHistory");
            listTareasURL = "";
            if (newStatus == "") {
                newStatus = $(this).parent().parent().find("div.status option:selected").text();
            }
            if (oldStatus != newStatus) {
                $.when(getVencimientos(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2)
               //       venc1=getVencByStatus(newStatus, "venc1"),
               // venc2 = getVencByStatus(newStatus, "venc2"),

               //  statusLetter = oldStatus.charAt(0),
               //  statusList = "Tareas" + statusLetter,
               //  listTareasURL = host + "/_vti_bin/listdata.svc/" + statusList+"?$expand=AsignadoA&$filter=IDSiniestro eq " + idSin,
               // //getOldTaskID(sin, idSin, oldStatus, listTareasURL,newStatus),         //Completa Tarea Anterior
               //getOldTaskIDJSOM(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2)
                //updateSinisterJSOM(sin, idSin, newStatus),                      //Actualiza Siniestro
                //deleteOldVenc(),                                            //Elimina Antiguo Vencimiento
                //generateNewTaskInSpecificList(sin, idSin, oldStatus, newStatus, statusLetter, group, order, venc1, venc2),          //Crea Nueva tarea
                //createNewVenc(venc1, venc2, newStatus)                   //Crea nuevo Vencimiento y actualiza tarea nueva con el  IdVencimiento

                    ).done(function () {
                        // retrieveAllUsersAllGroups();
                        //generateNewTaskInSpecificList(sin, idSin, oldStatus, newStatus, statusLetter, group, order, venc1, venc2);          //Crea Nueva tarea
                        //createNewVenc(venc1, venc2, newStatus)                   //Crea nuevo Vencimiento y actualiza tarea nueva con el  IdVencimiento
                        //venc1=getVencByStatus(newStatus, "venc1");
                        //venc2 = getVencByStatus(newStatus, "venc2");
                        //var statusLetter = oldStatus.charAt(0);
                        //var statusList = "Tareas" + statusLetter;
                        //var listTareasURL = host + "/_vti_bin/listdata.svc/" + statusList+"?$expand=AsignadoA&$filter=IDSiniestro eq " + idSin;
                        //getOldTaskID(sin, idSin, oldStatus, listTareasURL,newStatus);         //Completa Tarea Anterior
                        //updateSinister(sin, idSin, newStatus);                      //Actualiza Siniestro
                        //deleteOldVenc();                                            //Elimina Antiguo Vencimiento
                        //generateNewTaskInSpecificList(sin, idSin, oldStatus, newStatus, statusLetter, group, order, venc1, venc2);          //Crea Nueva tarea
                        //createNewVenc(venc1, venc, 2, newStatus);                   //Crea nuevo Vencimiento y actualiza tarea nueva con el  IdVencimiento


                        //completeOldTask(sin, idSin, oldStatus);

                    });
            } else {
                updateOrderAndGroupInTask(sin, oldStatus, idSin, groupNew, orderNew);
            }
        })
    };
    var updateOrderAndGroupInTask = function (sin, oldStatus, idSin, group, order) {
        context = new SP.ClientContext.get_current();
        web = context.get_web();

        SP.ClientContext.prototype.executeQuery = function () {
            var deferred = $.Deferred();
            this.executeQueryAsync(
                function () { deferred.resolve(arguments); },
                function () { deferred.reject(arguments); }
            );
            return deferred.promise();
        };




        var listName = getListNameFromStatusToUpdate(oldStatus, oldStatus[0]);
        var mList = context.get_web().get_lists().getByTitle(listName);
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name = "ID" Ascending = "FALSE"/></OrderBy><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>500</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);
        context.load(collListItem);
        var promiseList = context.executeQuery();
        promiseList.done(function () {

            console.log("done!!!");
        });
        promiseList.then(function (sArgs) {
            if (listName.search("Generica") >= 0) {
                updateInGenericList(sin, idSin, oldStatus, group, order);
            } else {
                updateInList(sin, idSin, oldStatus, group, order);
            }
            console.log("ListAcceded!!");
        }, function (fArgs) {
            console.log("error");
            console.log(fArgs[1].get_message());
        });
        return promiseList;
    }
    var updateInGenericList = function (sin, idSin, oldStatus, group, order) {
        var listItemEnumerator = collListItem.getEnumerator();
        var idTaskToClose = 0;
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();

                //alert(curritem.get_id());
                if ((curritem.get_item("ID_x0020_Siniestro") == idSin) && (curritem.get_item("Estado_x0020_Siniestro").get_lookupValue() == oldStatus)) {
                    curritem.set_item("Orden", order);
                    curritem.set_item("Grupo", group);
                    curritem.update();
                    //alert("updated!!!");
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        console.log("data updated!!")
                        updateSinisterOrderAndGroup(sin, idSin, oldStatus, group, order);
                    }, function (fArgs) {
                        console.log("error");
                        console.log(fArgs[1].get_message());
                    });

                }
            })();
        }
    }
    var updateInList = function (sin, idSin, oldStatus, group, order) {
        var listItemEnumerator = collListItem.getEnumerator();
        var idTaskToClose = 0;
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();

                //alert(curritem.get_id());
                if (curritem.get_item("ID_x0020_Siniestro") == idSin) {
                    curritem.set_item("Orden", order);
                    curritem.set_item("Grupo", group);
                    curritem.update();
                    //alert("updated!!!");
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        updateSinisterOrderAndGroup(sin, idSin, oldStatus, group, order);
                        console.log("data updated!!");
                    }, function (fArgs) {
                        console.log("error");
                        console.log(fArgs[1].get_message());
                    });

                }
            })();
        }
    }
    var updateSinisterOrderAndGroup = function (sin, idSin, oldStatus, group, order) {
        var siteURL = $(location).attr('href');
        //var titleName = document.title;
        var mListName = "Siniestros";
        var mList = web.get_lists().getByTitle(String(mListName));
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>100</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);
        context.load(collListItem);
        var promiseList = context.executeQuery();
        promiseList.done(function () {

            console.log("done!!!");
        });
        promiseList.then(function (sArgs) {

            updateSinisterOrderAndGroupSuccess(sin, idSin, oldStatus, group, order);
            console.log("ListAcceded!!")

        }, function (fArgs) {
            console.log("error");
            console.log(fArgs[1].get_message());
        });
        return promiseList;
    };
    var updateSinisterOrderAndGroupSuccess = function (sin, id, oldStatus, group, order) {
        console.log('Got the collection!');
        idCurrentSinisterInProccess = id;
        newCurrentStatusNameInProccess = oldStatus;
        var listItemEnumerator = collListItem.getEnumerator();
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();
                if (curritem.get_id() == id) {
                    curritem.set_item("Grupo", groupNew);
                    curritem.set_item("Orden", orderNew);
                    curritem.update();
                    //alert("updated!!!");
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        console.log("group and order updated!!");
                        setDataReadyToStartOver()
                    }, function (fArgs) {
                        console.log("error");
                        console.log(fArgs[1].get_message());
                    });

                }
            })();

        }
    }
    //var retrieveAllUsersAllGroups=function() {

    //    //var context = new SP.ClientContext(siteUrl);
    //    this.collGroup = context.get_web().get_siteGroups();
    //    context.load(collGroup);
    //    context.load(collGroup, 'Include(Users)');
    //    var promiseGetGroups = context.executeQuery();
    //    promiseGetGroups.done(function () {

    //       console.log("done!!!");
    //    });
    //    promiseGetGroups.then(function (sArgs) {
    //        showAllGroups();


    //    }, function (fArgs) {
    //       console.log("error");

    //        var failmessage = fArgs[1].get_message();
    //    });
    //    return promiseGetGroups;
    //    //clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));
    //}
    //var showAllGroups = function () {
    //    var userInfo = '';

    //    var groupEnumerator = collGroup.getEnumerator();
    //    while (groupEnumerator.moveNext()) {
    //        var oGroup = groupEnumerator.get_current();
    //        var collUser = oGroup.get_users();
    //        var userEnumerator = collUser.getEnumerator();
    //        while (userEnumerator.moveNext()) {
    //            var oUser = userEnumerator.get_current();
    //            this.userInfo += '\nGroup ID: ' + oGroup.get_id() +
    //                '\nGroup Title: ' + oGroup.get_title() +
    //                '\nUser: ' + oUser.get_title() +
    //                '\nLogin Name: ' + oUser.get_loginName();
    //        }
    //    }

    //    console.log(userInfo);
    //}


    var getOldTaskIDJSOM = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {

        context = new SP.ClientContext.get_current();
        web = context.get_web();

        SP.ClientContext.prototype.executeQuery = function () {
            var deferred = $.Deferred();
            this.executeQueryAsync(
                function () { deferred.resolve(arguments); },
                function () { deferred.reject(arguments); }
            );
            return deferred.promise();
        };




        var listName = getListNameFromStatusToUpdate(oldStatus, oldStatus[0]);
        var mList = context.get_web().get_lists().getByTitle(listName);
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>500</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);
        context.load(collListItem);
        var promiseList = context.executeQuery();
        promiseList.done(function () {

            console.log("done!!!");
        });
        promiseList.then(function (sArgs) {
            //var vencID = oListItem.get_id();
            //updateNewTaskCreated(vencID);
            if (listName.search("Generica") >= 0) {
                checkInGenericList(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
            } else {
                checkInList(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
            }
            //retrieveAllUsersAllGroups();
            console.log("ListAcceded!!")
            //sArgs[0] == success callback sender
            //sArgs[1] == success callback args
        }, function (fArgs) {
            console.log("error");
            //fArgs[0] == fail callback sender
            //fArgs[1] == fail callback args.
            //in JSOM the callback args aren't used much - 
            //the only useful one is probably the get_message() 
            //on the fail callback
            console.log(fArgs[1].get_message());
        });
        return promiseList;

    }
    var checkInGenericList = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {
        var listItemEnumerator = collListItem.getEnumerator();
        var idTaskToClose = 0;
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();
                if ((curritem.get_item("ID_x0020_Siniestro") == idSin) && (curritem.get_item("Estado_x0020_Siniestro").get_lookupValue() == oldStatus)) {
                    curritem.set_item("Status", "Completada");
                    idVencRelated = curritem.get_item("IdVencimiento");
                    usrAssigned = curritem.get_item("AssignedTo");
                    oldTaskIDRelated = curritem.get_id();
                    curritem.set_item("Salto", 1);
                    idTaskToClose = curritem.get_id();
                    curritem.update();
                    //alert("updated!!!");
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        console.log("data updated!!")
                        getHistoryList(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2, idTaskToClose);
                        //closeTaskInHistory(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2,idTaskToClose);
                        //updateSinisterJSOM(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);

                        //sArgs[0] == success callback sender
                        //sArgs[1] == success callback args
                    }, function (fArgs) {
                        console.log("error");
                        //fArgs[0] == fail callback sender
                        //fArgs[1] == fail callback args.
                        //in JSOM the callback args aren't used much - 
                        //the only useful one is probably the get_message() 
                        //on the fail callback
                        console.log(fArgs[1].get_message());
                    });

                }
            })();
        }
    }
    var checkInList = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {
        var listItemEnumerator = collListItem.getEnumerator();
        var idTaskToClose = 0;
        var continueWhile = true;
        while (listItemEnumerator.moveNext()) {
            if (continueWhile == true) {
                (function () {
                    var curritem = listItemEnumerator.get_current();
                    //alert(curritem.get_id());
                    if ((curritem.get_item("ID_x0020_Siniestro") == idSin) && (curritem.get_item("Status") != "Completada")) {
                        if ((oldStatus == "A - Asignacion de responsable") && (curritem.get_item("AssignedTo") == null)) {
                            var userCurrentID = _spPageContextInfo.userId;
                            if (confirm("No tiene Usuario asignado a la tarea 'A - Asignacion de responsable'.\nHaga click en 'Aceptar' para asignar su usuario a la tarea\nHaga click en 'Cancelar' para volver atras y cambiarla manualmente.") == true) {
                                var userField = new SP.FieldUserValue;
                                userField.set_lookupId(userCurrentID);
                                curritem.set_item("AssignedTo", userField);
                                //console.log("are you sure?");

                            } else {
                                continueWhile = false;
                            }
                        }
                        if (continueWhile == true) {
                            curritem.set_item("Status", "Completada");
                            idVencRelated = curritem.get_item("IdVencimiento");

                            curritem.set_item("Salto", 1);
                            idTaskToClose = curritem.get_id();
                            oldTaskIDRelated = curritem.get_id();
                            if (oldStatus != "A - Asignacion de responsable") {
                                usrAssigned = curritem.get_item("AssignedTo");
                            }

                            curritem.update();
                            //alert("updated!!!");
                            var promise = context.executeQuery();
                            promise.done(function () {
                                console.log("done!!!");
                            });
                            promise.then(function (sArgs) {
                                console.log("data updated!!");
                                if (oldStatus == "A - Asignacion de responsable") {
                                    usrAssigned = curritem.get_item("AssignedTo");
                                }

                                getHistoryList(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2, idTaskToClose);
                                //updateSinisterJSOM(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);

                                //sArgs[0] == success callback sender
                                //sArgs[1] == success callback args
                            }, function (fArgs) {
                                console.log("error");
                                console.log(fArgs[1].get_message());
                            });
                        }
                    }
                })();
            } else {
                break;
            }
        }
    };
    var getGroupFromStatus = function (estado) {
        var group = "";
        $(allStatus).each(function (i, item) {
            if (item.status == estado) {
                group = item.group;
                return false;
            }
        });
        return group;
    }
    var getDestSecondAlert = function (venc1, venc2, estado) {
        var group = getGroupFromStatus(estado);

        if (SinisterRecovering == true) {
            var isGen = isStatusGeneric(estado);


            if (isGen == true) {
                if (group == "Operadores Willis") {
                    destinatariosAlerta1Restore = SinisterObject.responsable;
                }
                group = "Team Leaders";
            }
            if (group == "Operadores Willis") {
                destinatariosAlerta1Restore = SinisterObject.responsable;
                group = "Team Leaders";
            }
        } else if (group == "Operadores Willis") {
            destinatariosAlerta1Restore = SinisterObject.responsable;
            group = "Team Leaders";
        }
        var lstObject = context.get_web().get_lists().getByTitle("Destinatarios");
        //this.lstObjectItem = lstObject.getItemById(group);
        //var destinatarios = lstObjectItem.get_item("Externos");
        //return destinatarios;

        context.load(lstObject);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>100</RowLimit></View>');
        this.collListItem = lstObject.getItems(camlQuery);
        context.load(collListItem);
        var promiseList = context.executeQuery();
        promiseList.done(function () {

            console.log("done!!!");
        });
        promiseList.then(function (sArgs) {
            retrieveSecondDest(venc1, venc2, group, estado);
            console.log("List Dest Second Acceded!!")

        }, function (fArgs) {
            console.log("error");

            console.log(fArgs[1].get_message());
        });
        return promiseList;

    }
    var retrieveSecondDest = function (venc1, venc2, group, estado) {
        var listItemEnumerator = collListItem.getEnumerator();
        var destinatarios = ""
        while (listItemEnumerator.moveNext()) {

            var curritem = listItemEnumerator.get_current();

            //alert(curritem.get_id());
            if (curritem.get_item("Title") == group) {
                destinatarios = curritem.get_item("Externos");
                // break;
            }
            if (SinisterRecovering == true) {
                var isGen = isStatusGeneric(estado);
                if ((destinatariosAlerta1Restore == "") && (isGen == true)) {
                    if (curritem.get_item("Title") == "Operadores POSA") {
                        destinatariosAlerta1Restore = curritem.get_item("Externos");
                    }
                }
            }

        }
        createNewVenc(venc1, venc2, estado, destinatarios);
    }

    var getItemFromObj = function (estado) {
        var itemToReturn = "";
        $(allStatus).each(function (i, item) {
            if (item.status == estado) {
                itemToReturn = item;
                return false;
            }
        });
        return itemToReturn;
    }
    var createNewVenc = function (venc1, venc2, estado, destinatarios) {
        var destAlert2 = destinatarios;//getDestSecondAlert(estado);
        var status = estado.split(" - ");
        status = status[1];
        var itemStatus = getItemFromObj(estado);
        var days1 = itemStatus.days1;
        var days2 = itemStatus.days2;

        return createVenc(days1, days2, status, destAlert2, itemStatus);
    }
    var getTareasAListJSOM = function () {

        var listName = "TareasA";
        var mList = context.get_web().get_lists().getByTitle(listName);
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>500</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);
        context.load(collListItem);
        var promiseList = context.executeQuery();
        promiseList.done(function () {
            console.log("done!!!");
        });
        promiseList.then(function (sArgs) {
            getResponsableWillisAndTeamLeaders(idSin);
            console.log("ListAcceded!!")
        }, function (fArgs) {
            console.log("error");
            console.log(fArgs[1].get_message());
        });
        return promiseList;
    }
    var getResponsableWillisAndTeamLeaders = function (idSin) {
        var listItemEnumerator = collListItem.getEnumerator();
        var idTaskToClose = 0;
        var Responsable = "";
        var taskTeamLeader = "";
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();

                //alert(curritem.get_id());
                if (curritem.get_item("ID_x0020_Siniestro") == idSin) {
                    Responsable = curritem.get_item("ResponsableWillis").get_lookupId();
                    taskTeamLeader = curritem.get_item("TeamLeader").get_lookupId();
                    curritem.update();
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        console.log("data updated!!")

                        SinisterRecovering = true;
                        var taskID = curritem.get_id()
                        usrAssigned = curritem.get_item("AssignedTo");
                        createTaskInHistoryFromRestore(sin, idSin, newStatus, taskID, group, order, venc1, venc2);
                    }, function (fArgs) {
                        console.log("error");
                        console.log(fArgs[1].get_message());
                    });

                }
            })();

        }
    }
    var getUserDetailsTeamLeader = function (venc1, venc2, newStatus, userID) {
        var web = context.get_web();
        var userInfoList = web.get_siteUserInfoList();
        var camlQuery = new SP.CamlQuery();

        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>' + userID + '</Value></Eq>' +
        '</Where></Query><RowLimit>1</RowLimit></View>');

        this.collListItem = userInfoList.getItems(camlQuery);
        context.load(collListItem);
        var promise = context.executeQuery();
        promise.done(function () {
            console.log("done!!!");
        });
        promise.then(function (sArgs) {
            var item = collListItem.itemAt(0);
            console.log(item);

            var email = item.get_item('EMail');
            console.log(email);
            SinisterObject.responsable = email;
            getDestSecondAlert(venc1, venc2, newStatus);
        }, function (fArgs) {
            console.log(fArgs[1].get_message());
        })
    }
    var createVenc = function (days1, days2, status, dest2, item) {

        var oList = context.get_web().get_lists().getByTitle("VencimientoTareas");

        var itemCreateInfo = new SP.ListItemCreationInformation();
        this.oListItem = oList.addItem(itemCreateInfo);
        if (SinisterRecovering == true) {
            var fullStatus = getStatusFullName(status);
            var isGen = isStatusGeneric(fullStatus);
            if (isGen == true) {
                oListItem.set_item('Destinatarios_x0020_Alerta_x0020', destinatariosAlerta1Restore);
            } else {
                oListItem.set_item('Destinatarios_x0020_Alerta_x0020', destinatariosAlerta1Restore);
            }
        } else {
            oListItem.set_item('Destinatarios_x0020_Alerta_x0020', destinatariosAlerta1Restore);
        }
        oListItem.set_item('Dias1', days1);
        oListItem.set_item('Dias2', days2);
        oListItem.set_item('Vencimiento1', item.venc1);
        oListItem.set_item('Vencimiento2', item.venc2);
        //oListItem.set_item('Identificador', 'Hello World!');
        oListItem.set_item('Title', newTaskID);
        oListItem.set_item('Destinatarios_x0020_Alerta_x00200', dest2);
        oListItem.set_item('Estado', status);


        //oListItem.set_item('IdVencimiento', 'Hello World!'); /// HACE FALTA CREAR NUEVO REGISTRO DE VENC ANTES

        oListItem.update();
        var promiseVenc = context.executeQuery();
        promiseVenc.done(function () {
            console.log("creating Venc!!!");
        });
        promiseVenc.then(function (sArgs) {
            var vencID = oListItem.get_id();
            updateNewTaskCreated(vencID);
            console.log("venc Added!!")
            //sArgs[0] == success callback sender
            //sArgs[1] == success callback args
        }, function (fArgs) {
            console.log("error");
            //fArgs[0] == fail callback sender
            //fArgs[1] == fail callback args.
            //in JSOM the callback args aren't used much - 
            //the only useful one is probably the get_message() 
            //on the fail callback
            console.log(fArgs[1].get_message());
        });
        return promiseVenc;

    }
    var updateNewTaskCreated = function (vencID) {

        var oList = context.get_web().get_lists().getByTitle(newTaskListName);

        var itemCreateInfo = new SP.ListItemCreationInformation();

        this.lstObjectItem = oList.getItemById(newTaskID);

        lstObjectItem.set_item("IdVencimiento", vencID);
        //var idSinister = lstObjectItem.get_item('ID_x0020_Siniestro');
        //var itemTitle = lstObjectItem.get_item('Title');
        lstObjectItem.update();
        var promiseVenc = context.executeQuery();
        promiseVenc.done(function () {
            console.log("done!!!");
        });
        promiseVenc.then(function (sArgs) {
            //var vencID = oListItem.get_id();
            //updateNewTaskCreated(vencID);

            console.log("task updated!!");
            if (SinisterRecovering == true) {
                location.reload();
            } else {
                updateIDHistorialSinester();
            }
        }, function (fArgs) {
            console.log("error");
            console.log(fArgs[1].get_message());
        });
    }
    var updateIDHistorialSinester = function (sin, id, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {
        var siteURL = $(location).attr('href');
        var mListName = "Siniestros";
        var mList = web.get_lists().getByTitle(String(mListName));
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>100</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);
        context.load(collListItem);
        var promiseList = context.executeQuery();
        promiseList.done(function () {
            console.log("done!!!");
        });
        promiseList.then(function (sArgs) {
            updateIDHistoryInSinister(sin, id, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
            console.log("ListAcceded!!")
        }, function (fArgs) {
            console.log("error");
            console.log(fArgs[1].get_message());
        });
        return promiseList;
    }
    var updateIDHistoryInSinister = function (sin, id, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {

        console.log('Got the collection!');

        var listItemEnumerator = collListItem.getEnumerator();
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();
                if (curritem.get_id() == SinisterObject.idSin) {
                    curritem.set_item("IdHistorial", historyID);

                    curritem.update();
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        console.log("data updated!!");
                        setDataReadyToStartOver();
                    }, function (fArgs) {
                        console.log("error");
                        console.log(fArgs[1].get_message());
                    });
                }
            })();
        }
    }
    var deleteOldVenc = function (sin, id, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {
        var lstObject = context.get_web().get_lists().getByTitle("VencimientoTareas");
        this.lstObjectItem = lstObject.getItemById(idVencRelated);
        lstObjectItem.deleteObject();
        var promiseVenc = context.executeQuery();

        promiseVenc.done(function () {
            console.log("done!!!");
        });
        promiseVenc.then(function (sArgs) {
            console.log("venc deleted!!");
            //if (newStatus.indexOf("Cerrado - ") != 0) {
            if (newStatus != "M - Siniestro Cerrado") {
                generateNewTaskInSpecificList(sin, id, oldStatus, newStatus, statusLetter, group, order, venc1, venc2);
            } else {
                console.log("Siniestro Cerrado.\nLa pagina se recargara para actualizar datos.")
                location.reload();
            }
            //}

            //sArgs[0] == success callback sender
            //sArgs[1] == success callback args
        }, function (fArgs) {
            console.log("error");
            //fArgs[0] == fail callback sender
            //fArgs[1] == fail callback args.
            //in JSOM the callback args aren't used much - 
            //the only useful one is probably the get_message() 
            //on the fail callback
            console.log(fArgs[1].get_message());
            if (newStatus != "M - Siniestro Cerrado") {
                generateNewTaskInSpecificList(sin, id, oldStatus, newStatus, statusLetter, group, order, venc1, venc2);
            } else {
                console.log("Siniestro Cerrado.\nLa pagina se recargara para actualizar datos.")
                location.reload();
            }

        });
        return promiseVenc;
    }
    //var getUserID = function (status,idSin) {
    //    var list = getListNameFromStatus(status, status[0]);
    //    var listTaskURL= host + "/_vti_bin/listdata.svc/" + list + "?$select=Alerta1,Alerta2,Título,TareaGenérica"
    //    $.ajax({
    //        url: listEstadosURL,
    //        async: true,
    //        headers: { "accept": "application/json;odata=verbose" },
    //        success: function (data) {
    //            finalStepUpdateSinister(data.d, obj, idSin);
    //        },
    //    });


    //}
    var generateNewTaskInSpecificList = function (sin, idSin, oldStatus, newStatus, statusLetter, group, order, venc1, venc2) {
        //var statusIDIndex=getStatusValue(newStatus);
        var listTaskName = "";
        if (newStatus.indexOf("Cerrado - ") != 0) {
            listTaskName = getListNameFromStatus(newStatus, newStatus[0]);
        } else {
            listTaskName = "Tareas Cerradas";
        }
        newTaskListName = listTaskName;
        var assigned = usrAssigned;

        var titleTask = "";
        if (newStatus.indexOf("Cerrado - ") != 0) {
            titleTask = newStatus.split(" - ");
            titleTask = titleTask[1];
        } else {
            titleTask = oldStatus.split(" - ");
            titleTask = titleTask[1];
        }

        var oList = context.get_web().get_lists().getByTitle(listTaskName);

        var itemCreateInfo = new SP.ListItemCreationInformation();
        this.oListItem = oList.addItem(itemCreateInfo);
        if (newStatus.indexOf("Cerrado - ") != 0) {
            if (listTaskName.search("Generica") >= 0) {
                oListItem.set_item('Title', oldTaskIDRelated);
                oListItem.set_item('StartDate', new Date());
                oListItem.set_item('Status', 'No iniciada');
                //oListItem.set_item('Identificador', 'Hello World!');
                oListItem.set_item('ID_x0020_Siniestro', idSin);
                var sinLookupField = new SP.FieldLookupValue();
                sinLookupField.set_lookupId(getStatusValue(newStatus));
                oListItem.set_item('Estado_x0020_Siniestro', sinLookupField);
                oListItem.set_item('AssignedTo', assigned);
                oListItem.set_item('AssignedTo', assigned);
                //oListItem.set_item("Grupo", groupNew);
                //oListItem.set_item("Orden", orderNew);

                // oListItem.set_item('IdVencimiento', 'Hello World!'); /// HACE FALTA CREAR NUEVO REGISTRO DE VENC ANTES


            } else {
                oListItem.set_item('Title', titleTask);
                oListItem.set_item('DueDate', getVencByStatus(newStatus, "venc1"));
                oListItem.set_item('Status', 'No iniciada');
                //oListItem.set_item('Identificador', 'Hello World!');
                oListItem.set_item('ID_x0020_Siniestro', idSin);
                var sinLookupField = new SP.FieldLookupValue();
                sinLookupField.set_lookupId(idSin);
                oListItem.set_item('Siniestro', sinLookupField);
                oListItem.set_item('AssignedTo', assigned);
                oListItem.set_item("Grupo", groupNew);
                oListItem.set_item("Orden", orderNew);
            }
        } else {
            var IdCategory = allClosedCategories.indexOf(newStatus) + 1;
            oListItem.set_item('Title', titleTask);
            // oListItem.set_item('DueDate', getVencByStatus(newStatus, "venc1"));
            oListItem.set_item('Status', 'Completado');
            //oListItem.set_item('Identificador', 'Hello World!');
            oListItem.set_item('ID_x0020_Siniestro', idSin);
            var sinLookupField = new SP.FieldLookupValue();
            sinLookupField.set_lookupId(idSin);
            oListItem.set_item('Siniestro', sinLookupField);
            var catLookupField = new SP.FieldLookupValue();
            catLookupField.set_lookupId(IdCategory);
            oListItem.set_item('Categoria_x0020_Cerrado', catLookupField);
            oListItem.set_item('AssignedTo', assigned);
        }
        oListItem.update();

        var promiseAdd = context.executeQuery();
        promiseAdd.done(function () {
            console.log("done!!!");
        });
        promiseAdd.then(function (sArgs) {
            idCurrentSinisterInProccess = idSin;
            newCurrentStatusNameInProccess = newStatus;
            if (newStatus.indexOf("Cerrado - ") != 0) {
                if (listTaskName.search("Generica") < 0) {
                    newTaskID = oListItem.get_id();
                    createTaskInHistory(sin, idSin, newStatus, newTaskID, venc1, venc2);
                    console.log("data added!! new ID " + oListItem.get_id());
                } else {
                    setDataReadyToStartOver();
                }
            } else {
                console.log("Siniestro Cerrado.\nLa pagina se recargara para actualizar datos.")
                location.reload();

            }
            //sArgs[0] == success callback sender
            //sArgs[1] == success callback args
        }, function (fArgs) {
            console.log("error");
            //fArgs[0] == fail callback sender
            //fArgs[1] == fail callback args.
            //in JSOM the callback args aren't used much - 
            //the only useful one is probably the get_message() 
            //on the fail callback
            console.log(fArgs[1].get_message());
        });
        return promiseAdd;
    }
    var setDataReadyToStartOver = function () {
        console.log("ITS DONE");
        $("button#" + idCurrentSinisterInProccess).parent().parent().find(".group").attr("data-group", groupNew);
        $("button#" + idCurrentSinisterInProccess).parent().parent().find(".order").attr("data-order", orderNew);
        $("button#" + idCurrentSinisterInProccess).parent().attr("data-oldtask", newCurrentStatusNameInProccess);
        $("button#" + idCurrentSinisterInProccess).css("display", "none");
        $("button#" + idCurrentSinisterInProccess).parent().parent().css("background-color", "#d3edd3");
    }

    var getStatusFullName = function (status) {
        var fullName = "";
        $(allStatus).each(function (i, item) {
            if (item.status.toUpperCase().indexOf(status.toUpperCase()) >= 0) {

                fullName = item.status;
                return false;
            }
        });
        return fullName;
    }
    var getListNameFromStatusToUpdate = function (status, sLetter) {
        var isGeneric = isStatusGeneric(status);
        var list = "";
        if (isGeneric) {
            list = "Tarea Generica"
        } else {
            list = "Tareas " + sLetter;
        }
        return list;

    }
    var getListNameFromStatus = function (status, sLetter) {
        var isGeneric = isStatusGeneric(status);
        var list = "";
        if (isGeneric) {
            list = "Generador Tarea Generica"
        } else {
            list = "Tareas " + sLetter;
        }
        return list;

    }
    var getOldTaskID = function (sin, id, oldStatus, url, newStatus) {
        return $.ajax({
            url: url,
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) {
                var task = data.d.results[0];
                completeOldTask(sin, id, oldStatus, task, newStatus);

            },
        });
    }
    var getFormattedDate = function (strDate) {
        if (strDate != null) {
            var aux = strDate.split("(");
            var numDate = aux[1].split(")");
            var dateConverted = new Date(Number(numDate[0]));
            return dateConverted;
        } else {
            return null;
        }
    }
    var getSinisterByID = function (id) {
        var value = -1;
        $(sinistersObjs).each(function (i, item) {
            if (item.Identificador == id) {
                value = i;
                return false;
            }
        });
        return sinistersObjs[value];
    }
    var isStatusGeneric = function (value) {
        var isGen = false;
        $(allStatus).each(function (i, item) {
            if (item.status == value) {

                isGen = item.gen;
                return false;
            }
        });
        return isGen;
    }
    var getStatusValue = function (value) {
        var index = 21;
        $(allStatus).each(function (i, item) {
            if (item.status == value) {

                index = index + Number(i);
                return false;
            }
        });
        return index;
    }
    var finalStepUpdateSinister = function (estado, objSin, id) {
        estado.Creado = getFormattedDate(estado.Creado);
        estado.Modificado = getFormattedDate(estado.Modificado);
        //objSin.Estado = estado;
        delete objSin.Estado;

        var etag = objSin.__metadata.etag;
        var strObj = JSON.stringify(objSin);
        var listSinURL = host + "/_vti_bin/listdata.svc/" + listSiniestros + "(" + id + ")";
        $.ajax({
            url: listSinURL,
            type: "PUT",
            contentType: "application/json;odata=verbose",
            data: strObj,
            headers: {
                "Accept": "application/json;odata=verbose",
                //"X-HTTP-Method": "MERGE",
                "If-Match": "*",//etag,
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: getTaskToUpdate,
            error: function (xhr) {
                console.log(xhr.status + ": " + xhr.statusText);
            }
        });
    }
    var updateSinisterJSOM = function (sin, id, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {

        var siteURL = $(location).attr('href');
        //var titleName = document.title;
        var mListName = "Siniestros";
        var mList = web.get_lists().getByTitle(String(mListName));
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>100</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);
        context.load(collListItem);
        var promiseList = context.executeQuery();
        promiseList.done(function () {

            console.log("done!!!");
        });
        promiseList.then(function (sArgs) {
            //var vencID = oListItem.get_id();
            //updateNewTaskCreated(vencID);
            onQuerySucceeded1(sin, id, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
            console.log("ListAcceded!!")
            //sArgs[0] == success callback sender
            //sArgs[1] == success callback args
        }, function (fArgs) {
            console.log("error");
            //fArgs[0] == fail callback sender
            //fArgs[1] == fail callback args.
            //in JSOM the callback args aren't used much - 
            //the only useful one is probably the get_message() 
            //on the fail callback
            console.log(fArgs[1].get_message());
        });
        return promiseList;

        // context.executeQueryAsync(Function.createDelegate(this, function () { onQuerySucceeded1(sin, id, newStatus); }), Function.createDelegate(this, this.onQueryFailed1));


    }
    var getResTypeByStatus = function (status) {
        var res = "";
        $(allStatus).each(function (i, item) {
            if (item.status == status) {
                res = item.tipoResolucion;
            }
        });
        return res;
    }
    var onQuerySucceeded1 = function (sin, id, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {

        console.log('Got the collection!');

        var listItemEnumerator = collListItem.getEnumerator();
        while (listItemEnumerator.moveNext()) {
            (function () {
                var curritem = listItemEnumerator.get_current();

                //alert(curritem.get_id());
                if (curritem.get_id() == id) {
                    if (newStatus.indexOf("Cerrado - ") != 0) {
                        var lookupFld = new SP.FieldLookupValue();
                        lookupFld.set_lookupId(getStatusValue(newStatus));
                        curritem.set_item("Estado", lookupFld);
                        var resolution = getResTypeByStatus(newStatus);
                        if (resolution == "LSD") {
                            curritem.set_item("Tipo_x0020_de_x0020_resuloci_x00", "LIQUIDACIÓN DE SALDO DEUDOR");
                        } else if (resolution == "RU") {
                            curritem.set_item("Tipo_x0020_de_x0020_resuloci_x00", "REPOSICIÓN DE UNIDAD");
                        }
                        if (oldStatus == "A - Asignacion de responsable") {
                            curritem.set_item("Responsable", usrAssigned);
                        }
                        curritem.set_item("Grupo", groupNew);
                        curritem.set_item("Orden", orderNew);
                        SinisterObject.group = groupNew;
                        SinisterObject.order = orderNew;
                        SinisterObject.idSin = curritem.get_id();
                    }
                    else {
                        curritem.set_item("Siniestro_x0020_Cancelado", true);
                        curritem.set_item("Motivo_x0020_Siniestro_x0020_Cer", newStatus.split(" - ")[1]);
                    }
                    if (usrAssigned == null) {
                        usrAssigned = curritem.get_item("Responsable");
                    }
                    SinisterObject.responsable = curritem.get_item("Responsable").get_lookupId();
                    curritem.update();
                    //alert("updated!!!");
                    var promise = context.executeQuery();
                    promise.done(function () {
                        console.log("done!!!");
                    });
                    promise.then(function (sArgs) {
                        console.log("data updated!!");
                        deleteOldVenc(sin, id, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
                        //sArgs[0] == success callback sender
                        //sArgs[1] == success callback args
                    }, function (fArgs) {
                        console.log("error");
                        //fArgs[0] == fail callback sender
                        //fArgs[1] == fail callback args.
                        //in JSOM the callback args aren't used much - 
                        //the only useful one is probably the get_message() 
                        //on the fail callback
                        console.log(fArgs[1].get_message());
                    });
                    //$.when(context.executeQueryAsync(Function.createDelegate(this, function () { onQuerySucceeded(); }),
                    //    Function.createDelegate(this, this.onQueryFailed)))
                    //    .done(function () {
                    //    console.log("Item is updated!");
                    //});
                }
            })();
        }
    }

    var onQueryFailed1 = function (sender, args) {

        console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    }


    var onQuerySucceeded = function () {

        console.log('Item updated!');
    }

    var onQueryFailed = function (sender, args) {

        console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    }


    var updateSinister = function (sin, id, newStatus) {
        return updateSinisterJSOM(sin, id, newStatus);


        //var objSin = getSinisterByID(id);
        ////objSin.EstadoId = getStatusValue(newStatus);
        //objSin.Creado = getFormattedDate(objSin.Creado);
        //objSin.FechaSiniestro = getFormattedDate(objSin.FechaSiniestro);
        //objSin.FechaDeCancelación = getFormattedDate(objSin.FechaDeCancelación);
        //objSin.FechaDeCierreDeSiniestro = getFormattedDate(objSin.FechaDeCierreDeSiniestro);
        //objSin.Modificado = getFormattedDate(objSin.Modificado);

        //getStatusItem(objSin.EstadoId, objSin,id)


    }
    var createTaskInHistory = function (sin, idSin, newStatus, taskID, venc1, venc2) {
        var oList = context.get_web().get_lists().getByTitle("Historial");

        var itemCreateInfo = new SP.ListItemCreationInformation();
        this.oListItemCreated = oList.addItem(itemCreateInfo);
        oListItemCreated.set_item("FechaDesde", new Date());
        var sinLookupField = new SP.FieldLookupValue();
        sinLookupField.set_lookupId(idSin);
        oListItemCreated.set_item("Siniestro", sinLookupField);
        var idEstado = getStatusValue(newStatus);
        var statusLookupField = new SP.FieldLookupValue();
        statusLookupField.set_lookupId(idEstado);
        oListItemCreated.set_item("Estado", statusLookupField);
        oListItemCreated.set_item("Title", oldTaskIDRelated);
        oListItemCreated.set_item("IdTarea", taskID);
        oListItemCreated.update();
        var promiseHistory = context.executeQuery();
        promiseHistory.done(function () {
            console.log("done!!!");
        });
        promiseHistory.then(function (sArgs) {
            //var vencID = oListItem.get_id();
            //updateNewTaskCreated(vencID);
            historyID = oListItemCreated.get_id();
            console.log("historyCreated!!")

            getUserDetails(venc1, venc2, newStatus, SinisterObject.responsable);
            //getDestSecondAlert(venc1, venc2, newStatus);
            //createNewVenc(venc1, venc2, newStatus)
            //sArgs[0] == success callback sender
            //sArgs[1] == success callback args
        }, function (fArgs) {
            console.log("error");
            //fArgs[0] == fail callback sender
            //fArgs[1] == fail callback args.
            //in JSOM the callback args aren't used much - 
            //the only useful one is probably the get_message() 
            //on the fail callback
            console.log(fArgs[1].get_message());
        });



    }

    var getHistoryList = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2, idTaskToClose) {
        var listName = "Historial";
        var mList = context.get_web().get_lists().getByTitle(listName);
        context.load(mList);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' + '<Value Type=\'Number\'>1</Value></Geq></Where></Query><RowLimit>500</RowLimit></View>');
        this.collListItem = mList.getItems(camlQuery);
        context.load(collListItem);
        var historyList = context.executeQuery();
        historyList.done(function () {

            console.log("done!!!");
        });
        historyList.then(function (sArgs) {
            //var vencID = oListItem.get_id();
            //updateNewTaskCreated(vencID);
            closeTaskInHistory(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2, idTaskToClose);
            //retrieveAllUsersAllGroups();
            console.log("ListAcceded!!")

        }, function (fArgs) {
            console.log("error");

            console.log(fArgs[1].get_message());
        });
        return historyList;
    }

    var closeTaskInHistory = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2, idTaskToClose) {


        var listItemEnumerator = collListItem.getEnumerator();

        while (listItemEnumerator.moveNext()) {

            (function () {
                var curritem = listItemEnumerator.get_current();

                //alert(curritem.get_id());
                if (oldStatus != "A - Asignacion de responsable") {
                    if ((curritem.get_item("IdTarea") == idTaskToClose) && (curritem.get_item("Estado").get_lookupValue() == oldStatus)) {

                        curritem.set_item("FechaHasta", new Date());
                        curritem.update();
                        var promiseHistory = context.executeQuery();
                        promiseHistory.done(function () {
                            console.log("done!!!");
                        });
                        promiseHistory.then(function (sArgs) {
                            //var vencID = oListItem.get_id();
                            //updateNewTaskCreated(vencID);
                            updateSinisterJSOM(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
                            console.log("task updated!!")
                            //sArgs[0] == success callback sender
                            //sArgs[1] == success callback args
                        }, function (fArgs) {
                            console.log("error");
                            //fArgs[0] == fail callback sender
                            //fArgs[1] == fail callback args.
                            //in JSOM the callback args aren't used much - 
                            //the only useful one is probably the get_message() 
                            //on the fail callback
                            console.log(fArgs[1].get_message());
                        });

                    }
                } else {
                    if ((curritem.get_item("Siniestro").get_lookupValue() == sin) && (curritem.get_item("Estado").get_lookupValue() == oldStatus)) {
                        curritem.set_item("IdTarea", idTaskToClose);
                        curritem.set_item("FechaHasta", new Date());
                        curritem.update();
                        var promiseHistory = context.executeQuery();
                        promiseHistory.done(function () {
                            console.log("done!!!");
                        });
                        promiseHistory.then(function (sArgs) {
                            //var vencID = oListItem.get_id();
                            //updateNewTaskCreated(vencID);
                            updateSinisterJSOM(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
                            console.log("task updated!!")
                            //sArgs[0] == success callback sender
                            //sArgs[1] == success callback args
                        }, function (fArgs) {
                            console.log("error");
                            //fArgs[0] == fail callback sender
                            //fArgs[1] == fail callback args.
                            //in JSOM the callback args aren't used much - 
                            //the only useful one is probably the get_message() 
                            //on the fail callback
                            console.log(fArgs[1].get_message());
                        });

                    }
                }
            })();

        }






    };
    var completeOldTask = function (sin, id, oldStatus, task, newStatus) {
        var statusLetter = oldStatus.charAt(0);
        var statusList = "Tareas" + statusLetter;
        var IDTask = task.Identificador
        var etag = task.__metadata.etag;
        //var modifiedItem = {};
        //modifiedItem.EstadoValue = 2;
        task.Salto = 1;
        task.FechaDeInicio = getFormattedDate(task.FechaDeInicio);
        task.FechaDeVencimiento = getFormattedDate(task.FechaDeVencimiento);
        task.Creado = getFormattedDate(task.Creado);
        task.Modificado = getFormattedDate(task.Modificado);
        task.EstadoValue = "Completada";
        //idVencRelated = task["IdVencimiento"];
        //usrAssigned = task["AsignadoA"].Título;
        //idVencRelated = curritem.get_item("IdVencimiento");
        //usrAssigned = curritem.get_item("AsignadoA");
        closeTaskInHistory(task.Identificador, sin, newStatus);

        var jsonTask = JSON.stringify(task);
        var beforeSendFunction;
        var listTareasURL = host + "/_vti_bin/listdata.svc/" + statusList + "(" + IDTask + ")";
        //beforeSendFunction = function (xhr) {
        //    xhr.setRequestHeader("If-Match","*");
        //    xhr.setRequestHeader("X-HTTP-Method", 'MERGE');
        //}
        $.ajax({
            url: listTareasURL,
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: jsonTask,
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-HTTP-Method": "MERGE",
                "If-Match": etag,
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: getTaskToUpdate,
            error: function (xhr) {
                console.log(xhr.status + ": " + xhr.statusText);
            }
        });

        //$.ajax({
        //    type: "POST",
        //    url: listTareasURL,
        //    contentType: "application/json; charset=utf-8",
        //    data: modifiedItem,
        //    processData: false,
        //    dataTipe:"json",
        //    beforeSend: beforeSendFunction,
        //    //headers: { "accept": "application/json;odata=verbose" },
        //    error: function (xhr) {
        //       console.log(xhr.status + ": " + xhr.statusText);
        //    },
        //    success: getTaskToUpdate,
        //})
    };



    var getTaskToUpdate = function (data) {
        console.log("UPDATED!!!");


    }
    var createNewTask = function () {

    }
    var getVencByStatus = function (status, field) {
        var venc = "";
        $(allStatus).each(function (i, item) {
            if (item.status == status) {
                venc = item[field];
                return false;
            }
        });
        return venc;
    }
    var getVencimientosData = function (data) {
        var resData = data.d.results;
        $(resData).each(function (i, item) {
            var venc1 = item.Alerta1;
            var venc2 = Number(item.Alerta2);
            var esGenerica = item["TareaGenérica"];
            var title = item.Título;
            var groupName = item.Grupo;
            if (groupName != null) {
                groupName = groupName.Título;
            } else {
                groupName = "";
            }


            completeStatusWithVenc(title, venc1, venc2, esGenerica, groupName);

        });
    }
    var getVencimientos = function (sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2) {
        var listEstadosURL = host + "/_vti_bin/listdata.svc/" + listEstados + "?$expand=Grupo";
        return $.ajax({
            type: "GET",
            url: listEstadosURL,
            async: true,
            headers: { "ACCEPT": "application/json;odata=verbose" },
            success: function (data) {
                getVencimientosData(data);
            },
            error: function (error) {
                console.log(error.responseText);
            },
            complete: function () {
                venc1 = getVencByStatus(newStatus, "venc1");
                venc2 = getVencByStatus(newStatus, "venc2");

                statusLetter = oldStatus.charAt(0);
                statusList = "Tareas" + statusLetter;
                listTareasURL = host + "/_vti_bin/listdata.svc/" + statusList + "?$expand=AsignadoA&$filter=IDSiniestro eq " + idSin;
                //getOldTaskID(sin, idSin, oldStatus, listTareasURL,newStatus),         //Completa Tarea Anterior
                getOldTaskIDJSOM(sin, idSin, oldStatus, listTareasURL, newStatus, statusLetter, group, order, venc1, venc2);
            }
        });
    }
    var getVencimientosJSOM = function () {

    }

    var completeStatusWithVenc = function (title, venc1, venc2, esGen, group) {
        var vencDate1 = calculateVencDate(venc1);
        var vencDate2 = calculateVencDate(venc2);
        $(allStatus).each(function (i, item) {
            if (item.status == title) {
                item.days1 = venc1;
                item.days2 = venc2;
                item.venc1 = vencDate1;
                item.venc2 = vencDate2;
                item.gen = esGen;
                item.group = group;
                return false;
            }
        });
    };
    var calculateVencDate = function (venc) {
        var today = new Date(new Date().setDate(new Date().getDate() + Number(venc)));
        return today;

    }
    var buildComboBox = function (currentStatus) {
        var struct = "<select class='statusBox'>";
        $(allStatus).each(function (i, item) {
            struct += "<option value='" + item.statusId + "'";
            if (item.status == currentStatus) {
                struct += "selected";
            }
            struct += ">" + item.status + "</option>";
        });
        struct = struct + addClosedCategories();
        struct += "</select>";
        return struct;
    }
    var addClosedCategories = function () {
        var struct = "";
        $(allClosedCategories).each(function (i, item) {
            struct += "<option class='closedOptions' value='" + item + "'>" + item + "</option>";
        });
        return struct;
    }

    var changeState = function () {
        var buttonCreated = false;
        $(".statusBox").change(function () {
            //if (buttonCreated == false) {
            $(this).parent().parent().css("background-color", "#eaea1c");
            var applyButton = "<button id='" + $(this).parent().parent().find(".idSinister").text() + "' class='update' type='button' data-newTask='" + $(this).find("option:selected").text() + "'>Aplicar</button>"
            var fullEditButton = "<button id='" + $(this).parent().parent().find(".idSinister").text() + "' class='fullUpdate' onclick='sinaptic.adminTasks.fullUpdate();' type='button'>Edición completa</button>";

            $(this).parent().parent().find(".button").html(applyButton);
            $(this).parent().parent().find(".button").html(fullEditButton);
            // updateButton();
            buttonCreated = true;
            //} else {
            //    $(this).parent().parent().find(".button").find("button").css("display", "block");
            //}


        });
        $(".group>input").change(function () {
            $(this).parent().parent().css("background-color", "#eaea1c");

            var applyButton = "<button id='" + $(this).parent().parent().find(".idSinister").text() + "' class='update' onclick ='updateCurrentSinister();' type='button' data-newTask='" + $(this).parent().parent().find("div.status option:selected").text() + "'>Aplicar</button>"
            var fullEditButton = "<button id='" + $(this).parent().parent().find(".idSinister").text() + "' class='fullUpdate' onclick='sinaptic.adminTasks.fullUpdate();' type='button'>Edición completa</button>";


            $(this).parent().parent().find(".button").html(applyButton);
            $(this).parent().parent().find(".button").html(fullEditButton);

            // updateButton();
            buttonCreated = true;
        });
        $(".order>input").change(function () {
            $(this).parent().parent().css("background-color", "#eaea1c");
            var applyButton = "<button id='" + $(this).parent().parent().find(".idSinister").text() + "' class='update' type='button' data-newTask='" + $(this).parent().parent().find("div.status option:selected").text() + "'>Aplicar</button>"
            var fullEditButton = "<button id='" + $(this).parent().parent().find(".idSinister").text() + "' class='fullUpdate' onclick='sinaptic.adminTasks.fullUpdate();' type='button'>Edición completa</button>";


            $(this).parent().parent().find(".button").html(applyButton);
            $(this).parent().parent().find(".button").html(fullEditButton);

            // updateButton();
            buttonCreated = true;
        });
    }
    var buildDataToPOST = function () {
    }

    var POSTData = function () {

    }


    var fullUpdate = function () {

        var currentPage = window.location.href;
        currentPage = currentPage.substr(0, pagina.indexOf('/Paginas'));

        var sinisterId = $(".idSinister").text().replace("ID Siniestro", "");

        window.location = currentPage + "/Lists/Siniestros/EditForm.aspx?ID=" + sinisterId + "&ContentTypeId=0x01009C8D5AF7175C2447B4163BF8A6A26635&IsDlg=1";

    }


    var updateCurrentSinister = function () {

        var currentPage = window.location.href;
        currentPage = currentPage.substr(0, pagina.indexOf('/Paginas'));

        var sinisterId = $(".idSinister").text().replace("ID Siniestro", "");

        payload = {
            EstadoId: $(".status option:selected").val(),
            Grupo: $(".groupInbox").val(),
            Orden: $(".orderInbox").val()
        };



        $.ajax({
            url: currentPage + "/_vti_bin/listdata.svc/Siniestros(" + sinisterId + ")",
            type: "POST",
            processData: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(payload),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "MERGE",
                "If-Match": "*"
            },
            success: function (data) {
                alert("Siniestro actualizado");

            },
            error: console.log("Error en la edición rapida")
        });


    }
    return {
        init: init,
        getAllStatus: getAllStatus,
        enterPressed: enterPressed,
        fullUpdate: fullUpdate
    }
})(jQuery);