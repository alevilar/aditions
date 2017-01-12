    /**
 *
 *  Este objeto maneja las mesas recibidas con el json mozos/mesas_abiertas.json
 *  
 *  Cada uno de los keys, son las claves recibidas en el json que viene de esas mesas recibidas
 *
 */
Risto.Adition.handleMesasRecibidas = {
         /**
         * 
         * Recibiendo un json con el listado de mozos, que a su vez 
         * cada uno tiene el listado de mesas abiertas de c/u, actualiza 
         * el listado de mesas de la adicion
         * 
         */
        created: function ( data ) {

            if (!data.mozos) return -1;

            if ( this.mesas().length ) {
                // si ya hay mesas entonces meto las mesas nuevas de forma indidual
                var mozo;
                
                for ( var z in data.mozos ) {
                    mozo = this.findMozoById(  data.mozos[z].id );
                    for ( var m in data.mozos[z].mesas ) {
                        // si no esta en el listado de mesas, la agrego
                        if ( !this.findMesaById( data.mozos[z].mesas[m].id ) ) {
                            new Mesa(mozo, data.mozos[z].mesas[m] );
                        }
                    }
                }
            } else {
                // si no habia mesas, entonces debo hacer todo el proceso de creacion con el mapping
                var mapOps = {
                    'mozos': {
                        create: function(ops) {
                            return new Mozo(ops.data);
                        },
                        key: function(data) {
                            return ko.utils.unwrapObservable(data.id);
                        }
                    }
                }
            
                ko.mapping.fromJS( data, mapOps, Risto.Adition.adicionar );
            }

            Risto.Adition.EventHandler.adicionMesasActualizadas();
        },
        
        
        /**
         * 
         * Recibiendo un json con el listado de mozos, que a su vez 
         * cada uno tiene el listado de mesas abiertas de c/u, actualiza 
         * el listado de mesas de la adicion
         * 
         */
        modified: function ( data ) {
            if (!data.mozos) return -1;
            var mesaEncontrada, 
                mozo;
            for(var z in data.mozos){
                mozo = Risto.Adition.adicionar.findMozoById( data.mozos[z].id );
                for( var m in data.mozos[z].mesas ) {
                    mesaEncontrada = Risto.Adition.adicionar.findMesaById( data.mozos[z].mesas[m].id );
                    if ( mesaEncontrada ) {
                        mesaEncontrada.update( mozo, data.mozos[z].mesas[m] );
                    } else {
                        new Mesa(mozo, data.mozos[z].mesas[m] );
                    }
                }
            }
            Risto.Adition.EventHandler.adicionMesasActualizadas();
            return 1;
        },
        
        
        /**
         * 
         * Recibiendo las mesas cobradas las manejo 
         * 
         */
        cobradas: function ( data ) {
            if (!data.mozos) return -1;
            var mesaEncontrada, 
                z; // contador index de mozos
                       
            for (z in data.mozos) {
                for( var m in data.mozos[z].mesas ) {
                    mesaEncontrada = Risto.Adition.adicionar.findMesaById( data.mozos[z].mesas[m].id );
                    
                    if ( mesaEncontrada ) {  
//                        ko.mapping.fromJS( data.mozos[z].mesas[m], {}, mesaEncontrada );
                        mesaEncontrada.mozo().sacarMesa( mesaEncontrada );
                    }
                }
            }
            // reinicializar vistas
            $raeh.adicionMesasActualizadas();
            return 1;
        },



         /**
         * 
         * Recibiendo las mesas borradas
         * 
         */
        borradas: function ( data ) {
            if (!data.mozos) return -1;
            var mesaEncontrada, 
                z; // contador index de mozos
                       
            for (z in data.mozos) {
                for( var m in data.mozos[z].mesas ) {
                    mesaEncontrada = Risto.Adition.adicionar.findMesaById( data.mozos[z].mesas[m].id );
                    
                    if ( mesaEncontrada ) {  
//                        ko.mapping.fromJS( data.mozos[z].mesas[m], {}, mesaEncontrada );
                        mesaEncontrada.mozo().sacarMesa( mesaEncontrada );
                    }
                }
            }
            // reinicializar vistas
            $raeh.adicionMesasActualizadas();
            return 1;
        },

        
        
        /**
         * 
         * Manejo de las mesas eliminadas
         * 
         */
        deleted: Risto.Adition.handleMesasRecibidas
        
    },
    
    
    

