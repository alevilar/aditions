


if (typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    var fiscalberryHost = localStorage.getItem("fiscalberryHost");
    if ( !fiscalberryHost ) {
    	fiscalberryHost = FISCALBERRYHOST;
    	localStorage.setItem("fiscalberryHost", fiscalberryHost);
    }
} else {
    // Sorry! No Web Storage support..
    var fiscalberryHost = FISCALBERRYHOST;
}


var maxRetry = 8;
var reconectandoTimeoput;        


setInterval(function(){ 
    maxRetry = 8;            
}, 60000 );


PrinterDriver = {
    version: 20160904,

    $printerDriverContainer: null, // 

    fbrry:null,
    
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

            if ( PrinterDriver.fbrry.isConnected() ) {
                $(".icon", PrinterDriver.$printerDriverContainer).css('background', 'green');
            } else {
                $(".icon", PrinterDriver.$printerDriverContainer).css('background', 'red');
            }
            PrinterDriver.$printerDriverContainer.appendTo( $("#listado-mesas") );

            // al conectar poner en verde
            PrinterDriver.fbrry.bind('open', function(){
                $(".icon", PrinterDriver.$printerDriverContainer).css('background', 'green');
            });

            // al desconectar poner en rojo nuevDataamente
            PrinterDriver.fbrry.bind('close', function(){
                $(".icon", PrinterDriver.$printerDriverContainer).css('background', 'red');
            });

            PrinterDriver.fbrry.bind('fb:msg', function( ev, evData ){
                var msg = '';
                if ( evData && evData.data !== null && typeof evData.data == 'object' ) {
                    for (printer in evData.data) {
                        for (var i = 0; i < evData.data[printer].length; i++ ){
                            msg += "<li>("+printer+") "+evData.data[printer][i]+"</li>";
                        }
                    }
                }
                $(".printer-driver-msg", PrinterDriver.$printerDriverContainer).html(msg);
            });
        });
    },

    /* Inicializa valores en el localstorage */
    init: function () {
        PrinterDriver.__initFbrry();
        PrinterDriver._setUI();

         

        var printerLocalVersion = JSON.parse( localStorage.getItem("PrinterDriver.version") );
        var newVersion = false;
        if ( printerLocalVersion != PrinterDriver.version ) {
            localStorage.setItem("PrinterDriver.version", PrinterDriver.version );
            newVersion = true;
        }

        var mapTipoFactura = JSON.parse( localStorage.getItem("mapTipoFactura") );
        if ( !mapTipoFactura || newVersion) {
            /* MAP con tabla tipo_facturas */
            mapTipoFactura = {
                 1: "FA",
                 2: "T",
                 5: "FC",
                 8: "NCB",
                 9: "NCC",
                10: "NCA",
                11: "NDB",
                12: "NDC",
                13: "NDA"
            };
            localStorage.setItem("mapTipoFactura", JSON.stringify(mapTipoFactura));
        }



        // map con tabla iva_responsabilidades
        var mapResponsabilidad = JSON.parse( localStorage.getItem("mapResponsabilidad"));
        if ( !mapResponsabilidad || newVersion ) {
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
        if ( !mapTipodoc || newVersion ) {
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

    reconnect: function(){
        
        if (  maxRetry && !reconectandoTimeoput ) {
            reconectandoTimeoput = setInterval(function(){ 
                maxRetry--;
                if (  maxRetry ) {
                    PrinterDriver.fbrry = new Fiscalberry(fiscalberryHost);
                    PrinterDriver.__bindEvents( PrinterDriver.fbrry, reconectandoTimeoput );
                }
             }, parseInt(1000*maxRetry/2));
        }
    },

    __bindEvents: function( fbrry, reconectandoTimeoput ){

        fbrry.promise.done(function(){
            // console.info("me conecte con el fiscalberry");
            $("#printer-driver-container").show();
            fbrry.bind('close', function(){
                // si se conecto al menos una vez
                // al desconectarse intentar reconectar
                // esto sirve porque si yo no me conecte nunca
                // entonces para que quiero reconectar?
                // si no me conecte nunca, probablemente
                // no tenga el fiscaberry activo
                PrinterDriver.reconnect();
            });
        });


        fbrry.promise.fail(function(){
            console.error("no se pudo conectar con el fiscalberry");
            $(function(){
                $("#printer-driver-container").hide();
            });
        });

        fbrry.bind('close', function(){
            $(".icon", PrinterDriver.$printerDriverContainer).css('background', 'red');
        });

        fbrry.bind('open', function(){
            if ( reconectandoTimeoput ) {
                clearInterval(reconectandoTimeoput);
                reconectandoTimeoput = null;
            }
        });
    },

    __initFbrry: function() {
        PrinterDriver.fbrry = new Fiscalberry(fiscalberryHost);
        PrinterDriver.__bindEvents(PrinterDriver.fbrry);
    },

    isConnected: function(){
        return PrinterDriver.fbrry.isConnected();
    },


    __doPrintComanda: function( mesa, comanda, printerName ) {
        var actionname = "printComanda";

        var jsonRet = {
            "printerName": printerName,
        };

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


        function prodList ( productos ) {

            var itemsList = [];
            var ptoAux = {};
            for (var i = 0; i < productos .length; i++ ) {
                dc = productos [i];
                ptoAux = {
                    "cant": dc.realCant(),
                    "nombre": dc.nameConSabores()
                };

                if ( dc.observacion() ) {
                    ptoAux['observacion'] = dc.observacion();
                }
                if ( ptoAux.cant != 0 ) {
                    itemsList.push( ptoAux ); 
                }
            }
            return itemsList;
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
        return  PrinterDriver.fbrry.send( jsonRet );
    },

    printComanda: function( mesa, comanda, printerName ) {

        var comanderasInvolucradas = [];
        var printId, prod;
        for( var i=0;i<comanda.DetalleComanda().length; i++) {
            prod = comanda.DetalleComanda()[i].Producto();
            if ( typeof prod.printer_id === 'function') {
                printId = prod.printer_id();
            } else {
                printId = prod.printer_id;
            }
            printId = Risto.getPrinterId(printId);
            if (printId) {
                if ( comanderasInvolucradas.indexOf(printId) === -1 ) {
                    // si no estaba la agrego
                    comanderasInvolucradas.push(printId);
                }
            }
        }
        for(var i=0; i<comanderasInvolucradas.length;i++) {
            var printerName = comanderasInvolucradas[i].Printer.alias;
            PrinterDriver.__doPrintComanda(mesa, comanda, printerName);
        }
        
    },


    printRemito: function( mesa ) {
        if ( Risto.printerComanderaPPal ) {
            var ret = PrinterDriver.__printGenericTicket(mesa, "printRemito", Risto.printerComanderaPPal.Printer.alias )
            return ret;
        } else {
            $.error("no hay impresora de comandas configurada");
        }
    },


    printTicket: function( mesa ) {
        if ( Risto.printerFiscal.Printer.alias) {

            var ret = PrinterDriver.__printGenericTicket(mesa, "printTicket", Risto.printerFiscal.Printer.alias);
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
            return  PrinterDriver.fbrry.send( jsonRet );
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


            if ( mesa.Cliente() &&  mesa.Cliente().IvaResponsabilidad() ) {
                var tipo_factura_id = mesa.Cliente().IvaResponsabilidad().tipo_factura_id();
                var mapTipoFactura = JSON.parse( localStorage.getItem("mapTipoFactura") );
                jsonRet["tipo_cbte"] = mapTipoFactura[tipo_factura_id];
            }

            if ( mesa.tipo_factura_id ) {
                var tipo_factura_id = mesa.tipo_factura_id ;
                var mapTipoFactura = JSON.parse( localStorage.getItem("mapTipoFactura") );
                jsonRet["tipo_cbte"] = mapTipoFactura[tipo_factura_id];
            }

            if ( mesa.Cliente() &&  mesa.Cliente().nrodocumento() ) {
                
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


            if ( mesa.referencia ) {
                // setteo numero de comprobante original para Nota de Credito
                jsonRet["referencia"] = mesa.referencia;
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

            var menu = parseInt( mesa.menu() );
            if ( menu == 0 ) {
                var prods = mesa.listadoProductos();
            } else {
                // en caso que no se quiera imprimir el detalle
                // de los platos
                var menuName = window.prompt("Ingresar descripción del Ìtem para los '"+menu+" Menú'\nEj: Menu, Cena, ALmuerzo, Comida, Evento, etc.");
                if ( !menuName ) {
                    return false;
                }
                var totalCalculado = mesa.totalCalculado();
                totalCalculado = totalCalculado / menu;
                totalCalculado = ristoRound(totalCalculado);
                var prods = [
                    {
                        "precio": totalCalculado,
                        "name": menuName,
                        "qty": menu
                    }
                ];
            }

            // Risto.IVA_PORCENTAJE
            for (var i = 0; i < prods.length; i++) {
                if ( prods[i]["qty"] != 0 ) {
                    jsonRet.push({
                        "alic_iva": Risto.IVA_PORCENTAJE,
                        "importe": prods[i]["precio"],
                        "ds": prods[i]["name"],
                        "qty": prods[i]["qty"]
                    });
                }
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

        if ( items === false ) {
            return;
        }

        if (typeof printerName == 'undefined') {
            jsonRet = {};
        } else {
            jsonRet = {"printerName": printerName};
        }
        jsonRet[actionName] = {            
            "encabezado": encabezado,
            "items": items
        };

        if ( encabezado.tipo_cbte != 'NCA' && encabezado.tipo_cbte != 'NCB' && encabezado.tipo_cbte != 'NCC'){
            // agregar descripcion de pagos si es que los hay
            var pagos = generarPagos( mesa );
            if ( pagos.length ) {
                jsonRet[actionName]['pagos'] = pagos;
            }
        }



        if ( mesa.porcentajeDescuento() ) {
            var dto = mesa.totalCalculadoNeto() - mesa.totalCalculado();
            // indica si es un descuento (false) o es un recargo (true)
            var descuento=false; // por defecto es un recargo
            if (dto > 0){
                descuento = true;
            }
            jsonRet[actionName]["addAdditional"] = {
                        "description": mesa.Cliente().Descuento().description(),
                        "amount": ristoRound( dto ),
                        "iva": Risto.IVA_PORCENTAJE,
                        "negative": descuento
                    };
        }


        if ( encabezado.tipo_cbte != 'NCA' && encabezado.tipo_cbte != 'NCB' && encabezado.tipo_cbte != 'NCC'){
            jsonRet[actionName]["setTrailer"] = [
                        " ",
                        "MOZO: "+mesa.mozo().numero(),
                        "MESA: "+mesa.numero(),
                        " "
                    ];
        }

console.info("el json ara imprimir es %o", jsonRet);


        jsonRet = JSON.stringify(jsonRet);
        PrinterDriver.fbrry.send( jsonRet );
        return jsonRet;
    }
    
}


PrinterDriver.init();