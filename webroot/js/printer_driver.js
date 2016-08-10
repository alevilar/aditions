

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

var maxRetry = 3;
var reconectandoTimeoput;

function reconectarFbrry(){
    
    if ( maxRetry > 0) {
        if ( !reconectandoTimeoput ) {
            console.info("reconectando fiscalberry, quedan %s intentos", maxRetry);
            fbrry.connect(fiscalberryHost);
            reconectandoTimeoput = setTimeout(function(){
                clearTimeout(reconectandoTimeoput);
                reconectandoTimeoput = null;
                reconectarFbrry();
            }, 5000);
            maxRetry--;
        }
    } else {
        clearInterval(reconectandoTimeoput);
        reconectandoTimeoput = null;
        $.error("Se agotaron la cantidad maxima de reintentos para conectar con fiscalberry");
    }


}

fbrry.promise.done(function(){
	console.info("me conecte con el fiscalberry");
});


fbrry.promise.fail(function(){
	console.error("no se pudo conectar con el fiscalberry");
});

fbrry.bind('close', function(){
    maxRetry = 3;
    reconectarFbrry();
    });
fbrry.bind('open', function(){
    if ( reconectandoTimeoput ) {
        clearInterval(reconectandoTimeoput);
        reconectandoTimeoput = null;
    }
});


