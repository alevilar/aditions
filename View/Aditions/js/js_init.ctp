
// Inicializacion de variable global de url
if ( typeof Risto == 'undefined' ) {
Risto = {};
}

Risto.URL_DOMAIN = "<?php echo $this->Html->url('/' ,true);?>";
Risto.TENANT = "<?php echo  MtSites::getSiteName();?>";
Risto.RISTO_CUBIERTOS_OBLIGATORIOS = JSON.parse( '<?php echo json_encode( Configure::read('Adicion.cantidadCubiertosObligatorio'), JSON_NUMERIC_CHECK );?>');
Risto.RISTO_CONFIGURE_SITE = JSON.parse( '<?php echo json_encode( Configure::read('Site'), JSON_NUMERIC_CHECK );?>');
Risto.RISTO_CONFIGURE_ADICION = JSON.parse( '<?php echo json_encode( Configure::read('Adicion'), JSON_NUMERIC_CHECK );?>');

Risto.PROMPT_DESCRIPCION_DE_MESA = "<?php echo __('Crear Nueva %s. Agregarle una descripción:', Configure::read('Mesa.tituloMesa'))?>";
Risto.PROMPT_CANT_CUBIERTOS = "<?php echo __('Ingresar Cantidad de %s:', Inflector::pluralize(Configure::read('Mesa.tituloCubierto')))?>";


Risto.IVA_PORCENTAJE = "<?php echo Configure::read('Afip.default_iva_porcentaje')?>";
Risto.PRECISION_COMA = "<?php echo Configure::read('Restaurante.precision')?>";
Risto.TITULO_MESA = "<?php echo Configure::read('Mesa.tituloMesa')?>";
Risto.TITULO_MOZO = "<?php echo Configure::read('Mesa.tituloMozo')?>";
Risto.TITULO_CUBIERTO = "<?php echo Inflector::pluralize( Configure::read('Mesa.tituloCubierto') )?>";
Risto.TITULO_CLIENTE = "<?php echo Configure::read('Mesa.tituloCliente')?>";

Risto.DEFAULT_TIPOFACTURA_NAME = "<?php echo Configure::read('Restaurante.tipofactura_name')?>";


<?php if (Configure::check('Printer.fiscalberry_ip') ) { ?>
Risto.FISCALBERRYHOST = "<?php echo Configure::read('Printer.fiscalberry_ip');?>";
<?php } else { ?>
Risto.FISCALBERRYHOST = "paxaprinter.local";
<?php } ?> 



 // intervalo en milisegundos en el que seran renovadas las mesas
<?php 
$RELOAD_INTERVAL =  Configure::read('Adicion.reload_interval');
if (empty($RELOAD_INTERVAL)) {
    $RELOAD_INTERVAL = 5000;
}
?>

Risto.MESAS_RELOAD_INTERVAL = <?php echo $RELOAD_INTERVAL; ?>;
//        Risto.MESA_RELOAD_TIMEOUT = <?php echo Configure::read('Adicion.reload_interval_timeout')?>;

Risto.VALOR_POR_CUBIERTO = <?php 
                            $valorCubierto = Configure::read('Restaurante.valorCubierto');
                            echo $valorCubierto > 0 ? $valorCubierto : 0;  ?>;

// hace que luego de cobrar una mesa, esta quede activa durante X segundos
Risto.ESPERAR_DESPUES_DE_COBRAR = parseInt( "<?php echo Configure::read('Adicion.cobrada_hide_ms')?>" );


Risto.IMPRIME_REMITO_PRIMERO = <?php echo Configure::read('Mesa.imprimePrimeroRemito')?1:0?>;

//Parametros de configuracion
Risto.cubiertosObligatorios=<?php echo Configure::read('Adicion.cantidadCubiertosObligatorio')?'true':'false'?>;


Risto.printerFiscal = <?php echo json_encode( $printer, JSON_NUMERIC_CHECK )?>;
Risto.printerComanderaPPal = <?php echo json_encode( $comanderaPpal, JSON_NUMERIC_CHECK )?>;
Risto.printers = <?php echo json_encode( $printers, JSON_NUMERIC_CHECK )?>;
Risto.getPrinterId = function( id ) {
    for(var i=0;i<Risto.printers.length;i++){
        if ( Risto.printers[i].Printer.id == id ) {
            return Risto.printers[i];
        }
    }
    return null;
}

window.addEventListener("load", function load(event){

    $.extend(  $.mobile , {
        backBtnText: "Volver"
    });
    
    <?php 
    $animar = Configure::read('Adicion.jqm_page_transition');
    if ( empty($animar) ){ 
        if (!$animar) {
        ?>
          $.extend(  $.mobile , {
            defaultPageTransition: 'none',
            defaultDialogTransition: 'none'
          });
    <?php }} ?>
        
   


});

