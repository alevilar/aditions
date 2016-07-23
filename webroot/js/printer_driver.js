

if (typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    var fiscalberryHost = localStorage.getItem("fiscalberryHost");
    if ( !fiscalberryHost ) {
    	fiscalberryHost = "fiscalberry.local";
    	localStorage.setItem("fiscalberryHost", fiscalberryHost);
    }
} else {
    // Sorry! No Web Storage support..
    var fiscalberryHost = "fiscalberry.local";
}


var fbrry = new Fiscalberry(fiscalberryHost);

fbrry.promise.done(function(){
	console.info("me conecte con el fiscalberry");
});


fbrry.promise.fail(function(){
	console.error("no se pudo conectar con el fiscalberry");
});


PrinterDriver = {

    /* Inicializa valores en el localstorage */
    init: function () {
        var mapTipoFactura = localStorage.getItem("mapTipoFactura");
        if ( !mapTipoFactura ) {
            /* MAP con tabla tipo_facturas */
            mapTipoFactura = {
                1: "FA",
                2: "T",
                5: "FC"
            };
            localStorage.setItem("mapTipoFactura", mapTipoFactura);
        }



        // map con tabla iva_responsabilidades
        var mapResponsabilidad = localStorage.getItem("mapResponsabilidad");
        if ( !mapResponsabilidad ) {
            /* MAP con tabla tipo_facturas */
            mapResponsabilidad = {
                1: "RESPONSABLE_INSCRIPTO",
                2: "EXENTO",
                3: "NO_RESPONSABLE",
                4: "CONSUMIDOR_FINAL",
                5: "NO_CATEGORIZADO",
                6: "RESPONSABLE_MONOTRIBUTO"
            };
            localStorage.setItem("mapResponsabilidad", mapResponsabilidad);
        }




        // map con tabla tipo_documentos
        var mapTipodoc = localStorage.getItem("mapTipodoc");
        if ( !mapTipodoc ) {
            /* MAP con tabla tipo_facturas */
            mapTipodoc = {
                1: "CUIT",
                2: "CUIT",
                3: "LIBRETA_ENROLAMIENTO",
                4: "LIBRETA_CIVICA",
                5: "DNI",
                6: "PASAPORTE",
                7: "CEDULA",
                8: "SIN_CALIFICADOR"
            };
            localStorage.setItem("mapTipodoc", mapTipodoc);
        }
    },

    printTicket: function( mesa ) {

        /**
        *   {
        *       "tipo_cbte": "FA",
        *       "nro_doc": "20267565393",
        *       "domicilio_cliente": "Rua 76 km 34.5 Alagoas",
        *       "tipo_doc": "DNI",
        *       "nombre_cliente": "Joao Da Silva",
        *       "tipo_responsable": "RESPONSABLE_INSCRIPTO"
        *   },
        *
        **/
        function generarEncabezado( mesa ) {
            var jsonRet = {};

            jsonRet["tipo_cbte"] = "T"; // tiquet pr defecto

            if ( mesa.Cliente() ) {
                

                
                var tipo_factura_id = mesa.Cliente().IvaResponsabilidad().tipo_factura_id()
                var mapTipoFactura = localStorage.getItem("mapTipoFactura");
                jsonRet["tipo_cbte"] = mapTipoFactura[tipo_factura_id];

                var iva_responsabilidad_id = mesa.Cliente().iva_responsabilidad_id();
                var mapResponsabilidad = localStorage.getItem("mapResponsabilidad");
                jsonRet["tipo_responsable"] = mapResponsabilidad[iva_responsabilidad_id];

                var tipo_doc_id = mesa.Cliente().tipo_documento_id();
                var mapTipodoc = localStorage.getItem("mapTipodoc");
                jsonRet["tipo_doc"] = mapTipodoc[tipo_doc_id];
                
                jsonRet["nro_doc"]  = mesa.Cliente().nrodocumento();
                jsonRet["domicilio_cliente"]  = mesa.Cliente().domicilio();
                jsonRet["nombre_cliente"]  = mesa.Cliente().nombre();
            }
            

            return jsonRet;
        }



        /**
        * @return array de items
        *
        *   {
        *       "alic_iva": 21.0,
        *       "importe": 0.01,
        *       "ds": "PIPI",
        *       "qty": 1.0
        *   },
        **/
        function generarItems ( mesa ) {
            var jsonRet = [];

            var prods = mesa.listadoProductos();

            // Risto.IVA_PORCENTAJE
            for (var i = 0; i < prods.length; i++) {
                jsonRet.push({
                    "alic_iva": Risto.IVA_PORCENTAJE,
                    "importe": prods[i]["precio"],
                    "ds": prods[i]["name"],
                    "qty": prods[i]["qty"]
                });
            }
            return jsonRet;
        }


        /**
        *  {
        *      "ds": "efectivo",
        *      "importe": 1.0
        *  }
        *
        **/
        function generarPagos( mesa ) {
            var jsonRet = [];
            var pagos = mesa.Pago();
            for (var i = 0; i < pagos.length; i++) {
                jsonRet.push({
                    "ds": pagos[i].TipoDePago().name(),
                    "importe": pagos[i].valor()
                });
            }
            return jsonRet;
        }

        var encabezado = generarEncabezado( mesa );
        var items = generarItems( mesa );


        jsonRet = {"printTicket": {            
            "encabezado": encabezado,
            "items": items
        }};

        // agregar descripcion de pagos si es que los hay
        var pagos = generarPagos( mesa );
        if ( pagos.length ) {
            jsonRet['printTicket']['pagos'] = pagos;
        }


        jsonRet = JSON.stringify(jsonRet);
        fbrry.send( jsonRet );
        return  JSON.stringify(jsonRet);
    }
    
}



PrinterDriver.init();