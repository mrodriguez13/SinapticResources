$(document).ready(function() {

    $pnp.setup({
        sp: {
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        }
    });
        
    $(".mosaico").append('<div class="panel panel__inner boton"></div>');
    
});
