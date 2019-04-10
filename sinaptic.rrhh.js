$(document).ready(function() {

    $pnp.setup({
        sp: {
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        }
    });
    
    $pnp.sp.web.lists.getByTitle("Tilesrrhh").items.get().then(r => {
        $.each(r, function(index, value) {   
              
            if (value.Parent == 'Presentismo') {
                var boton = '<a href="' + value.URL + '" class="boton">' + value.Title + '</a>';
                $("#botones").append(boton);
            }
    
        });                                                              
    });

    $("#titulo-sitio").append("Presentismo");
    
})



