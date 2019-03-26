var filas = 0;
var documentos = 0;

function agregarDocumento(documento) {

    if (documentos % 3 != 0) {
        $("#fila"+filas).append(documento);
        documentos++;
    }
    else {
        var fila = '<div id="fila' + filas + '" class="row"></div>';
        $("#documentos").append(fila);
        $("#fila"+filas).append(documento);
        filas++;
    }
}

$(document).ready(function() {	

	$pnp.setup({
        sp: {
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        }
    });
    			
    $pnp.sp.site.rootWeb.lists.getByTitle("AccesosDocumentos").items.get().then(r => {

       $.each(r, function (index, value) {

            var documento = '<div class="col-md-4 app-access"><img src="' + value.Icono.Url + '"; width=35px;/><a href="' + value.Documento + '"><span class="visible-xs-inline" style="margin-left: 12px">' + value.Title + '</span></a></div>';
            agregarDocumento(documento);
                
        });

    });
			
});
    
