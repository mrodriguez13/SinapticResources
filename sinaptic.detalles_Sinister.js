var pagina = window.location.href;
pagina = pagina.substring(0, pagina.indexOf("/Paginas"));
//var idSinister = window.location.hash.slice(4); 

$(document).ready(function () {
    getSpecificSinister();
});

var SiniestroProperties = {
    Siniestro: "",
    ID: "",
    Grupo: "",
    Team_Leader:"",
    Responsable: "",
    Orden: "",
    Carrier: "",
    Tomador: "",
    Mail_Cliente: "",
    Tel_Cliente: "",
    Mail_Cia: "",
    Tel_Cia: "",
    Fecha_Siniestro:"",
    Tipo_Siniestro: "",
    Dominio: "",
    Suma_Asegurada: "",
    Tipo_Resolucion: "",
    Creacion_del_Siniestro: "",
    Días_Transcurridos: "",
    Estado: ""
}



function getSpecificSinister() {
    //var url = pagina + "/_vti_bin/listdata.svc/Siniestros?$filter=Identificador eq " + idSinister;
   
    var url = pagina + "/_vti_bin/listdata.svc/Siniestros?$expand=Estado,Carrier,Responsable,TeamLeader,TipoDeResuloción&$filter=Identificador eq 695";

    //var url = pagina + "/_vti_bin/listdata.svc/Siniestros?$expand=Estado";
    $.ajax({
        url: url,
        type: "GET",
        async: true,
        headers: { "accept": "application/json;odata=verbose" },
        success: function (data) {
            var objectSinister = data.d.results[0];
            console.log(objectSinister);

            fillProps(objectSinister);
        }
    });
}

function fillProps(objectSinister) {

    SiniestroProperties.Siniestro = objectSinister.Siniestro;
    SiniestroProperties.ID = objectSinister.Identificador;
    SiniestroProperties.Grupo = objectSinister.Grupo;
    SiniestroProperties.Team_Leader = objectSinister.TeamLeader.Nombre;
    SiniestroProperties.Responsable = objectSinister.Responsable.Nombre;
    SiniestroProperties.Orden = objectSinister.Orden;
    SiniestroProperties.Carrier = objectSinister.Carrier.Título;
    SiniestroProperties.Tomador = objectSinister.Tomador;
    SiniestroProperties.Mail_Cliente = objectSinister.MailCliente;
    SiniestroProperties.Tel_Cliente = objectSinister.TelCliente;
    SiniestroProperties.Mail_Cia = objectSinister.MailCia;
    SiniestroProperties.Tel_Cia = objectSinister.TelCia;
    SiniestroProperties.Tipo_Siniestro = objectSinister.TipoDeSiniestroValue;
    SiniestroProperties.Dominio = objectSinister.Dominio;

    SiniestroProperties.Suma_Asegurada = objectSinister.SumaAsegurada;
    SiniestroProperties.Tipo_Resolucion = objectSinister.TipoDeResulociónValue;
    SiniestroProperties.Creacion_del_Siniestro = objectSinister.Creado;
    SiniestroProperties.Días_Transcurridos = -

    SiniestroProperties.Estado = objectSinister.Estado.Descripción;


 

    fillData();
}

function fillData() {
    $("#sinisterTitle").text(SiniestroProperties.Siniestro);
    

}