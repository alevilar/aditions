/*--------------------------------------------------------------------------------------------------- Risto.Adicion.mesa
 *
 *
 * Clase Mesa
 * 
 * para inicializarla es necesario pasarle el objeto Mozo
 * tambien se le puede pasar un jsonData para ser mappeado con knockout
 */
var Mesa = function(mozo, jsonData) {
        
        this.id             = ko.observable();
        this.created        = ko.observable();


        this.checkin        = ko.observable();


        /**
        *   Syn indica el estado de sincronizacion de los datos con el servidor
        *   -1 ERROR
        *    0 Sincronizando
        *   +1 Sync OK
        **/
        this.sync           = ko.observable(1); 
        this.syncError      = ko.observable(false);
        this.createTimeout  = null;
        this.savePagosTimeout  = null;


        this.checkout       = ko.observable();
        this.observation    = ko.observable('');


        this.momentRange    = ko.observable( );


       

        // Observables Dependientes
        this.momentRange = ko.dependentObservable( function(){
            return moment().range( Date.clearHour(this.checkin()), Date.clearHour(this.checkout()).subtract(1, 'day') );
        },this);

        this.diasEstadia = ko.dependentObservable( function(){
            var mm = moment(this.checkin());
            var m2 = moment(this.checkout());
            mm.set('hour',0).set('minute',0).set('second',0).set('millisecond',0);
            m2.set('hour',0).set('minute',0).set('second',0).set('millisecond',0);
            return Math.abs( mm.diff(m2, "days") );
        },this);
        this.diasEstadiaRecortado = ko.observable(0);


        this.total          = ko.observable( 0 );
        this.numero         = ko.observable( );
        this.menu           = ko.observable( 0 );
        this.mozo           = ko.observable( new Mozo() );
        this.currentComanda = ko.observable( new Risto.Adition.comandaFabrica() );
        this.Comanda        = ko.observableArray( [] );
        this.mozo_id        = this.mozo().id;
        this.Cliente        = ko.observable( null );
        this.estado         = ko.observable( MESA_ESTADOS_POSIBLES.abierta );
        this.estado_id      = ko.observable();
        this.time_cobro     = ko.observable();
        this.Pago           = ko.observableArray( [] );
        this.cant_comensales= ko.observable(0);
        
        
        return this.initialize(mozo, jsonData);
}



