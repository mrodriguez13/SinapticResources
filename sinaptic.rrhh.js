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
          if (value.ParentID != null) {
            if(value.ParentID.get_lookupValue() == 'Presentismo') {
                var boton = '<button class="boton">' + value.Title + '</button>';
                $(".botones").append(boton);
            }
          }    
        });                                                              
    });

    $("#titulo-sitio").append("Presentismo");
    
})

