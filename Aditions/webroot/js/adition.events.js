/*--------------------------------------------------------------------------------------------------- Adition EVENTS
 *
 *
 * Adition Events
 * el el script que capura los eventos de la pagina adition.php[ctp]
 */

// mensaje de confirmacion cuando se esta por salir de la pagina (evitar perdidas de datos no actualizados)
//window.onbeforeunload=confirmacionDeSalida;



/**
 *JQM 
 * renderizado de cosas que se cargan dinamicamente en javascript
 * en cada cambio de pagina, hacemos que se  vuelva a refrescar JQM 
 * para enriquecer los elementos nuevos
 *
 */

      
$(document).bind("mobileinit", function(){    
  console.info("Inicializando v2017-02-04.12.55");

  $(document).ajaxError(function( event, jqxhr, settings, thrownError ){
    if ( jqxhr.status == 403 ) {
      // FORBIDDEN      
      $.mobile.changePage('#adicion-login');
    }
  });



    /**
     *
     *
     *          Mesa View -> Cambiar Mozo
     *
     *
     */

    // enrquiqueecr con JQM el listado ed comandas de la mesa en msa-view
    $('#mesa-cambiar-mozo').live('pageshow',function(event, ui){    
        // Form SUBMITS
        $('#form-cambiar-mozo').bind('submit', function(e){
            e.preventDefault();
            $raeh.trigger('cambiarMozo', e, this);
            return false;
        });
    });

    // enrquiqueecr con JQM el listado ed comandas de la mesa en msa-view
    $('#mesa-cambiar-mozo').live('pagehide',function(event, ui){ 
        // Form SUBMITS
        $('#form-cambiar-mozo').unbind('submit');
    });
    

    

    /**
    * NOTAS DE CREDITO
    * 
    *
    
    $('#adition-nota-credito').live('pageshow',function(event, ui){ 
        console.info("asaisjoa MOSTRANDOOO");

        if ( PrinterDriver.isConnected() ) {
          // esta conectado fiscalberry
          $("#CajeroNotaCreditoForm").bind("submit", function(){
            return false;
          });


          $("#adition-nota-credito-imprimir").bind("click", function(){

          });
        }
    });

    $('#adition-nota-credito').live('pagehide',function(event, ui){
        console.info("asaisjoa OCULTANDOOOO");
    });

    */

    
    /**
     *  Observacion de los productos
     */
    $('#comanda-add-product-obss').live('pageshow',function(event, ui){    
        $('#obstext').focus();

        if ( PrinterDriver.isConnected() ) {
          $("#adition-nota-credito-imprimir").unbind("click");
        }
    });






    /**
     *
     *
     *          COMANDA ADD
     *
     */
    $('#comanda-add-menu').live('pageshow', function(){
        //creacion de comandas
        // producto seleccionado
        $(document).bind(  MENU_ESTADOS_POSIBLES.productoSeleccionado.event , productoSeleccionado);        

        // boton para mostrar el formulario de observacion
        $('#comanda-obervacion-a').bind('click', function(){
            $('#comanda-add-observacion').toggle('slow');
            $('textarea','#comanda-add-observacion').focus();
        });
        
        $('#ul-productos-seleccionados').delegate(
                'li',
                'click',
                function(e){
                    var $ops = $('.ui-options', this);

                    function openCoso () {
                        $ops.show();
                    }

                    function closeCoso () {
                        $ops.hide();
                    }

                    if ( $ops[0]['data-open'] === true ) {
                        closeCoso();
                        $ops[0]['data-open'] = false;
                    } else {
                        openCoso();
                        $ops[0]['data-open'] = true;
                    }
                }
        );            

        $('#comanda-add-guardar').bind('click', function(){
            Risto.Adition.adicionar.currentMesa().currentComanda().save();
            Risto.Adition.menu.reset();
        });

        function seleccionar(){
            //retrieve the context
            var context = ko.contextFor(this);
            $(this).addClass('active');
            if (context) {
                // $data es es el objeto producto
                if ( !context.$data.sin_stock ) {
                  // si tine stock seleccionar
                  context.$data.seleccionar();
                }
            }
        }

        $('#ul-categorias').delegate("a", "click", seleccionar);
        $('#ul-productos').delegate("a", "click", seleccionar);
        
            
        // Eventos para la observacion General de la Comanda ADD
        (function(){
            var $domObs = $('#comanda-add-observacion');
            $("#mesa-comanda-add-obs-gen-cancel").bind('click', function(){
                $domObs.toggle('slow'); 
                Risto.Adition.adicionar.currentMesa().currentComanda().comanda.borrarObservacionGeneral();
            });

            $("#mesa-comanda-add-obs-gen-aceptar").bind('click', function(){
                $domObs.toggle('slow');
            });

            var domObsList = $('.observaciones-list button', '#comanda-add-menu');
            domObsList.bind('click' , function(e){
                if ( this.value ) {
                    Risto.Adition.adicionar.currentMesa().currentComanda().comanda.agregarTextoAObservacionGeneral( this.value );
                }
            });
        })();
    });

    $('#comanda-add-menu').live('pagebeforehide', function(){
        $(document).unbind(  MENU_ESTADOS_POSIBLES.productoSeleccionado.event);
        
        $('#comanda-obervacion-a').unbind('click');
        
        $('a.active','#ul-productos').removeClass('active');
        
        $('#comanda-add-observacion').hide();
        
        $('#ul-categorias').undelegate("a", 'click');
        $('#ul-productos').undelegate("a", 'click');
        
        
        $('#ul-productos-seleccionados').undelegate(
                '.listado-productos-seleccionados',
                'mouseleave'
        );                
        
        $('#ul-productos-seleccionados').undelegate(
                'li',
                'click'
        ); 
            
            

        $("#mesa-comanda-add-obs-gen-cancel").unbind('click');
        $("#mesa-comanda-add-obs-gen-aceptar").unbind('click');
        $('.observaciones-list button', '#comanda-add-menu').unbind('click');
        $('#comanda-add-guardar').unbind('click');
        
    });






    /**
     *
     *
     *          Mesa View -> Cambiar N° Mesa
     *
     *
     */

    // enrquiqueecr con JQM el listado ed comandas de la mesa en msa-view
    $('#mesa-cambiar-numero').live('pageshow',function(event, ui){ 

        $('input:first', '#form-cambiar-numero').focus().val('');
        // Form SUBMITS
        $('#form-cambiar-numero').bind( 'submit', function(){
            $raeh.trigger('cambiarNumeroMesa', null, this);
            return false;
        });
    });

    // enrquiqueecr con JQM el listado ed comandas de la mesa en msa-view
    $('#mesa-cambiar-numero').live('pagebeforehide',function(event, ui){ 
        // Form SUBMITS
         $('#form-cambiar-numero').unbind( 'submit');
    });


    /**
     *
     *
     *          Mesa View
     *
     *
     */

    // enrquiqueecr con JQM el listado ed comandas de la mesa en msa-view
    $('#mesa-view').live('pageshow',function(event, ui) {

        $('#comanda-detalle-collapsible').trigger('create');

         // CLICKS
        $('#mesa-action-comanda').bind( 'click', function(){
            Risto.Adition.adicionar.nuevaComandaParaCurrentMesa();
        });

        $('#mesa-action-cobrar').bind('click',function(){
           

        });
        
        var $hrefEdit = $('a:first-child','#mesa-action-edit');
        


          $('#mesa-menu').bind( 'click', function(){
              Risto.Adition.adicionar.agregarMenu();
          });

          $('#mesa-cant-comensales').bind('click', function(){
              Risto.Adition.adicionar.agregarCantCubiertos();
          });

        $('#mesa-checkout').bind('click', function(){
            var mesa = Risto.Adition.adicionar.currentMesa();
            mesa.cambioDeEstadoAjax( MESA_ESTADOS_POSIBLES.checkout );

        });


        $('#mesa-cerrar').bind('click', function(){
            var mesa = Risto.Adition.adicionar.currentMesa();
            mesa.cambioDeEstadoAjax( MESA_ESTADOS_POSIBLES.cerrada );


            // imprimir offline usando fiscalberry
            if (PrinterDriver.isConnected() ) {
              // imprimio remito con comandera
              if ( Risto.IMPRIME_REMITO_PRIMERO && Risto.printerComanderaPPal ) {
                PrinterDriver.printRemito(mesa);
              }

              // imprimio ticket con fiscal
              if ( !Risto.IMPRIME_REMITO_PRIMERO && Risto.printer ) {
                PrinterDriver.printTicket(mesa);
              }
            }
        });

        $('#mesa-action-reimprimir').bind('click', function(){
            var mesa = Risto.Adition.adicionar.currentMesa();
            mesa.reimprimir();
        });


        $('#mesa-action-imprimir-nc').bind('click', function(){
            var numeroTicket = window.prompt( "Ingresar número del ticket anterior" );

            if ( numeroTicket ) {
              var mesa = Risto.Adition.adicionar.currentMesa();

              mesa.tipo_factura_id = 8; //"NCB";
              if ( mesa.Cliente() &&  mesa.Cliente().IvaResponsabilidad() ) {
                  var tipo_factura_id_cliente = mesa.Cliente().IvaResponsabilidad().tipo_factura_id();
                  if ( tipo_factura_id_cliente == 1 ) { // FA
                    mesa.tipo_factura_id = 10; // NCA
                  }
                  if ( tipo_factura_id_cliente == 5 ) { // FC
                    mesa.tipo_factura_id = 9; // NCC 
                  }
              }

              mesa.referencia = numeroTicket*1;
              PrinterDriver.printTicket(mesa);
            }
        });


        $('#mesa-borrar').bind('click', function(){
            if (window.confirm('Seguro que desea borrar la mesa '+Risto.Adition.adicionar.currentMesa().numero())){
                var mesa = Risto.Adition.adicionar.currentMesa();
                mesa.cambioDeEstadoAjax( MESA_ESTADOS_POSIBLES.borrada );
            }
        });


        $('#mesa-reabrir').bind('click',function(){
            var mesa = Risto.Adition.adicionar.currentMesa();
            mesa.cambioDeEstadoAjax( MESA_ESTADOS_POSIBLES.reabierta );
        });

        var observationChanges = '';
        $('#mesa-textarea-observation').bind('focus', function() {
            observationChanges = Risto.Adition.adicionar.currentMesa().observation();
            $('#mesa-observacion-submit').show('fade');
        });

        $('#mesa-textarea-observation').bind('focusout', function() {
            if ( observationChanges == Risto.Adition.adicionar.currentMesa().observation() ){
                $('#mesa-observacion-submit').hide('fade');
            }
        });

        $('#mesa-observacion-submit').bind('click', function(){
             Risto.Adition.adicionar.guardarObservacionMesa();
             $('#mesa-observacion-submit').hide('fade');
        });
        
        

    });

    $('#mesa-view').live('pagebeforehide',function(event, ui){  
        $('#mesa-action-comanda').unbind('click');
        $('#mesa-action-cobrar').unbind('click');
        $('#mesa-menu').unbind('click');
        $('#mesa-cant-comensales').unbind('click');
        $('#mesa-cerrar').unbind('click');
        $('#mesa-action-reimprimir').unbind('click');
        $('#mesa-borrar').unbind('click');
        $('#mesa-reabrir').unbind('click');
        $('#mesa-textarea-observation').unbind('focus');
        $('#mesa-textarea-observation').unbind('focusout');
        $('#mesa-observacion-submit').unbind('click');
        $('#mesa-checkout').unbind('click');
        $('#mesa-action-imprimir-nc').unbind('click');
    });



    /**
    *
    * MESAS CERRADAS  ---- CAJERO ----
    *
    **/

    $('#listado-mesas-cerradas').live('pageshow',function(event, ui){
        $(document).bind( "keydown", onKeyDown);
    });


    $('#listado-mesas-cerradas').live('pagebeforehide',function(event, ui){  
        $(document).unbind( "keydown", onKeyDown);
    });



    /**
     *
     *      LISTADO DE MESAS
     *
     *
     */


    $('#listado-mesas').live('pageshow',function(event, ui){
      function activarBuscadorDeMesas() {
        $(document).bind( "keydown", onKeyDown);
        $(document).bind( "keypress", onKeyPress);
      }

      function desactivarBuscadorDeMesas() {
        $(document).unbind( "keydown");
          $(document).unbind( "keypress");
      }


      activarBuscadorDeMesas();

      function hasVerticalScroll(node){
          if(typeof node == "undefined"){
              if(window.innerHeight){
                  return document.body.offsetHeight> innerHeight;
              }
              else {
                  return  document.documentElement.scrollHeight > 
                      document.documentElement.offsetHeight ||
                      document.body.scrollHeight>document.body.offsetHeight;
              }
          }
          else {
              return node.scrollHeight> node.offsetHeight;
          }
      }

      if ( hasVerticalScroll() ) {
        $('.content_mesas', '#listado-mesas').addClass("scroll-exists");
      }
                
        $(document).bind(MOZOS_POSIBLES_ESTADOS.seleccionado.event, function(e){
            abrirMesa( e );
        });

        $("#mesa-abrir-mesa-generica-btn").bind( 'click', function(e) {          
            abrirMesa( e );
        });



        function abrirMesa( event ) {
          mozoId = event.mozo.id();
          
          $('.input-create-mozo-id',"#abrir-mesa-nueva").val(mozoId);
          $('.mesa-abierta-mozo-alias',"#abrir-mesa-nueva").text(event.mozo.numero());

          function cancelarAperturaAlApretarESC(e){
             var code = e.which;
                  if ( code == 27){ // ESC
                      cancelarApertura();                   
                  }
          }


          function __cleanup( ) {
            $("#abrir-mesa-nueva").hide();         
            activarBuscadorDeMesas();
            
            $("input", "#abrir-mesa-nueva").each(function(){
              // limpiar cada input
              $(this).val('');
            });
            $(".numero-mensaje-error-vacio", "#abrir-mesa-nueva").hide();
            $(".cubiertos-mensaje-error-vacio", "#abrir-mesa-nueva").hide();

             // para el overlay
            $(".overlay-content","#abrir-mesa-nueva").unbind("click", stopPropagationForContextClick);


            // cancelar si se clickea el overlay
            $("#abrir-mesa-nueva").unbind('click', cancelarSiSeClickeaOverlay);

            $("#abrir-mesa-nueva").unbind('keydown', cancelarAperturaAlApretarESC);

            // al hacer enter en el input de NUMERO DE MESA
            $(".input-create-mesa-numero", "#abrir-mesa-nueva").unbind('keydown', seleccionarNumeroDeMesa);

            // al hacer enter en el input de CUBIERTOS
            $(".input-create-mesa-cubiertos").unbind('keydown', seleccionarCubiertos );


          }


          function cancelarApertura(){
            __cleanup();
          }

          function hacerApertura(){
            $(".numero-mensaje-error-vacio", "#abrir-mesa-nueva").hide();
            $(".cubiertos-mensaje-error-vacio", "#abrir-mesa-nueva").hide();
            
            var numero = $(".input-create-mesa-numero", "#abrir-mesa-nueva").val(),
                mozoId = $(".input-create-mozo-id", "#abrir-mesa-nueva").val(),
                cubiertos = $(".input-create-mesa-cubiertos", "#abrir-mesa-nueva").val();
              
              var error = false; 
              if ( !numero ) {
                $(".numero-mensaje-error-vacio", "#abrir-mesa-nueva").show();
                error = true;
              }

              if ( !cubiertos && Risto.cubiertosObligatorios) {
                $(".cubiertos-mensaje-error-vacio", "#abrir-mesa-nueva").show();
                error = true;
              }

              if ( error ) {
                return;
              }


            __cleanup();
              var miniMesa = {
                mozo_id: mozoId,
                numero: numero,
                cant_comensales: cubiertos
              };
              mesa = Risto.Adition.adicionar.crearNuevaMesa( miniMesa );
              Risto.Adition.tenantIoNuevaMesaPendiente = mesa;
              var ajaxReq = mesa.create(); // guarda a DB
              ajaxReq.done(function(){
                Risto.Adition.tenantIoNuevaMesaPendiente = false;
              }); 
              mesa.seleccionar();
              $.mobile.changePage('#mesa-view');
          }

          function stopPropagationForContextClick( event ){
             event.stopPropagation();
          }

          function cancelarSiSeClickeaOverlay( event ) {
            event.preventDefault();
            cancelarApertura();
          }

          function seleccionarNumeroDeMesa( event ) {
             var code = event.which;
              if ( code == 13){ // ENTER
                  if ( $(".input-create-mesa-cubiertos").is(":visible") ) {
                    //configurar cubiertos
                    $(".input-create-mesa-cubiertos").focus();        
                  } else {
                    if ( this.value ) {
                      hacerApertura();
                    }
                  }
              }
          }

          function seleccionarCubiertos (  event) {
                var code = event.which;
              if ( code == 13){ // ENTER
                hacerApertura();
              }
          }

          if ( Risto.cubiertosObligatorios ) {
            $(".mesa-cubiertos-input").show();
          } else {
            $(".mesa-cubiertos-input").hide();
          }
          desactivarBuscadorDeMesas();

          $("#abrir-mesa-nueva").show();


          // para el overlay
          $(".overlay-content","#abrir-mesa-nueva").bind("click", stopPropagationForContextClick);

          $('.btn-create-mesa-ok',"#abrir-mesa-nueva").bind("click", hacerApertura);

          // cancelar si se clickea el overlay
          $("#abrir-mesa-nueva").bind('click', cancelarSiSeClickeaOverlay);

          $("#abrir-mesa-nueva").bind('keydown', cancelarAperturaAlApretarESC);

          // al hacer enter en el input de NUMERO DE MESA
          $(".input-create-mesa-numero", "#abrir-mesa-nueva").bind('keydown', seleccionarNumeroDeMesa);

          // al hacer enter en el input de CUBIERTOS
          $(".input-create-mesa-cubiertos").bind('keydown', seleccionarCubiertos );

          $('.input-create-mesa-numero', "#abrir-mesa-nueva").focus();

        }


    });


    $('#listado-mesas').live('pagebeforehide',function(event, ui){
        $("#mesa-abrir-mesa-generica-btn").unbind( 'click');
        $(document).unbind(MOZOS_POSIBLES_ESTADOS.seleccionado.event);
        $(document).unbind( "keydown");
        $(document).unbind( "keypress");
    });
    
    
         
    

   

    


    /**
     *
     *          CLIENTES LISTADO
     *
     */
    $('#listado_de_clientes').live('pageshow',function(event, ui){
        $('input', '#contenedor-listado-clientes').focus();
        
        $('input', '#contenedor-listado-clientes').bind('keyup', function(){
            var cliente, 
                clientesNuevos = [], 
                val = $(this).val();

            if ( val.length > 2 )
            $.getJSON(Risto.URL_DOMAIN + Risto.TENANT +'/clientes/index', {
                'search' : val
            }, function (e) {
              clientesNuevos = [];
              if ( e.clientes ) {
                var cliCha;
                $.each(e.clientes, function( index, cliente ) {
                  cliCha = cliente.Cliente;
                  cliCha.IvaResponsabilidad = cliente.IvaResponsabilidad;
                  cliCha.TipoDocumento = cliente.TipoDocumento;
                  cliCha.Descuento = cliente.Descuento;
                  cli = new Risto.Adition.cliente( cliCha );
                  clientesNuevos.push( cli );
                });
                Risto.Adition.adicionar.clientes( clientesNuevos );
              }
            });

            if (Risto.Adition.adicionar.clientes.length == 0 ) {
              $('.btn-action-cliente-add').show();
            }        


         });

        $('#mesa-eliminar-cliente').bind('click',function(){
            Risto.Adition.adicionar.currentMesa().setCliente( null );
            return true;
        });

    });

    $('#listado_de_clientes').live('pagebeforehide',function(event, ui){
        Risto.Adition.adicionar.clientes([]);
        $('#mesa-eliminar-cliente').unbind('click');
        $('input', '#contenedor-listado-clientes')
            .val('')
            .unbind('keypress')
            .unbind('keyup');
    });



    /**
     *
     *
     *    Agregar Clientes ADD
     */
    $('#clientes-addfacturaa').live('pageshow', function() {
        var $fform = $('#form-cliente-add', '#clientes-addfacturaa');
        $fform.bind('submit', function(e){
          var contenedorForm = $fform.parent();
           e.preventDefault();
           $.post(
               $fform.attr('action'), 
               $fform.serialize(),
               function(data){
                   contenedorForm.html(data);
                   contenedorForm.trigger('create');
                   contenedorForm.trigger('refresh');
               }
           );
           return false; 
        });
    });
    
    $('#clientes-addfacturaa').live('pagehide', function() {
        $('#form-cliente-add', '#clientes-addfacturaa').unbind('submit');
    });




    /**
     *
     *
     *          Page Mesas.cobradas
     *
     */
    $('#mesas-edit').live('pageshow', function ( e, p) {
        $('form', e.target).bind('submit', function ( evt, coso ) {
            var action = this.action;
            var data = $(this).serialize();

            $.ajax({
              type: "PUT",
              url: action,
              data: data,
              success: function () {
                    history.back();
              }
            });
            return false;
        });
    });

     $('#mesas-edit').live('pagehide', function( e ) {
        $('form', e.target).unbind('submit');
    });


     /**
     *
     *
     *          Page COBRAR
     *
     */
    $('#cajero-opciones').live('pageshow',function(event, ui){
        $('#cajero-ops-cierre-fiscal-x').bind('click',function(){
            PrinterDriver.dailyClose("X");
        });

        $('#cajero-ops-cierre-fiscal-z').bind('click',function(){
            PrinterDriver.dailyClose("Z");
        });
    });


    $('#cajero-opciones').live('pagebeforehide',function(event, ui){
        $('#cajero-ops-cierre-fiscal-x').unbind('click');
        $('#cajero-ops-cierre-fiscal-z').unbind('click');
    });




     /**
     *
     *
     *          Page opciones adicion
     *
     */
    $('#adicion-opciones').live('pageshow',function(event, ui){

        $('#input-fiscalberry-ip').val( localStorage.getItem("fiscalberryHost") );

        $('#input-fiscalberry-ip').bind('keyup',function(e){
          var el = e.target;
            localStorage.setItem("fiscalberryHost", el.value);
        });
    });


    $('#adicion-opciones').live('pagebeforehide',function(event, ui){
      $('#input-fiscalberry-ip').unbind('keyup');
    });




    /**
     *
     *
     *          Page COBRAR
     *
     */
 
    $('#mesa-cobrar').live('pageshow', function(){


      function eliminarCobro () {
            var pago = ko.dataFor(this);
            pago.eliminar( Risto.Adition.adicionar.currentMesa() );
            $(this).parent().remove();
      }


      function reabrirMesa () {
            var mesa = Risto.Adition.adicionar.currentMesa();
            mesa.cambioDeEstadoAjax( MESA_ESTADOS_POSIBLES.reabierta );
      }

      function reimprimirMesa() {
            var mesa = Risto.Adition.adicionar.currentMesa();
            mesa.reimprimir();
      }

      function checkoutMesa () {
            var mesa = Risto.Adition.adicionar.currentMesa();
            mesa.cambioDeEstadoAjax( MESA_ESTADOS_POSIBLES.checkout );
      }

      function seleccionDePagosDisponibles () {
          var json = $(this).data('pago-json');
          var tipoDePago = eval("(function(){return " + json + ";})()");

          var pagoObj = {
            TipoDePago: tipoDePago
          }

          var nuevoPago = new Risto.Adition.pago( pagoObj );

          Risto.Adition.adicionar.currentMesa().Pago.push( nuevoPago );

          $('.pagos_creados li:last','#mesa-cobrar').find('input')
              .focus()
              .val( Risto.Adition.adicionar.currentMesa().total() - Risto.Adition.adicionar.currentMesa().totalPagos() )
              .trigger('change');
      }

      function procesarGuardarCobros () {
         Risto.Adition.adicionar.currentMesa().savePagos();      
      }

      $('.pagos_creados').delegate('.mesa-cobro-eliminar', 'click', eliminarCobro);
      $('#mesa-cajero-reabrir').bind('click',reabrirMesa);
      $('.mesa-reimprimir', '#mesa-cobrar').bind('click', reimprimirMesa);
      $('#mesa-cajero-checkout', '#mesa-cobrar').bind('click', checkoutMesa);

      // manejo de los pagos
      $('.tipo-de-pagos-disponibles','#mesa-cobrar').delegate('a', 'click', seleccionDePagosDisponibles);
      
      // Al apretar el boton de cobro de pago procesa los pagos correspondientes
      $('#mesa-pagos-procesar').bind('click', procesarGuardarCobros);

      // marcar los botones que voy clickeando (son los que se usan arriba)
      $('.mesa-cajero-clickeable', '#mesa-cobrar').bind('click', function() {
            $(this).addClass('mesa-cajero-clickeable-apretado');
      });       
      
    });

    $('#mesa-cobrar').live('pagebeforehide', function(){        
        $('#mesa-pagos-procesar').unbind('click');
        $('.tipo-de-pagos-disponibles','#mesa-cobrar').undelegate('a', 'click');

        $('.pagos_creados').undelegate('.mesa-cobro-eliminar', 'click');

        $('#mesa-cajero-reabrir').unbind('click');
        $('.mesa-reimprimir', '#mesa-cobrar').unbind('click');      
        $('#mesa-cajero-checkout', '#mesa-cobrar').unbind('click');
        $('.mesa-cajero-clickeable', '#mesa-cobrar').unbind('click');
        $('.mesa-cajero-clickeable-apretado', '#mesa-cobrar').removeClass('mesa-cajero-clickeable-apretado');    
    });





    /**
     *
     *
     *          Page SABORES
     *
     */

    $('#page-sabores').live('pageshow', function(){
        var $closeIcon = $('#page-sabores').find( 'a[data-icon="delete"]' );
        $closeIcon.bind('click',function(){
                    Risto.Adition.adicionar.currentMesa().currentComanda().limpiarSabores();
                    $closeIcon.unbind('click');
                });
                
        function seleccionar(e){
            
            //retrieve the context
            var context = ko.contextFor(this);
            $(this).addClass('active');
            if (context) {
                // $data es es el objeto producto
                context.$data.seleccionar(e);
            }
        }

        $('#ul-sabores').delegate("a", "click", seleccionar);
    });
    
    $('#page-sabores').live('pagehide', function(){
        $('#ul-sabores').undelegate("a", "click");
    });


});


