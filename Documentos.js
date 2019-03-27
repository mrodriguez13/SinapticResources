var documentos = 0;
var grid;

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
		
	    if (value.Subsitio == window.location.href) {
                var documento = '<div class="col-md-3" app-access"><img src="' + value.Icono.Url + '"; width=35px;/><a href="' + value.Documento + '"><span class="visible-xs-inline" style="margin-left: 12px">' + value.Title + '</span></a></div>';
                $("#documentos").append(documento);
	    }
		
	});  	    
    });
})