Mesa.prototype = {
    model       : 'Mesa',
    
    /**
     * es la fecha de apertura de la Mesa
     * @return string timestamp
     **/
    timeAbrio: function(){

        var checkin;
        if (typeof this.checkin == 'function'){
            checkin = this.checkin();
        } else {
            checkin = this.checkin;
        }
        if (!checkin) {
            d = new Date();
        } else {
            d = new Date( mysqlTimeStampToDate(this.checkin()) );       
        }

        var min =  (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        return d.getHours()+":"+min;    
    },

    /**
     *@constructor
     */
    initialize: function( mozo, jsonData ) {
        
        if ( typeof jsonData == 'undefined' ) return this;

        // mapea el objeto this usando ko.mapping
        this.__koMapp( jsonData, mozo);
        
        return this;
    },



    /**
     *  crea una nueva mesa guardandola en el server
     */
    create: function( ) {
        var self = this,
            retry = Risto.MESAS_RELOAD_INTERVAL; // 30 segundos para reconectar

        self.sync(0);
        var snd = {
            url: this.urlAdd(), 
            obj: this            
        };
        var ret = $cakeSaver.send(snd);

        ret.done(function(){
            self.sync(1);
        });

        ret.error(function( ev ) {
            self.sync(-1);

            self.createTimeout = setTimeout(function(){ 
                self.create();
            }, retry);


        });

        return ret;
    },
    
    /**
     *  Actualiza el estado de la mesa con el json pasado
     */
    update: function( mozo, jsonData ) {
        
        // mapea el objeto this usando ko.mapping
        return this.__koMapp( jsonData, mozo );
//        this.setEstadoById();  
    },

    
    
    __koMapp: function( jsonData, mozo ) {
        var jsonData = jsonData || {},
            mapOps          = {};
            mozo = mozo || null;
        // si vino jsonData mapeo con koMapp
        if ( jsonData != {} ) {
            if (jsonData.Cliente && jsonData.Cliente.id){
                this.Cliente( new Risto.Adition.cliente( jsonData.Cliente ) );
            } else {               
                this.Cliente( null );
            }
            delete jsonData.Cliente;
            
            // si aun no fue mappeado
            mapOps = {
              	'Pago': {
                    create: function(ops) {
                        return new Risto.Adition.pago(ops.data);
                    },
                    key: function(data) {
                        return ko.utils.unwrapObservable( data.id );
                    }
                },
                'Comanda': {
                    create: function(ops) {
                        return new Risto.Adition.comanda(ops.data);
                    },
                    key: function(data) {
                        return ko.utils.unwrapObservable( data.id );
                    },
                    'DetalleComanda': {
                        create: function(ops) {
                            return new Risto.Adition.detalleComanda(ops.data);
                        },
                        key: function(data) {
                            return ko.utils.unwrapObservable( data.id );
                        }
                    }
                }
            }
        }
        if ( mozo ) {
            // meto al mozo sin agregarle la mesa al listado porque seguramente vino en el json
            this.setMozo(mozo, false);
        }
        
        ko.mapping.fromJS(jsonData, mapOps, this);
        
        // meto el estado como Objeto Observable Estado
        this.__inicializar_estado( jsonData );

        
        
        return this;
    },
    
    /**
     * Inicializa el estado de la mesa en base al json pasada como parametro
     * o sea, convierte el id del estado que viene de la bbdd, a un objeto
     * "estado" que son los que estan en mesa.estados.class.js
     * @return MesaEstado
     */
    __inicializar_estado: function( jsonData ){
        var estado = MESA_ESTADOS_POSIBLES.abierta,
            ee = 0; // countador de estados posibles
         if (jsonData.estado_id) {
            for(ee in MESA_ESTADOS_POSIBLES){
                if ( MESA_ESTADOS_POSIBLES[ee].id && MESA_ESTADOS_POSIBLES[ee].id == jsonData.estado_id ){
                    estado = MESA_ESTADOS_POSIBLES[ee];
                    break;
                }
            }
         }
        this.setEstado( estado );
        return estado;
    },
    
    
    /**
     * agregar un producto a la comanda que actualmente se esta haciendo
     * no implica que se haya agregado un producto a la mesa.
     * es un estado intermedio de generacion de la comanda
     * @param prod Producto  
     **/
    agregarProducto: function(prod){
        this.currentComanda().agregarProducto(prod);
    },
    
    /**
     * Inicializa currentComanda para poder hacer una nueva comanda con
     * el objeto comandaFabrica
     * @constructor
     */
    nuevaComanda: function(){
        this.currentComanda( new Risto.Adition.comandaFabrica( this ) );
    },
    
    
    getData: function(){
        $.get(this.urlGetData());
    },
   

    /* listado de URLS de accion con la mesa */
    urlGetData: function() { return Risto.URL_DOMAIN + Risto.TENANT + '/mesa/mesas/ticket_view/'+this.id() },
    urlView: function() { return Risto.URL_DOMAIN + Risto.TENANT + '/mesa/mesas/view/'+this.id() },
    urlEdit: function() { return Risto.URL_DOMAIN + Risto.TENANT + '/mesas/ajax_edit/'+this.id() },
    urlAdd: function() { return Risto.URL_DOMAIN + Risto.TENANT + '/mesa/mesas/add.json' },
    urlFullEdit: function() { return Risto.URL_DOMAIN + Risto.TENANT + '/mesas/edit/'+this.id() },
    urlDelete: function() { return Risto.URL_DOMAIN + Risto.TENANT +'/mesa/mesas/delete/'+this.id() },
    urlComandaAdd: function() { return Risto.URL_DOMAIN + Risto.TENANT +'/mesa/comandas/add/'+this.id() },
    urlReimprimirTicket: function() { return Risto.URL_DOMAIN + Risto.TENANT +'/mesa/mesas/imprimirTicket/'+this.id() },
    urlCerrarMesa: function() { return Risto.URL_DOMAIN + Risto.TENANT +'/mesa/mesas/cerrarMesa/'+this.id() },
    urlReabrir: function() { return Risto.URL_DOMAIN + Risto.TENANT +'/mesa/mesas/reabrir/'+this.id() },
    urlAddCliente: function( clienteId ){
        var url = Risto.URL_DOMAIN + Risto.TENANT + '/mesa/mesas/addClienteToMesa/'+this.id();
        if (clienteId){
            url += '/'+clienteId;
        }
        url += '.json';
        return url;
    },        
    

    /**
     * Disparador de triggers para el evento
     *
     **/
    __triggerEventCambioDeEstado: function(){
        
        var event =  {};
        event.mesa = this;
        this.estado().event( event );
    },

    /**
     * dispara un evento de mesa seleccionada
     */
    seleccionar: function() {
        var event =  {};
        event.mesa = this;
        MESA_ESTADOS_POSIBLES.seleccionada.event( event );
    },
    
    
    /**
     * cambia el estado de la mesa y lo envia vía ajax. Para ser modificado 
     * en bbdd.
     * En caso de error en el ajax la mesa vuelve a su estado anterior.
     * 
     * dispara el evento de cambio de estado. en caso de error lo dispararia 2 veces
     */
    cambioDeEstadoAjax: function(estado){
        var estadoAnt = this.getEstado(),
            mesa = this,
            $ajax; // jQuery Ajax object
            
        this.setEstado( estado );
        if ( estado.url ) {
            $ajax = $.get( estado.url+'/'+this.id() );
            $ajax.error = function(){
                mesa.setEstado( estadoAnt );
            }
        }
    },

    /**
     * dispara un evento de mesa Abierta
     */
    setEstadoAbierta : function(){
        this.setEstado( MESA_ESTADOS_POSIBLES.abierta );
        return this;
    },
    
    /**
     * dispara un evento de mesa cobrada
     */
    setEstadoCobrada : function(){
        this.time_cobro( jsToMySqlTimestamp() );
        this.setEstado(MESA_ESTADOS_POSIBLES.cobrada);
        return this;
    },


    /**
     * dispara un evento de mesa cerrada
     */
    setEstadoCerrada : function(){
        this.time_cerro = jsToMySqlTimestamp();
        this.setEstado(MESA_ESTADOS_POSIBLES.cerrada);
        return this;
    },

    /**
     * dispara un evento de mesa borrada
     */
    setEstadoBorrada: function() {
        this.setEstado(MESA_ESTADOS_POSIBLES.borrada);
        return this;
    },

    /**
     * dispara un evento de mesa con cupon pendiente
     */
    setEstadoCuponPendiente : function(){        
        this.setEstado(MESA_ESTADOS_POSIBLES.cuponPendiente);
        return this;
    },
    
    /**
     * Cambia el estado de la mesa y genera un disparador del evento
     */
    setEstado: function(nuevoestado){
        this.estado( nuevoestado );
        this.__triggerEventCambioDeEstado();
    },
    
    /**
     * Cambia el estado de la mesa y genera un disparador del evento
     */
    setEstadoById: function(nuevoestado_id){
        var estado_id = nuevoestado_id || this.estado_id();
        
        for (var est in MESA_ESTADOS_POSIBLES) {
            if ( MESA_ESTADOS_POSIBLES[est].id == estado_id ) {
                this.setEstado(MESA_ESTADOS_POSIBLES[est]);
                return this.getEstado();
            }
        }
        return false;
    },

    /**
     * devuelve el estado actual de la mesa
     * @return MesaEstado
     */
    getEstado: function(){
        return this.estado();
    },
    
    
    /**
     * devuelve el string que identifica como nombre al estado
     * es el atributo del objeto estado llamado msg
     * el objeto de estado de la mesa es el de mesa.estados.class.js
     */
    getEstadoName: function(){
        if (this.estado()){
            return this.estado().msg;
        }
        return '';
    },
    
    
    /**
         *  dependentObservable
         *  
         *  devuelve el nombre del icono (jqm data-icon) que tiene el estado 
         *  en el que la mesa se encuentra actualmente
         *  el nombre del icono sirve para manejar cuestiones esteticas y es definido
         *  en "mesa.estados.class.js"
         *  
         *  @return string
         *
         */
     getEstadoIcon: function(){
            if (this.estado()){
                return this.estado().icon;
            }
            return MESA_ESTADOS_POSIBLES.abierta.icon;
            
        },
        
    

    /**
     * Me dice si la mesa pidio el cierre y esta pendiente de cobro
     * @return boolean true si ya cerro, false si esta abierta
     */
    estaAbierta : function(){

        return MESA_ESTADOS_POSIBLES.abierta == this.getEstado();
    },

    /**
     * @deprecated deberia usar estaCerrada
     * Me dice si la mesa pidio el cierre y esta pendiente de cobro
     * @return boolean true si ya cerro, false si esta abierta
     */
    pidioCierre : function(){
        return this.estaCerrada();
    },

    
    /**
     * modifica el ID del la mesa
     */
    setId : function(id){
        this.id = id;
    },


    /**
     *devuelve la cantidad de comensales o cubiertos seteado en la mesa
     *@return integer
     */        
    getCantComensales : function(){
        return this.cantComensales();
    },


    doCheckout: function () {        
        var url = Risto.URL_DOMAIN + Risto.TENANT + '/mesa/mesas/checkout';
        var id;
        if (typeof this.id == 'function') {
            id = this.id();
        } else {
            id = this.id;
        }
        $.get( url+"/"+id);
    },

    /**
     * Envia un ajax con la peticion de imprimir el ticket para esta mesa
     */
    reimprimir : function(){
        if (PrinterDriver.isConnected() ) {
        	PrinterDriver.printTicket( this );        
        }
        // imprimir usando ajax
        var url = this.urlReimprimirTicket();
        $.get(url);    

    },



    /**
     * re-abre una mesa
     *
     */
    reabrir : function(url){
        var data = {
                'data[Mesa][estado_id]': MESA_ESTADOS_POSIBLES.abierta.id,
                'data[Mesa][id]': this.id
        };

        $.post(url, data);
        this.setEstadoAbierta();
    },

    /**
     * Envia un ajax con la peticion de cerrar esta mesa
     */
    cerrar: function(){
        var url = Risto.URL_DOMAIN + Risto.TENANT + '/mesa/mesas/cerrarMesa' + '/' + this.currentMesa.id + '/0',
            self = this;
            
        $.get(url, {}, function(){
            self.setEstadoCerrada();
        });
        return this;
    },

    /**
     * Envia un ajax con la peticion de borrar esta mesa
     */
    borrar : function(){
        var url = Risto.URL_DOMAIN + Risto.TENANT + '/mesa/mesas/delete/' +this.id,
            self = this;
        if (this.id() ) {
            $.get(url, {}, function(){
               // se borro ok
            });
        }

        self.setEstadoBorrada();
        return this;
    },

    
    
    /**
     * Si tiene un mozo setteado retorna true, caso contrario false
     * Verifica con el id del mozo (si es CERO es que no tiene mozo)
     * @return Boolean
     */
    tieneMozo: function(){
        var tiene = false;
        if ( this.mozo() !== {} || this.mozo() !== null ) {
            tiene = this.mozo().id() ? true: false;
        }
        return tiene;
    },


    /**
     * Setea el mozo a la mesa.
     * si agregarMesa es true, se agrega la mesa al listado de mesas del mozo
     * @param nuevoMozo Mozo es el mozo que voy a setear
     * @param agregarMesa Boolean indica si agrego la mesa al listado de mesas que tiene el mozo, por default es true
     */
    setMozo: function(nuevoMozo, agregarMesa){
        var laAgrego = agregarMesa || true; // por default sera true
        
        // si la mesa que le quiero agregar, tenia otro mozo
        // lo debo sacar, eliminandole la mesa de su listado de mesas
        if ( this.tieneMozo() ){
            var mozoViejo = this.mozo();
            // si era el mismo mozo no hacer nada
            if (mozoViejo.id() == nuevoMozo.id()) {
                return 0;
            }
            mozoViejo.sacarMesa(this);
        }
        
        this.mozo_id( nuevoMozo.id() );
        this.mozo(nuevoMozo);
        if (laAgrego) {
            this.mozo().agregarMesa(this);
        }
        return this;
    },


    /**
     * Realiza una edicion rapida via Ajax del Model Mesa de Cakephp
     * o sea, desde aca se puede tcoar facilmente cualquier campo de la bbdd
     * siempre y cuando el parametro data respete la forma de los inputs de cake.
     * 
     * @param data Array los keys del array deben ser de la forma cake:
     *                      Ej: data['data[Mesa][cant_comensales]'] o data['data[Mesa][cliente_id]']
     *                      
     */
    editar: function(data) {
        if (!data['data[Mesa][id]']) {
            data['data[Mesa][id]'] = this.id();
        }
        $.post( Risto.URL_DOMAIN + Risto.TENANT + '/mesa/mesas/ajax_edit', data);
        return this;
    },
    
    
    /**
     * Es el callback que recibe la actualizacion de las mesas via json desde 
     * cakeSaver
     */
    handleAjaxSuccess: function(data, action, method) {
        if (data[this.model]) {
            ko.mapping.fromJS( data[this.model], {}, this );
        }
    },
    

    /**
    *   Setea un cliente basandose en la cariable globarl dataClientes
    *   instanciada en jqm_result para dar de alta rapidamente un clicnte JSON
    *   @param string clientStrNameId nombre de la clave del ID del cliente
    **/
    setDataCliente: function ( clientStrNameId ) {
        if ( dataClientes && dataClientes.hasOwnProperty(clientStrNameId) ) {
            return this.setCliente( new Risto.Adition.cliente( dataClientes[clientStrNameId]) );
        }
    },
    
    /**
     * Dado un objeto cliente se setea el mismo a la mesa
     * @param objCliente Object que debe tener como atributos al menos un id
     */
    setCliente: function( objCliente ){
        var ctx = this, 
            clienteId = null;

        if ( objCliente && typeof objCliente.id == 'function' ) {
            clienteId = objCliente.id();
        }
        if ( objCliente && ( typeof objCliente.id == 'number' || typeof objCliente.id == 'string') ){
            clienteId = objCliente.id;
        }
        ctx.Cliente( objCliente );

        $.get( this.urlAddCliente( clienteId ), function(data) {
            if ( !data.Cliente ){              
                ctx.Cliente(null);
            }
        });
        
        return this;
    },
    
    
    /**
     * A diferencia de los otros totales, este no esta bindeado con knocout por lo tanto da el total real en el momento 
     * que se llama a esta funcion
     */
    totalStatic: function(){
        var total = 0,
            c, // index de Comandas
            dc; // index del for DetalleComandas
            
        for (c in this.Comanda()){
            for (dc in this.Comanda()[c].DetalleComanda() ){
                total += parseFloat( this.Comanda()[c].DetalleComanda()[dc].precio() * this.Comanda()[c].DetalleComanda()[dc].realCant() );
            }
        }

        return Math.round( total*100)/100;
    },
    
    
    /**
     *Devuelve el total neto, sin aplicar descuentos
     *@return float
     */
    totalCalculadoNeto: function(){
        var precio = 0,
            valorPorCubierto =  Risto.VALOR_POR_CUBIERTO || 0,
            total = this.cant_comensales() * valorPorCubierto,
            c = 0;
        for (c in this.Comanda()){
            for (dc in this.Comanda()[c].DetalleComanda() ){
                precio = this.Comanda()[c].DetalleComanda()[dc].precio();
                total = parseFloat(total) + parseFloat( precio * this.Comanda()[c].DetalleComanda()[dc].realCant() );
            }
        }

        return ristoRound(total);
    },
        
        
        /**
         *
         *  Depende del cliente.
         *  es un atajo al porcentaje de descuento que tiene el cliente
         */
       porcentajeDescuento : function(){
            var porcentaje = 0;
            if (this.Cliente() && !this.Cliente().hasOwnProperty('length') &&  this.Cliente().Descuento && this.Cliente().Descuento()){
                if ( this.Cliente().Descuento() && typeof this.Cliente().Descuento().porcentaje == 'function') {
                    porcentaje = parseFloat( this.Cliente().Descuento().porcentaje() );
                }
            }
            return porcentaje;
        },
        
        /**
         *Devuelve el total aplicandole los descuentos
         *@return float
         */
        totalCalculado : function(){
            var total = parseFloat( this.total() );
            if ( !this.porcentajeDescuento() ) {
                return total;
            }
            
            total = this.totalCalculadoNeto();
            
            var dto = 0;
            dto = total * this.porcentajeDescuento() / 100;
            total = ristoRound( total - dto );
            return ( total );
        },
        
        
        /**
         *Devuelve el total mostrando un texto
         *@return String
         */
        textoTotalCalculado : function(){
            var total = this.totalCalculadoNeto(), 
                dto = 0, 
                totalText = '$'+total ;
            
            if ( this.porcentajeDescuento() ) {
                dto = ristoRound( total * this.porcentajeDescuento() / 100 );
                totalText = totalText+' - [Dto '+this.porcentajeDescuento()+'%] $'+dto+' = $'+ this.totalCalculado();
            }
            
            return totalText;
        },
        
        
        
        
         /**
         * dependentObservable
         * 
         * Chequea si la mesa esta con el estado: cerrada. (por lo general, lo que interesa
         * es saber que si no esta cerrada es porque esta abierta :-)
         * @return boolean
         **/
        estaCerrada : function(){
            return MESA_ESTADOS_POSIBLES.cerrada == this.estado();
        },
        
        
        clienteTipoFacturaText: function(){
            var texto = Risto.DEFAULT_TIPOFACTURA_NAME;
            if ( this.Cliente() && typeof this.Cliente().getTipoFactura == 'function' ) {
                texto = this.Cliente().getTipoFactura();
            }
            return texto;
        },
        
        
        clienteDescuentoText: function(){
            var texto = '';
            if ( this.Cliente() &&  this.Cliente().tieneDescuento && this.Cliente().tieneDescuento() != undefined ) {
                texto = this.Cliente().getDescuentoText();
            }
            return texto;
        },


        clienteDomicilio: function(){
            var texto = "";
            if ( this.Cliente() && typeof this.Cliente().domicilio == 'function' ) {
                texto = this.Cliente().domicilio();
            }
            return texto;
        },

        clienteTelefono: function(){
            var texto = "";
            if ( this.Cliente() && typeof this.Cliente().telefono == 'function' ) {
                texto = this.Cliente().telefono();
            }
            return texto;
        },
        
        
        /**
         * dependentObservable
         * 
         * Devuelve el nombre del Cliente si es que hay alguno setteado
         * en caso de no haber cliente, devuelve el string vacio ''
         *
         *@return string
         */
        clienteNameData : function() {
            var nombre = '';
            if ( this.hasOwnProperty('Cliente') && this.Cliente() ){
                var cliente = this.Cliente();
                if ( typeof cliente.nombre == 'function' ) {
                    nombre = cliente.nombre();
                } else {
                    nombre = cliente.nombre;
                }
            }
            return nombre;
        },
        
        
        
        /**
         * Devuelve un texto con la hora
         * si la mesa esta cerrada, dice "Cerró: 14:35"
         * si esta aberta dice: "Abrió 13:22"
         */
        textoHora : function() {
            var date, txt;
            if ( this.getEstado() == MESA_ESTADOS_POSIBLES.cerrada ) {
                txt = 'Cerró a las ';
                if (typeof this.time_cerro == 'function') {
                    date =  mysqlTimeStampToDate(this.time_cerro());
                }
            } else {
                txt = 'Abrió a las ';
                if (typeof this.checkin == 'function') {
                    date = mysqlTimeStampToDate(this.checkin());            
                }
            }
            if ( !date ) {
                date = new Date();
            }
            return txt + date.getHours() + ':' + date.getMinutes() + 'hs';
        },





	    /**
	     * El vuelto a devolver pero ingresando un texto
	     * Ej: Vuelto: $35
	     * @return String
	     */
	    vueltoText : function () {
	       var pagos = this.Pago(),
	           sumPagos = 0,
	           totMesa = Risto.Adition.adicionar.currentMesa().totalCalculado(),
	           vuelto = 0,
	           retText = 'Total: '+Risto.Adition.adicionar.currentMesa().textoTotalCalculado();
	       if (pagos && pagos.length) {
	           for (var p in pagos) {
	               if ( pagos[p].valor() ) {
	                sumPagos += parseFloat(pagos[p].valor());
	               }
	           }
	           vuelto = ristoRound(totMesa - sumPagos);
	           if (vuelto <= 0 ){
	               retText = retText+'   -  Vuelto: $  '+Math.abs(vuelto);
	           } else {
	               retText = retText+'   -  ¡¡¡¡ Faltan: $  '+vuelto+' !!!';
	           }
	       }
	       return retText;
	    },


	totalPagos: function () {
		var pagos = this.Pago(),
           sumPagos = 0;

       if (pagos && pagos.length) {
           for (var p in pagos) {
               if ( pagos[p].valor() ) {
                sumPagos += parseFloat(pagos[p].valor());
               }
           }          
       }
       return sumPagos;
	},


    /**
     *  Toma los valores ingresados en los pagos y calcula el vuelto a devolver
     *  @return Float
     */
    vuelto : function () {
       var pagos = this.totalPagos(),
           totMesa = Risto.Adition.adicionar.currentMesa().totalCalculado();
       
        return ristoRound( pagos - totMesa );
    },



    /**
    *   Devuelve un listado de los productos de cada comanda
    *   con el detalle de los sabores y el precio sumado del producto al de los sabores.
    *
    **/
    listadoProductos: function() {
        productos = [];
        for (var c in this.Comanda()){
            var prodList = this.Comanda()[c].productsJSONListing();
            productos = productos.concat(prodList);
        }
        return productos;
    },



    savePagos: function () {
    	var m = this;

        m.sync(0);

        // guardo los pagos
        var ret = $cakeSaver.send({
            url: Risto.URL_DOMAIN + Risto.TENANT + '/mesa/pagos/add',
            obj: m
        });

        ret.done(function(){
            m.sync(1);

            if ( m.Pago().length == 1 && !m.Pago()[0].valor() ) {
                // es porque la mesa esta cobrada
                m.setEstadoCobrada();
            }


            if ( m.totalPagos() && m.vuelto() >= 0) {
            	// es porque la mesa esta cobrada
            	m.setEstadoCobrada();
            }

        });

        ret.error(function(){
            m.sync(-1);

            m.savePagosTimeout = setTimeout(function(){
                m.savePagos();
            }, Risto.MESAS_RELOAD_INTERVAL)

        });

    }



};