/**
 *
 *                  Eventos ONLOAD
 *
 *
 */ 
$(document).ready(function() {   
  
   hacerQueNoFuncioneElClickEnPagina();


   beforePageChangeStuff();
    
    $("#mesas-time-reload").text(Risto.MESAS_RELOAD_INTERVAL/1000);
    

    
     // Los botones que tengan la clase silent-click sirven para los dialogs
    // la idea es que al ser apretados el dialog se cierre, pero que se envie 
    // el href via ajax, Es util para las ocasiones en las que quiero mandar
    // una accion al servidor del cual no espero respuesta.    
    $('[data-href]').bind('click',function(e){
        var att = $(this).attr('data-href');
        if (att) {
            $.get( att );
        }
        $('.ui-dialog').dialog('close');
    });   
});



/**
 * Cuando estoy creando una comanda se selecciona un producto y 
 * este debe ser agregado al listado de productos de la currentMesa()
 */
function productoSeleccionado(e) {
    Risto.Adition.adicionar.currentMesa().agregarProducto(e.producto);
}


function beforePageChangeStuff() {

  function imprimirMesasEstadoError( ev ) {
      var mesasList = [];
      if ( Risto.Adition.adicionar.mozos().length  ) {
          var listMozos = Risto.Adition.adicionar.mozos();


          for ( var m = 0; m < listMozos.length; m++ ) {
            var mozo = listMozos[m];
            for ( var i = 0; i < mozo.mesas().length; i++ ) {
                var mesa = mozo.mesas()[i];
                    if ( mesa.sync() < 1 ) {
                      mesasList.push( mesa );
                  }
              }
          }
      }

      var ret = null;
      if (mesasList.length > 0) {
        ev.preventDefault();
        ret = "Existen modificaciones pendientes... seguro desea salir? se perderan los cambios";
      }
   

      return ret;
  }

  $(window).bind("beforeunload", imprimirMesasEstadoError);
}






