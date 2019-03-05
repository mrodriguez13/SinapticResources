var subsitios = [];
var numero = 4;

$(document).ready(function() {	
	$pnp.setup({
        sp: {
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        }
    });

    $pnp.sp.web.lists.getByTitle("MenuPrincipal").items.get().then(r => {
       $.each(r, function (index, value) { 
            if(window.location.href == value.Url) {
		$("#titulo").append(value.LinkTitle);
		$("#descripcion").append(value.%255Fx0066%255Fhb3);
	    }		          
       });      
       		
    });
      
 })
