/*--------------------------------------------------------------------------------------------------- Risto.Adicion.cliente
 *
 *
 * Clase Cliente
 */

Risto.Adition.cliente = function(jsonMap){   
    
    this.Descuento = ko.observable(null);
    this.IvaResponsabilidad = ko.observable(null);
    this.TipoDocumento = ko.observable(null);
    this.porcentaje = ko.observable( undefined );
    this.telefono = ko.observable( "" );
    this.domicilio = ko.observable( "" );

    return this.initialize(jsonMap);
}

Risto.Adition.cliente.prototype = {
   
    
    tieneDescuento: function() {
        var porcentaje = undefined;
        if (this.descuento_id() && this.Descuento() && this.Descuento().porcentaje && this.Descuento().porcentaje()) {
            porcentaje = parseInt( this.Descuento().porcentaje() );
        }
        return porcentaje;
    },
    
    
    getDescuentoText : function(){
        var porcentaje = 0;
        if (this.Descuento() && this.Descuento().porcentaje()) {
            porcentaje = parseInt( this.Descuento().porcentaje() )+ '%';
        }
        return porcentaje;
    },
    
    getTipoFactura: function(){
        var tipo = '';
        if ( this.IvaResponsabilidad && this.IvaResponsabilidad.TipoFactura && typeof this.IvaResponsabilidad.TipoFactura != 'function'&& this.IvaResponsabilidad.TipoFactura.name && typeof(this.IvaResponsabilidad.TipoFactura.name) == 'function') {
            tipo = this.IvaResponsabilidad.TipoFactura.name();    
        }


        if (    this.IvaResponsabilidad 
                && typeof this.IvaResponsabilidad == 'function' 
                && this.IvaResponsabilidad().TipoFactura 
                && typeof this.IvaResponsabilidad().TipoFactura != 'function'
                && this.IvaResponsabilidad().TipoFactura.name 
                && typeof(this.IvaResponsabilidad().TipoFactura.name) == 'function') {
            tipo = this.IvaResponsabilidad().TipoFactura.name();    
        }

        return tipo;
    },
    
    initialize: function( jsonMap ){
        if ( !jsonMap ) {
            return null;
        }
        if (jsonMap.hasOwnProperty( 'Cliente' ) ) {
            jsonMap = jsonMap.Cliente;
        }
        
        this.Descuento  = ko.observable( null );
        
        if (jsonMap.Descuento && jsonMap.Descuento.id) {
            this.Descuento( new Risto.Adition.descuento(jsonMap.Descuento) );
        }
        delete jsonMap.Descuento;

        
        ko.mapping.fromJS(jsonMap, {}, this);
        return this;
    }
}