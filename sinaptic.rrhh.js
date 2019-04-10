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
            
            var boton = '<a href="' + value.URL + '">' + value.Title + '</a>'
            
            if (value.Parent == 'Presentismo') {
                $(".mosaico").append(boton);
            }
    
        });                                                              
    });

    $("#titulo-sitio").html("Presentismo");
    
})



