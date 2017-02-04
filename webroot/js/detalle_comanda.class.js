/*--------------------------------------------------------------------------------------------------- Risto.Adicion.detalleComanda
 *
 *
 * Clase DetalleComanda
 */


Risto.Adition.detalleComanda = function(jsonData) {
    this.initialize(jsonData);
    
    this.printer_id = ko.dependentObservable( function(){
        var prod = this.Producto();
        if ( prod ) {
            return prod.printer_id;
        }
        return undefined;
    }, this);
    
    
    return this;
}


Risto.Adition.detalleComanda.prototype = {  
    model       : 'DetalleComanda',
    
    
    initialize: function(jsonData){
        this.DetalleSabor   = ko.observableArray( [] );
        this.Producto       = ko.observable();
        this.imprimir       = ko.observable( true );
        this.cant           = ko.observable( 0 );
        this.es_entrada     = ko.observable( 0 );
        this.observacion    = ko.observable( '' );
        this.modificada     = ko.observable( false );
        this.producto_id     = ko.observable();

        this.id = ko.observable();


        if ( jsonData ) {
            // si aun no fue mappeado
            var mapOps = {
                'Producto': {
                    create: function(ops) {
                        return new Risto.Adition.producto(ops.data);
                    }
                },
                'DetalleSabor': {
                    create: function(ops) {
                        return new Risto.Adition.sabor(ops.data);
                    }
                },
            }
        } else {
            jsonData = {};
            mapOps = {};
        }
        return ko.mapping.fromJS(jsonData, mapOps, this);
    },
    
    /**
     *Es el valor del producto sumandole los sabores
     */
    precio: function(){        

        var precioSabor = 0;
        var total;
        if ( typeof this.Producto().precio == 'function') {
            total = this.Producto().precio();
        } else {
            total = this.Producto().precio;
        }
        $.each( this.DetalleSabor(), function( index, sabor ){
            precioSabor = 0;
            if ( sabor.Sabor && sabor.Sabor.precio) {
                precioSabor = sabor.Sabor.precio;
            } else {
                precioSabor = sabor.precio;
            }
            total = parseFloat(total) + parseFloat( precioSabor );
        });
        return ristoRound( total );
    },
    
    
    /**
     * Devuelve la cantidad real del producto que se debe adicionar a la mesa.
     * O sea, la cantidad agregada menos la quitada
     */
    realCant: function(){
        var cant = parseFloat( this.cant()  );
        if (cant < 0) {
            cant = 0;
        }

        return ristoRound(cant);
    },
    
    
    
    /**
     *  Devuelve el nombre del producto y al final, entre parentesis los 
     *  sabores si es que tiene alguno
     *  Ej: Ensalada (tomate, lechuga, cebolla)
     *  @return String
     */
    nameConSabores: function(){
        var nom = '';
        if ( this.Producto ) {
            if ( typeof this.Producto().name == 'function'){
                nom += this.Producto().name();
            } else {
                nom += this.Producto().name;
            }
            if ( this.DetalleSabor().length > 0 ){
                var dsname = '';
                for (var ds in this.DetalleSabor()) {
                    if ( ds > 0 ) {
                        // no es el primero
                        dsname += ', ';
                    }

                    // compatibilidad con version anterior
                    if (this.DetalleSabor()[ds].name && typeof this.DetalleSabor()[ds].name == 'function' && this.DetalleSabor()[ds].name() ) {
                        dsname += this.DetalleSabor()[ds].name();
                    } else if( this.DetalleSabor()[ds].name && typeof this.DetalleSabor()[ds].name != 'function' && this.DetalleSabor()[ds].name ) {
                        dsname += this.DetalleSabor()[ds].name;
                    }


                    if (this.DetalleSabor()[ds].Sabor && typeof this.DetalleSabor()[ds].Sabor.name == 'function') {
                        dsname += this.DetalleSabor()[ds].Sabor.name();
                    } else if ( this.DetalleSabor()[ds].Sabor && this.DetalleSabor()[ds].Sabor.name )  {
                        dsname += this.DetalleSabor()[ds].Sabor.name;
                    }

                    

                }
                
                if (dsname != '' ){
                    nom = nom+' ('+dsname+')';
                }                
            }
        }
        
        return nom;
    },


    nameConSaboresyObservacion: function () {
        return this.nameConSabores() + " " + this.observacion();
    },
    
    
    
    /**
     * Dispara un evento de producto seleccionado
     */
    seleccionar: function(){        
        this.cant( parseInt(this.cant() ) + 1 );
        this.modificada(true);
    },
    
    
    deseleccionar: function(){
        if (this.realCant() > 0 ) {
            this.cant( parseInt( this.cant() ) - 1 );
            this.modificada(true);
        }
    },
    
    deseleccionarYEnviar: function () {
        
       

        var cantFutura = this.realCant() - 1, 
            cantAEliminar = 1;
        if ( cantFutura >= 0 ) {
            this.modificada(true);
        }  else if ( cantFutura > -1 && cantFutura < 0) {
            cantAEliminar = Math.abs( cantFutura );
        } else if (cantFutura <= -1 ) {
            return;
        }

        if (!window.confirm('Seguro que desea eliminar ' + cantAEliminar  + ' unidad de '+this.Producto().name)){
            return false;
        }

        this.cant( this.cant() - cantAEliminar );            

        var id;
        if ( typeof this.id == 'function' ) {
            id = this.id();
        } else if ( typeof this.id == 'number' ) {
            id = this.id;
        }

        if ( id ) {

            // guardar cambios
            var dc = this;
            $cakeSaver.send({
               url: Risto.URL_DOMAIN + Risto.TENANT + '/comanda/detalle_comandas/edit/' + id,
               obj: dc
            }, function() {
            });
        } else {
            console.error("El ID del detalle comanda es: %o. No se pudo guardar el cambio", id);
        }

    },
    
    /**
     * Modifica el estado de el objeto indicando si es entrada o no
     * modifica this.es_entrada
     */
    toggleEsEntrada: function(){
        if ( this.es_entrada() ) {
            this.es_entrada( 0 );
        } else {
            this.es_entrada( 1 );
        }
        
    },
    

    fraccionar: function() {
        var cant = prompt("Fraccionar Unidad");
        if ( isNaN( cant )) {
            alert('ERROR: Debe ingresar un valor numérico');
        }
        if ( cant && !isNaN(cant)) {
            this.cant(cant);
        }
    },
    
    
    /**
     * Si este detalleComanda debe ser una entrada, devuelve true
     * 
     * @return Boolean
     */
    esEntrada: function(){
        // no se por que pero hay veces en que viene el boolean como si fuera un character asique deboi
        // hacer esta verificacion
        return Boolean( parseInt(this.es_entrada()) );
    },
    
    
    /**
     * Lee el formulario de la DOM y le mete el valor de observacion
     * Bindea el evento cuando abrio el formulario, pero cuando lo submiteo lo desbindea, 
     * para que otro lo pueda utilizar. O sea, el mismo formulario sirve para 
     * muchos detallesComandas
     */
    addObservacion: function(e){
        this.modificada(true);
        var cntx = this;
        $('#obstext').val( this.observacion() );
        $('#form-comanda-producto-observacion').submit( function(){
            cntx.observacion(  $('#obstext').val() );
            $('#form-comanda-producto-observacion').unbind();
            return false;
        });
    },
    
    
    /**
     * Si el DetalleComanda tiene sabores asignados, devuelve true, caso contrario false
     * @return Boolean
     */
    tieneSabores: function(){
        if ( this.DetalleSabor().length > 0) {
            return true;
        }
        return false;
    }
}