/*-------------------------------------------------------- Risto.Adicion.adicion
 *
 *
 * Clase Adicion
 * ees el Kernel de la aplicacion
 * se lo suele encontrar muchas veces como objeto adicionar o adn() para simplicar
 */

Risto.Adition.adicionar = {

    // Mozo Actualmente Activo
    currentMozo: ko.observable( new Mozo() ),
    
    // Mesa Actualmente activa
    currentMesa: ko.observable( new Mesa() ),
    
    // listado de mozos
    mozos: ko.observableArray( [] ),
     // orden del listado de mozos: Se puede poner cualquier valor que venga como atributo (campos de la bbdd de la tabla mozos)
    mozosOrder: ko.observable('numero'),
    
    mesas: ko.observableArray( [] ),
    
    // microtime de la ultima actualizacion de las mesas
    mesasLastUpdatedTime : ko.observable( 0 ),
    

    // listado de clientes que generalmente son buscador y cargados mediajnte ajax
    clientes: ko.observableArray( [] ),
    

    /**
     *  Inicializacion para cargar una nueva comanda, es el que activa las variables
     *  creando un nuevo objeto mediante la Fabrica de Comandas. ComandaFabrica
     */
    nuevaComandaParaCurrentMesa: function () {
        this.currentMesa().nuevaComanda();
        return this;
    },
    
    
    /**
     *  Referencia al objeto Menu para que pueda ser utilizado como un Modelo de Knoclkout.js
     *  desde este objeto de adicion.
     */
    menu: function () {
        return Risto.Adition.koAdicionModel.menu.apply(Risto.Adition.koAdicionModel, arguments);
    },
    

    /**
     * Constructor
     * @param mesas json de mesas abiertas por crear
     */
    initialize: function ( mesas ) {



        // inicializacion de las mesas
        Risto.Adition.handleMesasRecibidas.created.call( Risto.Adition.adicionar, mesas );


        Risto.Adition.tenantIo = io(URL_DOMAIN.slice(0,-1)+":8085");


        Risto.Adition.tenantIo.on('connect', function(){
            Risto.Adition.tenantIo.emit('join', TENANT);
        });


        Risto.Adition.tenantIo.on('mesa:add', alAgregarMesa);
        Risto.Adition.tenantIo.on('mesa:edit', alEditarMesa);
        Risto.Adition.tenantIo.on('mesa:delete', alBorrarMesa);
        Risto.Adition.tenantIo.on("reconnect", reconectarYPedirDataActualizada);


        function updateMesa(data) {
            var mozo = Risto.Adition.adicionar.findMozoById( data.Mozo.id );

            var mesaEncontrada = Risto.Adition.adicionar.findMesaById( data.id );
            if ( mesaEncontrada ) {
                mesaEncontrada.update( mozo, data );
            } else {
                new Mesa(mozo, data );
            }
        }


        function alAgregarMesa( data ) {
            if ( Risto.Adition.tenantIoNuevaMesaPendiente ) {
                var mozo = Risto.Adition.adicionar.findMozoById( data.Mozo.id );
                Risto.Adition.tenantIoNuevaMesaPendiente.update( mozo, data );
            } else {
                updateMesa(data);
            }
            $raeh.adicionMesasActualizadas();
        }

        function alEditarMesa( data ) {
            updateMesa(data);
            $raeh.adicionMesasActualizadas();
        }

        function alBorrarMesa( data ) {
            var mesaEncontrada = Risto.Adition.adicionar.findMesaById( data.id );
                    
            if ( mesaEncontrada ) {  
                mesaEncontrada.mozo().sacarMesa( mesaEncontrada );
            }
            // reinicializar vistas
            $raeh.adicionMesasActualizadas();

        }


        function reconectarYPedirDataActualizada() {
        /**
         *  Esta funcion es la que ejecuta el ajax que va a devolver las mesas
         */
            var url = URL_DOMAIN + TENANT + "/";
            
            // traer todas
            url = url + 'mesa/mozos/mesas_abiertas.json';
            
            

            function purgarMesasRistorantinoQueNoEstanEnJSON( nuevasMesas ){
                function mesaEncontrada (mesa) {
                    var mesasristo = Risto.Adition.adicionar.mesas();
                    for (var j = 0; j < mesasristo.length; j++) {
                        if ( mesasristo[j].id() == mesa.id ) {
                            return mesasristo[j];
                        }
                    }
                    return false;
                }

                // por cada mesa del JSON, la busco en el listado de mesas de ristorantino adition
                for (var i = 0; i < nuevasMesas.length; i++ ) {

                    var mesa = nuevasMesas[i];
                    var mesaRisto = mesaEncontrada(mesa);
                    if ( !mesaEncontrada(mesa, nuevasMesas) ) {
                        console.info("se quito porque no esta en Adicion");
                        mesaRisto.mozo().sacarMesa( mesaRisto );
                    }
                }
            }

            $.ajax(url, {
                success: function( data ) {
                    if ( data && data.mesas && data.mesas.created ) {
                        Risto.Adition.handleMesasRecibidas.modified.call( Risto.Adition.adicionar, data.mesas.created );

                        purgarMesasRistorantinoQueNoEstanEnJSON( data.mesas.created );
                    }
                },
                error: function () {
                    console.error("error al actualizar mesas en AJAX");
                }
            });
                
        }


        
     
        
    },    
    
    
    /**
     * Busca una mesa por su ID en el listado de mesas
     * devuelve la mesa en caso de encontrarla.
     * caso contrario devuelve false
     * @param id Integer id de la mesa a buscar
     * @return Mesa en caso de encontrarla, false caso contrario
     */
    findMesaById: function(id){
        var m = 0;
        for (m in this.mesas()) {
            if ( this.mesas()[m].id() == id ) {
                return this.mesas()[m];
            }
        }
        return false;
    },
    
    
    /**
     * Busca un mozo por su ID en el listado de mozos
     * devuelve al objeto Mozo en caso de encontrarlo.
     * caso contrario devuelve false
     * @param id Integer id del Mozo a buscar
     * @return Mozo en caso de encontrarlo, false caso contrario
     */
    findMozoById: function ( id ) {
        var m;
        for (m in this.mozos()) {
            if ( this.mozos()[m].id() == id ) {
                return this.mozos()[m];
            }            
        }
        return false;
    },
    

    /**
     * Setter de la currentMesa
     * @param mesa Mesa or Number . Le puedo pasar una Mesa o un Id de la mesa, da lo mismo.
     * @return Mesa o false en caso de que el ID pasado no exista
     */
    setCurrentMesa: function ( mesa ) {
        if ( typeof mesa == 'number') { // en caso que le paso un ID en lugar del objeto mesa
            mesa = this.findMesaById(mesa);           
        }
        this.currentMesa( mesa );
        if (mesa.mozo) {
            this.setCurrentMozo(mesa.mozo());
        }
        return this.currentMesa();
    },
		
                

    /**
     *  Vista rápida de ticket
     *  @param {DOM Element} elementToUpdate
     *  @return {jQUery} DOM element
     */
    ticketView: function ( elementToUpdate ) {
        var elem = elementToUpdate || document.createElement('div');
        var url = window.URL_DOMAIN + TENANT + '/mesa/mesas/ticket_view' + '/'+this.currentMesa.id ;
        return $(elem).load(url);
    },

    
    /**
     *  Tira un prompt para settear un numero 
     *  y actualizando el valor en la current mesa
     *
     */
    agregarMenu: function(){
        var menu = prompt('Ingrese Cantidad que aparecerá en el detalle del ticket', this.currentMesa().menu());
        var ops = {
                'data[Mesa][menu]': menu
            };
        this.currentMesa().menu( menu );
        this.currentMesa().editar(ops);
    },
    
    /**
     *  Tira un prompt para settear la cantidad de cubiertos
     */
    agregarCantCubiertos: function(){
        var menu = prompt('Ingrese la cantidad', this.currentMesa().cant_comensales());
        menu = parseInt(menu);
        
        if ( menu && typeof menu == 'number' && menu > 0) {
             var ops = {
                'data[Mesa][cant_comensales]': menu
            };
            
            this.currentMesa().cant_comensales( menu );
            this.currentMesa().editar(ops);
        }        
    },


    /**
     *  Tira un prompt para settear la cantidad de cubiertos
     */
    guardarObservacionMesa: function(){
        var obs = this.currentMesa().observation();
        if ( obs ) {
             var data = {
                'data[Mesa][observation]': obs
            };
            
            this.currentMesa().editar(data);
        }        
    },


     /**
     *  Modifica el mozo atual por el que se le pasa como parametro
     *  Dispara el evento "adicionCambioMozo"
     * @param Mozo mozo
     */
    setCurrentMozo: function(mozo){
        this.currentMozo( mozo );
        var event = {};
        event.mozo = mozo;
        $raeh.trigger('adicionCambioMozo',event);
        
    },
    
    ordenarMesasPorNumero: function(){
        return this.mesas().sort(function(left, right) {
            return left.numero() == right.numero() ? 0 : (parseInt(left.numero()) < parseInt(right.numero()) ? -1 : 1) 
        })
    },
    
    
    /**
     *  Pasado un JSON con los datos y atributos de una mesa, lo convierte
     *  en un objeto Mesa
     *  @param Mesa mesaJSON
     *  @return Mesa
     */
    crearNuevaMesa: function( mesaJSON ){
        var mozo = this.findMozoById(mesaJSON.mozo_id),
            mesa = new Mesa(mozo, mesaJSON);
        return mesa;
    },
    
    
    /**
     *  Devueve todas las mesas qu ehay en el sistema
     *  Concatena las mesas que tiene cada mozo
     *  @return Array
     */
    todasLasMesas : function () {
        var mesasList = [];
        if ( this.mozos ) {
            for ( var m in this.mozos() ) {
                mesasList = mesasList.concat( this.mozos()[m].mesas() );
            }
        }
        return mesasList;
    },
    
    

    /**
     * Variable de estado generada cuando se esta armando una comanda
     * son los productos seleccionados.
     * Retorna todos lso productos seleccionados para el armado de una DetalleComanda
     * @return Array
     */
    productosSeleccionados : function () {
        if ( this.currentMesa() && this.currentMesa().currentComanda() && this.currentMesa().currentComanda().comanda && this.currentMesa().currentComanda().comanda.DetalleComanda()) {
            return this.currentMesa().currentComanda().comanda.DetalleComanda();    
        } else {
            return [];
        }
    },


    /**
     * Variable de estado generada cuando se esta armando una comanda
     * son los sabores de un producto seleccionado
     * Retorna el listado de sabores seleccionados
     * @Return Array
     */
    currentSabores : function(){
        if ( this.currentMesa() && this.currentMesa().currentComanda() && this.currentMesa().currentComanda().currentSabores() ) {
            return this.currentMesa().currentComanda().currentSabores();    
        }
    },



    /**
    *
    *   Se encarga de agregar el cliente clickeada a la mesa actual
    *
    **/
    setClienteACurrentMesa : function ( cliente ) {
        return Risto.Adition.adicionar.currentMesa().setCliente( cliente );
    }





};


// listado de mesas, depende de las mesas de cada mozo, y el orden que le haya indicado
Risto.Adition.adicionar.mesas = ko.dependentObservable( function(){
                var mesasList = [];
                var order = this.mozosOrder();

                mesasList = this.todasLasMesas();
                
                if ( order ) {
                    mesasList.sort(function(left, right) {
                        return left[order]() == right[order]() ? 0 : (parseInt(left[order]()) < parseInt(right[order]()) ? -1 : 1) 
                    })
                }
                return mesasList;

}, Risto.Adition.adicionar);


    
Risto.Adition.adicionar.mesasCerradas = ko.dependentObservable(function(){
    var mesas = [];
    for ( var m in this.mesas() ) {
        if ( !this.mesas()[m].estaAbierta() ) {
            mesas.push( this.mesas()[m]);
        }
    }
    var order = 'time_cerro';
    if ( order ) {
        mesas.sort(function(left, right) {
            if (left[order] && typeof left[order] == 'function' && right[order] && typeof right[order] == 'function') {
                return left[order]() == right[order]() ? 0 : (parseInt(left[order]()) < parseInt(right[order]()) ? 1 : -1) 
            }
        })
    }
                
    return mesas;

}, Risto.Adition.adicionar);