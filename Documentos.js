var documentos = [];

$(document).ready(function() {	

	$pnp.setup({
        sp: {
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        }
    });
    
			
	$pnp.sp.site.rootWeb.lists.getByTitle("AccesosRapidos").items.get().then(r => {

       $.each(r, function (index, value) {
       
            var documento = '<div class="col-md-3 app-access"><a href="' + value.URL + '" class="panel panel-default panel-icon panel-primary"><div class="panel-heading hidden-xs"><div class="left-panel"><img src="' + value.Icono + '"/></div><div class="rigth-panel"><span class="visible-xs-inline">' + value.Title + '</span></div></div></a></div>';
            $("#documentos").html(documento);   
                
        });

    });
		
		
    });
    
        
})
