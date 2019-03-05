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
		var html = '<span><h2 class="text-title" style="color: white;text-align:left;margin:0px">Gestiones personales.</h2></span><span><p class="text-description" style="color: white;text-align:left;margin:0px">Descripción de la sección "Gestiones personales".<p></span><br>';
		$("#tituloYDescripcion").append(html);
	    }		          
       });      
       		
    });
      
 })
