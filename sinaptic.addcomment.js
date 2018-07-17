var CommentsFromSinister = (function () {
    var sinesterID = 0;
    var principalDataField = "";
    var listSinester = "Comentarios";
    var setSinisterID = function (idParam) {
        if (idParam != null) {
            sinesterID = idParam;
        }
        else {
            var fullUrl = window.location.href;
            var idArr = fullUrl.split("ID=");
            sinesterID = idArr[1];
        }
    }
    var getCommentsData = function () {
        var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        $.ajax({
            url: host + "/_vti_bin/listdata.svc/" + listSinester + "?$expand=Comentarista&$filter=IDSiniestro eq " + sinesterID + "&$orderby=Creado desc",//select=" + fieldsquery + ",Identificador&$expand=Carrier,Estado,&$filter=(Identificador eq " + sinesterID + ")",
            type: "GET",
            async: true,
            headers: { "accept": "application/json;odata=verbose" },
            success: successCall,
            complete: completeCall
        });
    };
    var saveComment = function () {
        var comment = $("#comentario").val();
        if (comment === "" || comment === undefined) {
            alert("No se puede guardar un comentario vacío");
            return;
        }
        hasComment = true;
        var properties = {
            T\u00edtulo: currentSinister.Siniestro,
            Comentario: comment,
            IDSiniestro: currentSinister.Identificador,
            EstadoComentario: currentSinister.Estado.Descripción,
            ComentaristaId: _spPageContextInfo.userId
        }
        var host = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        $.ajax({
            url: host + "/_vti_bin/listdata.svc/Comentarios",
            type: "POST",
            processData: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(properties),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                $("#comentario").val("");
                $("#comentario").prop("disabled", false);
                $("#saveComment").prop("disabled", false);
                $("#newComment").css("display", "none");
                getCommentsData();
            },
            error: errorHandler
        });
    }
    function dateToString(date) {
        var hour = ((date.getHours() < 10) ? "0" + date.getHours() : date.getHours());
        var minutes = ((date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes());
        return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + "  " + hour + ":" + minutes ;
    };
    var localDate = function(oridate) {
        if (oridate) {
            var date = moment(oridate);
            date.add((date.utcOffset() * -1)*2, 'm');
            return dateToString(date._d);
        }
        return ""
    }
    var errorHandler = function (err) {
        console.log("Error: " + JSON.stringify(err));
        $("#newComment").css("display", "none");
    };
    var successCall = function (data) {
        var resData = data.d.results;
        var structureLegacy = "";
        $(resData).each(function (i, item) {
            if (item.IDSiniestro == sinesterID) {
                //if (item.RutaDeAcceso.search(sinesterID) >= 0) {
                var initialDate = item.Creado.replace(")/", "");
                initialDate = initialDate.replace("(", "");
                initialDate = initialDate.replace("/Date", "");
                //var createdDate = new Date(parseInt(initialDate));
                var createdDate = localDate(item.Creado);

                /*var day = ((createdDate.getDate() < 10) ? "0" + createdDate.getDate() : createdDate.getDate());
                var month = (((parseInt(createdDate.getMonth()) + 1) < 10) ? "0" + (parseInt(createdDate.getMonth()) + 1) : (parseInt(createdDate.getMonth()) + 1));
                var hour = ((createdDate.getHours() < 10) ? "0" + createdDate.getHours() : createdDate.getHours());
                var minutes = ((createdDate.getMinutes() < 10) ? "0" + createdDate.getMinutes() : createdDate.getMinutes());


                createdDate = day + "/" + month + "/" + createdDate.getFullYear() + "  " + hour + ":" + minutes;
                                */
                structureLegacy = structureLegacy + "<div class='legacyFile'><div class='titleComment'><h3>" + item.EstadoComentario + "</h3></div><div class='comment'><p>" + item.Comentario + "</p></div><div class='commentAuthor'>" + createdDate + "<p id='comentarista' style='font-size:11px;display:inline;'>" + ((item.Comentarista != null) ? " - " + item.Comentarista.Nombre : '') + "</p></div></div>";


            }
        });

        var mdlContent = [];
        mdlContent.push('<div id="modalWindow" class="modal" style="display:none;">');
        mdlContent.push('<div class="modal-content">');
        mdlContent.push('<div class="modal-header">');
        mdlContent.push('<span class="close" onclick="$(\'#modalWindow\').css(\'display\', \'none\')">&times;</span>');
        mdlContent.push('<h2>Nuevo comentario</h2>');
        mdlContent.push('</div>');
        mdlContent.push('<div class="modal-body">');
        mdlContent.push('<input type="text" placeholder="Ingrese comentario" id="comentario" ></input>');
        mdlContent.push('</div>');
        mdlContent.push('<div class="modal-footer">');
        mdlContent.push('<button type="button" id="addButton" onclick="CommentsFromSinister.saveComment()">Agregar comentario</button>');
        mdlContent.push('</div>');
        mdlContent.push('</div>');
        mdlContent.push('</div>');

        structureLegacy = structureLegacy + mdlContent.join("");


        $("#CommentsSection").html(mdlContent.join(""));
        if (structureLegacy == "") {
            structureLegacy = "<h4>No hay comentarios asociados a este Siniestro</h4>";
        }
        $("#CommentsSection").html(structureLegacy);

        $("#newComment").click(function () {
            $("#modalWindow").css("display","block");
        });


    }
    var completeCall = function (data) {
    }
    return {
        getCommentsData: getCommentsData,
        setSinisterID: setSinisterID,
        saveComment: saveComment
    }
})(jQuery);

