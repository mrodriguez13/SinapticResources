"use strict";

var sinaptic = sinaptic || {};

sinaptic.vm = sinaptic.vm || {};

sinaptic.wf = sinaptic.wf || {};

sinaptic.wf.validateForm = function (objeto, estadoId, success, error) {
    var errores = [];
    switch (estadoId) {
        case 0:
            if (objeto.Siniestro === "") {
                errores.push("Debe completar el campo Siniestro.");
            }

            if (objeto.Grupo === "") {
                errores.push("Debe completar el campo Grupo.");

            }

            if (objeto.Orden === "") {
                errores.push("Debe completar el campo Orden.");

            }

            if (objeto.Tomador === "") {
                errores.push("Debe completar el campo Tomador.");

            }

            if (objeto.FechaSiniestro === "T00:00:00") {
                errores.push("Debe completar el campo Fecha Siniestro.");

            }

            if (objeto.ModeloVehiculo === "") {
                errores.push("Debe completar el campo Modelo de Vehiculo");

            }

            if (objeto.Dominio === "") {
                errores.push("Debe completar el campo Dominio");

            }

            if (objeto.SumaAsegurada === "") {
                errores.push("Debe completar el campo Suma Asegurada");

            }

            if (objeto.MailCliente === "") {
                errores.push("Debe completar el campo Mail de Cliente");

            }

            if (objeto.TelCliente === "") {
                errores.push("Debe completar el campo Telefono de Cliente");

            }

            if (objeto.MailCia === "") {
                errores.push("Debe completar el campo Mail Compañía");

            }

            if (objeto.TelCia === "") {
                errores.push("Debe completar el campo Teléfono Compañía");

            }
            break;
        case 25:
            if (objeto.VencimientoDeuda < new Date().toISOString()) {
                errores.push("La fecha de vencimiento del saldo deusor no puede ser menor que la fecha en curso");
            }
            break;
    }

    if (errores.length > 0) {    
        if(error === null || error === undefined){
            for (var i = 0; i < errores.length; i++) {
                console.log(errores[i]);
            }
        }
        else{
            error(errores);
        }
    }
    else {
        success();
    }


}