/**
 *
 *@param String to. es una funcion de jQuery que hace ir para adelante o para atras en la dom 
 *se puede poner: 
 *                  'next' (por default) busca el siguiente elemento
 *                  'prev' busca el anterior
 */
function __irMesaTo(to) {
    var toWhat = to || 'next';
    
    var mesaContainer = $('.listado-adicion', $.mobile.activePage );
    
    if ( !mesaContainer ) {
        return;
    }

    if ( Risto.Adition.mesaCurrentContainer && Risto.Adition.mesaCurrentContainer.attr('id') != mesaContainer.attr('id') ){
        Risto.Adition.mesaCurrentIndex = null;
    }
    
    Risto.Adition.mesaCurrentContainer = mesaContainer;
        
    if ( Risto.Adition.mesaCurrentIndex !== null) {
        var aaa = Risto.Adition.mesaCurrentIndex.parent()[toWhat]().find('a');
        if ( aaa.length ) {
            Risto.Adition.mesaCurrentIndex = aaa;
        } else {
            return;
        }
    } else {
        Risto.Adition.mesaCurrentIndex = Risto.Adition.mesaCurrentContainer.find('a').first();
    }
    Risto.Adition.mesaCurrentIndex.focus();
}
  

function irMesaPrev() {
    __irMesaTo('prev');
    
}

