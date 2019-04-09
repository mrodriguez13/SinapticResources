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
              
              SPLookupValue _value = value.FieldValues["ParentID"] as SP.FieldLookUpValue;
              var mylookupvalue = _value.LookupValue;
              
            if(mylookupvalue == 'Presentismo') {
                var boton = '<button class="boton">' + value.Title + '</button>';
                $(".botones").append(boton);
            }
          }    
        });                                                              
    });

    $("#titulo-sitio").append("Presentismo");
    
})

