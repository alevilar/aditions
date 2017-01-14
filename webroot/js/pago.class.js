/*--------------------------------------------------------------------------------------------------- Risto.Adicion.pago
 *
 *
 * Clase Pago
 */
Risto.Adition.pago = function(jsonOb){
    
    return this.initialize(jsonOb);
}


Risto.Adition.pago.prototype = {
    model       : 'Pago',
    
    
    initialize: function( jsonOb ){        
        this.id = ko.observable();        
        this.valor = ko.observable(); 
        this.media_id = ko.observable(); 
        this.TipoDePago = ko.observable( null );       
        this.tipo_de_pago_id = ko.observable( jsonOb.TipoDePago.id );
        this.mesa_id = ko.observable( null );    

        ko.mapping.fromJS(jsonOb, {}, this);
        Risto.modelizar(this);
        return this;
    },
    
    image: function(){
        if (this.TipoDePago() && typeof this.TipoDePago().media_id == 'function' && this.TipoDePago().media_id() ) {
            return URL_DOMAIN + TENANT + '/risto/medias/view/' + this.TipoDePago().media_id();
        } else {
            return URL_DOMAIN + TENANT + '/risto/medias/view/' + this.TipoDePago().media_id;
        }

        return '';
    },


    eliminar: function ( mesa ) {
        if ( this.id() ) {
            var url = URL_DOMAIN + TENANT + '/mesa/pagos/delete/' + this.id();
            $.ajax({
                url: url,
                type: 'DELETE'
            });
        }
        var encontrado = mesa.Pago().indexOf(this);
        if ( encontrado > -1 ) {
            mesa.Pago().splice(encontrado, 1);
        }
        delete this;
    }
}