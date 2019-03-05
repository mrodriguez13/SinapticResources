var subsitios = [];

$(document).ready(function() {	
	$pnp.setup({
        sp: {
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        }
    });

	$pnp.sp.web.lists.getByTitle("MenuPrincipal").items.orderBy("Orden").get().then(r => {
       $.each(r, function (index, value) { 
            
			if(window.location.href == "https://intranet.inta.gob.ar/testing/rrhh/Paginas/RRHH1.aspx") {
				$(".text-title").innerHTML = value.Title;
				$(".text-descripcion").innerHTML = value.Descripcion;
			}
				          
       });      
       		
    });
      
 })
