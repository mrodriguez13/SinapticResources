var documentos = 0;

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
            documentos++;

            if (value.Subsitio == window.location.href) {
                var documento = '<div class="documento" app-access"><img src="' + value.Icono.Url + '"; width=35px;/><a href="' + value.Documento + '"><span class="visible-xs-inline" style="margin-left: 12px">' + value.Title + '</span></a></div>';
                $("#documentos").append(documento);
            }

            switch (documentos) {
                case 1:
                    $('.documento').addClass('col-md-12');
                    break;
                case 2:
                    $('.documento').addClass('col-md-6');
                    break;
                case 3:
                    $('.documento').addClass('col-md-4');
                    break;
                case 4:
                    $('.documento').addClass('col-md-3');
                    break;
            }

        }); 
         	       
    });
})
