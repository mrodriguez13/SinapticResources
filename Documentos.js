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
	       
	        if (window.location.href == value.Subsitio && documentos < 5) {
	            //documentos++;
	      
			/*
	            switch (documentos) {
		            case 1: 
			            grid = "col-md-12";
			            break;
		            case 2: 
			            grid = "col-md-6";
			            break;
	                case 3: 
			            grid = "col-md-4";
			            break;
		            case 4: 
			            grid = "col-md-3";
                        break;
			*/
                }
            }
            
            var documento = '<div class="col-md-4" app-access"><img src="' + value.Icono.Url + '"; width=35px;/><a href="' + value.Documento + '"><span class="visible-xs-inline" style="margin-left: 12px">' + value.Title + '</span></a></div>';
            $("#documentos").append(documento);
	});  	       
    });
})
