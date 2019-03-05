var subsitios = [];

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
				$(".text-title").innerHTML = value.Title;
				$(".text-descripcion").innerHTML = value.Descripcion;
			}
				          
       });      
       		
    });
      
 })
