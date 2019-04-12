$(document).ready(function() {

    $pnp.setup({
        sp: {
            headers: {
                "Accept": "application/json; odata=verbose"
            }
        }
    });

    var id = getUrlParameter('ID');

    $pnp.sp.web.lists.getByTitle("Tilesrrhh").items.get().then(r => {
        $.each(r, function(index, value) {          
            
            if (value.ID == id) {
                var parent = value.Title; 
            }
                
            
            var boton = '<div class="panel__inner boton" onclick="window.location = \'' + value.URL + '\'">' + value.Title + '</a>';
            
            if (value.Parent == parent) {
                
                $(".mosaico").append(boton);
            }
    
        });                                                              
    });

    $("#titulo-sitio").html(parent);  
    
      
})

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
