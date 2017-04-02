/*--------------------------------------------------------------------------------------------------- Risto
 *
 *
 * Paquete Risto
 */

if ( typeof Risto == 'undefined' ) {
  var Risto = {};
}

Risto.modelizar = function(obToModelizar){
        
        obToModelizar.timeCreated = function(){
            var d;
            
            var created;
            if (typeof this.created == 'function'){
                created = this.created();
            } else {
                created = this.created;
            }
            if (!created) {
                d = new Date();
            } else {
                d = new Date( mysqlTimeStampToDate(this.created()) );       
            }

            var min =  (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
            return d.getHours()+":"+min;
        }
}



Date.diffDays = function ( day1, day2 ) {
    var mm = Date.clearHour(day1);
    var m2 = Date.clearHour(day2);
    return mm.diff(m2, "days");
}


Date.clearHour = function ( day1 ) {
    var mm;
    if ( day1 ) {
        mm = moment(day1);
    } else {
        mm = moment();
    }
    mm.set('hour',00).set('minute',00).set('second',00).set('millisecond',00);
    return mm;
}






function mysqlTimeStampToDate(timestamp) {
    if (timestamp) {
        //function parses mysql datetime string and returns javascript Date object
        //input has to be in this format: 2007-06-05 15:26:02
        var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
        var parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
        return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
    } else {
        return new Date();
    }
        
}

/**
 * I make a mysql date timestamp
 * @deprecated - Datepicker used instead
 * @param {Object} dateobj - a date
 */
function jsToMySqlTimestamp( dateobj )
{
    var date;
    if ( dateobj ) {
         date = new Date( dateobj );
    } else {
        date = new Date(  );
    }
    
    var yyyy = date.getFullYear();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    var hh = date.getHours();
    var min = date.getMinutes();
    var ss = date.getSeconds();
 
	var mysqlDateTime = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min + ':' + ss;
 
    return mysqlDateTime;
}






// Conclusión
(function() {
  /**
   * Ajuste decimal de un número.
   *
   * @param {String}  tipo  El tipo de ajuste.
   * @param {Number}  valor El numero.
   * @param {Integer} exp   El exponente (el logaritmo 10 del ajuste base).
   * @returns {Number} El valor ajustado.
   */
  function decimalAdjust(type, value, exp) {
    // Si el exp no está definido o es cero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si el valor no es un número o el exp no es un entero...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();


function ristoRound(number) {
    if (typeof Risto.PRECISION_COMA == 'undefined') {
        // por defecto se colocan 2 decimales despues de la coma
        var cantDecimales = 2;
    } else {
        // tomar la variable definida previamente
        var cantDecimales = Risto.PRECISION_COMA;
    }
    var cantCeros = parseInt( cantDecimales ) * -1;
    return Math.round10( number, cantCeros);
}
