var documentos = [];

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
       
            var documento = '<div class="col-md-4 app-access"><div class="panel-heading hidden-xs"><img src="' + value.Icono.Url + '"/></div><div class="rigth-panel"><span class="visible-xs-inline">' + value.Title + '</span></div></a></div>';
            $("#documentos").append(documento);   
                
        });

    });
		
		
    });
    