PrinterDriver = {
    $printerDriverContainer: null, // 
    
    _setUI: function(){
        $(function(){
            PrinterDriver.$printerDriverContainer = 
                            $('<div id="printer-driver-container">\
                                <div class="icon"></div>\
                                <ul class="printer-driver-msg"></ul>\
                               </div>');
            PrinterDriver.$printerDriverContainer.css({
                'position': 'fixed',
                'top': '10px',
                'left': '10px',
                'width': '300px',
                'height': '20px',
                'padding': '3px'
            });

            $(".icon", PrinterDriver.$printerDriverContainer).css({
                'position': 'absolute',
                'top': '10px',
                'left': '10px',
                'width': '20px',
                'height': '20px',
                '-webkit-border-radius': '50px',
                '-moz-border-radius': '50px',
                'border-radius': '50px'
            });


            $(".printer-driver-msg", PrinterDriver.$printerDriverContainer).css({
                'padding': '0px',
                'position': 'absolute',
                'top': '-10px',
                'left': '50px',
                'width': '300px',
                'color': '#AEFFAE',
                'font-size': '8pt'
            });

            if ( fbrry.isConnected() ) {
                $(".icon", PrinterDriver.$printerDriverContainer).css('background', 'green');
            } else {
                $(".icon", PrinterDriver.$printerDriverContainer).css('background', 'red');
            }
            PrinterDriver.$printerDriverContainer.appendTo( $("#listado-mesas") );

            // al conectar poner en verde
            fbrry.bind('open', function(){
                $(".icon", PrinterDriver.$printerDriverContainer).css('background', 'green');
            });

            // al desconectar poner en rojo nuevDataamente
            fbrry.bind('close', function(){
                $(".icon", PrinterDriver.$printerDriverContainer).css('background', 'red');
            });

            fbrry.bind('message', function( ev, evData ){

                var msg = '';
                if ( evData.data.hasOwnProperty('msg')) {
                    for (var i = 0; i < evData.data['msg'].length; i++ ){
                        msg += "<li>"+evData.data['msg'][i]+"</li>";
                    }
                }
                $(".printer-driver-msg", PrinterDriver.$printerDriverContainer).html(msg);
            });
        });
    },

    /* Inicializa valores en el localstorage */
    init: function () {
        PrinterDriver._setUI();
        var mapTipoFactura = JSON.parse( localStorage.getItem("mapTipoFactura") );
        if ( !mapTipoFactura ) {
            /* MAP con tabla tipo_facturas */
            mapTipoFactura = {
                1: "FA",
                2: "T",
                5: "FC"
            };
            localStorage.setItem("mapTipoFactura", JSON.stringify(mapTipoFactura));
        }



        // map con tabla iva_responsabilidades
        var mapResponsabilidad = JSON.parse( localStorage.getItem("mapResponsabilidad"));
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
            localStorage.setItem("mapResponsabilidad", JSON.stringify(mapResponsabilidad));
        }




        // map con tabla tipo_documentos
        var mapTipodoc = JSON.parse( localStorage.getItem("mapTipodoc") );
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
            localStorage.setItem("mapTipodoc", JSON.stringify(mapTipodoc));
        }
    },


    __doPrintComanda: function( mesa, comanda, printerName ) {
        var actionname = "printComanda";

        var jsonRet = {
            "printerName": printerName,
        };

        console.debug(jsonRet);
        jsonRet[actionname] = {"comanda":{}};


        if (comanda.id()) {
            jsonRet[actionname]['comanda']['id'] = comanda.id();
        }

        if (comanda.observacion()) {
            jsonRet[actionname]['comanda']['observacion'] = comanda.observacion();
        }

        if (comanda.created()) {
            jsonRet[actionname]['comanda']['created'] = comanda.created();
        }


        function prodList (entradasList) {

            var entradas = [];
            var ptoAux = {};
            for (var i = 0; i < entradasList.length; i++ ) {
                dc = entradasList[i];
                ptoAux = {
                    "cant": dc.realCant(),
                    "nombre": dc.nameConSabores()
                };

                if ( dc.observacion() ) {
                    ptoAux['observacion'] = dc.observacion();
                }
                entradas.push( ptoAux ); 
            }
            return entradas;
        }
        

        var entradasList = [];
        var platosList = [];

        var dc;
        for (var i = 0; i < comanda.DetalleComanda().length; i++ ){
            dc = comanda.DetalleComanda()[i];
            if ( dc.esEntrada() ) {
                entradasList.push(dc);
            } else {
                platosList.push(dc);
            }
        }

        if ( entradasList.length > 0 ) {
            jsonRet[actionname]["comanda"]["entradas"] = prodList(entradasList);
        }

        if ( platosList.length > 0 ) {
            jsonRet[actionname]["comanda"]["platos"] = prodList(platosList);
        }
        
        
        jsonRet[actionname]["setTrailer"] = [
                    "",
                    "MOZO: "+mesa.mozo().numero(),
                    "MESA: "+mesa.numero(),
                    ""
                ];
        
        jsonRet = JSON.stringify(jsonRet);
        return  fbrry.send( jsonRet );
    },

    printComanda: function( mesa, comanda, printerName ) {
        console.info("estoy imprimiendo una comanda %o", comanda);

        var comanderasInvolucradas = [];
        var printId, prod;
        for( var i=0;i<comanda.DetalleComanda().length; i++) {
            prod = comanda.DetalleComanda()[i].Producto();
            console.log("el producto de dc es %o", prod.name);
            if ( typeof prod.printer_id === 'function') {
                printId = prod.printer_id();
            } else {
                printId = prod.printer_id;
            }
            printId = Risto.getPrinterId(printId);
            if (printId) {
                comanderasInvolucradas.push(printId);
            }
        }
        console.info("comanderas involucradas %o", comanderasInvolucradas);
        for(var i=0; i<comanderasInvolucradas.length;i++) {
            var printerName = comanderasInvolucradas[i].Printer.alias;
            PrinterDriver.__doPrintComanda(mesa, comanda, printerName);
        }
        
    },


    printRemito: function( mesa ) {
        console.info("estoy imprimiendo un remito de la mesa %o", mesa);
        if ( Risto.printerComanderaPPal ) {
            var ret = PrinterDriver.__printGenericTicket(mesa, "printRemito", Risto.printerComanderaPPal.Printer.alias )
            console.info("se va a mandae el printTicket %o", ret);
            return ret;
        } else {
            $.error("no hay impresora de comandas configurada");
        }
    },


    printTicket: function( mesa ) {
        console.info("estoy imprimiendo un ticket de la mesa %o", mesa);
        if ( Risto.printerFiscal.Printer.alias) {

            var ret = PrinterDriver.__printGenericTicket(mesa, "printTicket", Risto.printerFiscal.Printer.alias);
            console.info("se va a mandae el printTicket %o", ret);
            return ret;
        } else {
            $.error("no hay impresora fiscal configurada");
        }
    },


    dailyClose: function( type ) {
        if ( typeof type === 'undefined' ) {
            type = "x";
        }

        if ( Risto.printerFiscal.Printer.alias) {

            jsonRet = JSON.stringify({
                "printerName": Risto.printerFiscal.Printer.alias,
                "dailyClose" : type
            });
            return  fbrry.send( jsonRet );
        } else {
            $.error("no hay impresora fiscal configurada");
        }

    },


    /**
    *
    *   @param mesa Mesa.class.js
    *   @param actionName string "printTicket" o "printRemito"
    *   @param printerName string nombre de la impresora segun fiscaleberry config.ini file
    **/
    __printGenericTicket: function( mesa, actionName , printerName) {

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

            if ( mesa.Cliente() &&  mesa.Cliente().nrodocumento() ) {
                
                var tipo_factura_id = mesa.Cliente().IvaResponsabilidad().tipo_factura_id()
                var mapTipoFactura = JSON.parse( localStorage.getItem("mapTipoFactura") );
                jsonRet["tipo_cbte"] = mapTipoFactura[tipo_factura_id];

                var iva_responsabilidad_id = mesa.Cliente().iva_responsabilidad_id();
                var mapResponsabilidad = JSON.parse( localStorage.getItem("mapResponsabilidad") );
                jsonRet["tipo_responsable"] = mapResponsabilidad[iva_responsabilidad_id];

                var tipo_doc_id = mesa.Cliente().tipo_documento_id();
                var mapTipodoc = JSON.parse( localStorage.getItem("mapTipodoc") );
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


        if (typeof printerName == 'undefined') {
            jsonRet = {};
        } else {
            jsonRet = {"printerName": printerName};
        }
        jsonRet[actionName] = {            
            "encabezado": encabezado,
            "items": items
        };

        // agregar descripcion de pagos si es que los hay
        var pagos = generarPagos( mesa );
        if ( pagos.length ) {
            jsonRet[actionName]['pagos'] = pagos;
        }



        if ( mesa.porcentajeDescuento() ) {
            var dto = mesa.totalCalculadoNeto() - mesa.totalCalculado()
            jsonRet[actionName]["addAdditional"] = {
                        "description": mesa.Cliente().Descuento().description(),
                        "amount": dto,
                        "iva": Risto.IVA_PORCENTAJE
                    };
        }

        jsonRet[actionName]["setTrailer"] = [
                    " ",
                    "MOZO: "+mesa.mozo().numero(),
                    "MESA: "+mesa.numero(),
                    " "
                ];


        jsonRet = JSON.stringify(jsonRet);
        fbrry.send( jsonRet );
        return jsonRet;
    }
    
}


PrinterDriver.init();