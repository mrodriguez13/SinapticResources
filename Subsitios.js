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
	       
	    var element = '<span><h2 class="text-title" style="color: white;text-align:left;margin:0px">' + value.LinkTitle + '</h2></span><span><p class="text-description" style="color: white;text-align:left;margin:0px">Descripción de la sección "Gestiones personales".<p></span><br>'; 
	       	
	    $("#tituloYDescripcion").html(element);	          
       });      
       		
    });
      
 })
