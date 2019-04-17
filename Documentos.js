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

            if (value.Subsitio == window.location.href) {
		documentos++;
                var documento = '<div id="documento' + documentos + '" class="documento" app-access"><img class="icono" src="' + value.Icono.Url + '"; width=35px;/><a href="' + value.Documento + '"><span class="visible-xs-inline" style="margin-left: 12px; font-family: \'Robotolight\'; font-size: 15px;">' + value.Title + '</span></a></div>';
                $("#documentos").append(documento);
            }
        }); 
	    
	switch (documentos) {
                case 1:
                    $('.documento').addClass('col-md-12');
                break;
                case 2:
                    $('.documento').addClass('col-md-6');
		    $('#documento1').css('padding-left','300px');
		    $('#documento1').css('padding-right','0px');
	            $('#documento2').css('padding-left','0px');
		    $('#documento2').css('padding-right','300px');
                break;
                case 3:
                    $('.documento').addClass('col-md-4');
		    $('#documento1').css('padding-left','200px');
		    $('#documento2').css('padding-right','0px');
		    $('#documento3').css('padding-right','200px');
                break;
                case 4:
                    $('.documento').addClass('col-md-3');
		    $('#documento4').css('padding-right','40px');
                break;
         }
         	       
    });
})
