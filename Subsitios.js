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

    $pnp.sp.site.rootWeb.lists.getByTitle("MenuPrincipal").items.get().then(r => {
       $.each(r, function (index, value) {	
	       if(value.fo9i == window.location.href) {
		    var element = '<span><h2 class="text-title" style="color: white;text-align:left;margin:0px">' + value.Title + '</h2></span><span><p class="text-description" style="color: white;text-align:left;margin:0px">' + value._x0066_hb3 + '<p></span><br>'; 
	            $("#tituloYDescripcion").html(element);	 
	       }
       });      
       		
    });
      
 })
