$(document).ready(function() {

    $pnp.setup({
        sp: {
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        }
    });
        
    $(".mosaico").append('<div class="panel boton"></div>');
    
});