function irMesaNext() {
    __irMesaTo('next');
}


function onKeyDown(e) {
    var code = e.which;
    
    // al apretar la tecla back, volver atras, menos cuando estoy en un INPUT o TEXTAREA
    if (code == 8 ) { // tecla backspace
        if (document.activeElement.tagName.toLowerCase() != 'input' && document.activeElement.tagName.toLowerCase() != 'textarea') {
            history.back();
        }
    }
    
    
    // Ctrol DERECHO + M ir a modo Cajero
    if( (code == 'l'.charCodeAt() || code == 'L'.charCodeAt()) && e.ctrlKey) {
        var pageId = $.mobile.activePage.attr('id');
        
        if ( pageId == 'listado-mesas-cerradas' ) {
            $.mobile.changePage('#listado-mesas');
        }
        
        if ( pageId == 'listado-mesas' ) {
            $.mobile.changePage('#listado-mesas-cerradas');
        }
        return false;
    }        
    
    
    if(code == 23 && e.ctrlKey) {
        $.mobile.changePage('#mesa-view')
    }
        
    
    // mesa siguiente a la seleccionada (focus) del listado de mesas
    if (code == 39 ) { //btn flecha derecha
        irMesaNext();
    }
    
    // mesa anterior a la seleccionada del listado de mesas
    if (code == 37 ) { // boton flecha izq
        irMesaPrev();
    }
}

var oldTimeOut;
function onKeyPress(e) {
    var code = e.which;
    if ( code > 47){ // desde el numero 0 hasta la ultima letra con simbolos
        
        // buscar la mesa con ese numero, busca por accesskey
        Risto.Adition.mesaBuscarAccessKey += String.fromCharCode( code );
        var domFinded = $("[accesskey^='"+Risto.Adition.mesaBuscarAccessKey+"']", $.mobile.activePage);
        if ( domFinded.length ) {
            Risto.Adition.mesaCurrentIndex = $(domFinded[0]);
            domFinded[0].focus();
        }
        
        if(oldTimeOut){
            clearTimeout(oldTimeOut);
        }
        oldTimeOut = setTimeout(function(){
            Risto.Adition.mesaBuscarAccessKey = '';
        },1000);
    }
}



/**
 *  para que no titile el cursor. Que no se pueda hacer click
 */
function hacerQueNoFuncioneElClickEnPagina() {
    return 1;
   if(document.all){
      document.onselectstart = function(e) {return false;} // ie
   } else {
      document.onmousedown = function(e)
      {
         if(e.target.type!='text' && e.target.type!='button' && e.target.type!='textarea') return false;
         else return true;
      } // mozilla
   }
}