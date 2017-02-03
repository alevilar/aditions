<!DOCTYPE HTML>
<?php App::uses('MtSites', 'MtSites.Utility'); ?>

<?php if ( Configure::read('debug') > 0 ) { ?>
    <html>
<?php } else { ?>
    <html manifest="<?php echo $this->Html->url( array('plugin'=>'aditions', 'controller'=>'aditions', 'action'=>'get_manifest') )?>">    
<?php } ?>
<head>

    <!-- <link rel="manifest" href="<?php echo $this->Html->url('/aditions/manifest.json')?>"> -->

        <meta charset="utf-8">
        <script type="text/javascript">
        <!--
            // Inicializacion de variable global de url
            var URL_DOMAIN = "<?php echo $this->Html->url('/' ,true);?>";
            var TENANT = "<?php echo  MtSites::getSiteName();?>";
            var RISTO_CUBIERTOS_OBLIGATORIOS = JSON.parse( '<?php echo json_encode( Configure::read('Adicion.cantidadCubiertosObligatorio'), JSON_NUMERIC_CHECK );?>');
            var RISTO_CONFIGURE_SITE = JSON.parse( '<?php echo json_encode( Configure::read('Site'), JSON_NUMERIC_CHECK );?>');
            var RISTO_CONFIGURE_ADICION = JSON.parse( '<?php echo json_encode( Configure::read('Adicion'), JSON_NUMERIC_CHECK );?>');
       
       
        <?php if (Configure::check('Printer.fiscalberry_ip') ) { ?>
            var FISCALBERRYHOST = "<?php echo Configure::read('Printer.fiscalberry_ip');?>";
        <?php } else { ?>
            var FISCALBERRYHOST = "paxaprinter.local";
        <?php } ?> 
       


        -->
        </script>
    
	<?php echo $this->Html->charset(); ?>
	<title>
		<?php echo $title_for_layout; ?>
	</title>
        
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"> 
        <meta name="apple-mobile-web-app-capable" content="yes">


        <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
        <link rel="icon" type="image/png" href="/android-chrome-192x192.png" sizes="192x192">
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
        

        <meta name="msapplication-TileColor" content="#666666">
        <meta name="msapplication-TileImage" content="/mstile-144x144.png">
        <meta name="theme-color" content="#ffffff">
        
    
        <base href="<?php echo $this->Html->url('/')?>" />
            <?php
		
		
		// para los modal window
		echo $this->Html->css(array(
//                    'http://code.jquery.com/mobile/latest/jquery.mobile.min.css',
//                    'jquery-mobile/jquery.mobile-1.0',
                    '/aditions/css/jquery-mobile/jquerymobile.coqus',
//                    'jquery-mobile/jquery.mobile-1.0rc1.min',
//                    'jquery-mobile/jquery-mobile-fluid960',
                    '/aditions/css/jquery-mobile/jquery.mobile.actionsheet',
                    '/aditions/css/ristorantino',
                    '/aditions/css/jquery-mobile/jquery.mobile-custom',
                    ));

                echo $this->element('Risto.per_role_style');
               

                echo $this->Html->script( array(
                        FULL_BASE_URL.':8085/socket.io/socket.io.js',
                        ));
               

                if ( Configure::read('debug') > 0 ) {
                    echo $this->Html->script( array(
                        '/aditions/js/jquery-1.6.4',
                        '/aditions/js/jquery.tmpl.min',
                        '/aditions/js/knockout-2.0.0.min.js',
                        '/aditions/js/knockout.mapping-2.0.debug',
                        '/aditions/js/moment-with-locales.min',
                        '/aditions/js/moment-range',
                        '/aditions/js/cake_saver',
                        '/aditions/js/fiscalberry',
                        '/aditions/js/printer_driver',
                        '/aditions/js/risto',
                        '/aditions/js/adition.package',
                        '/aditions/js/mozo.class',
                        '/aditions/js/adicion.event_handler',
                        '/aditions/js/mesa.estados.class',
                        '/aditions/js/mesa.class',
                        '/aditions/js/comanda.class',
                        '/aditions/js/comanda_fabrica.class',
                        '/aditions/js/adicion.class', // depende de Mozo, Mesa y Comanda
                        '/aditions/js/producto',
                        '/aditions/js/categoria',
                        '/aditions/js/sabor.class',
                        '/aditions/js/cliente.class',
                        '/aditions/js/descuento.class',
                        '/aditions/js/pago.class',
                        '/aditions/js/detalle_comanda.class',
                        '/aditions/js/ko_adicion_model',
                        '/aditions/js/adition.events',
                        '/aditions/js/menu',
                        '/aditions/js/jquery.mobile-1.0.1.min',
                        ));

                        
                        // Para todos los HOteles
                        if ( Configure::check('Site.type') && Configure::read('Site.type') == SITE_TYPE_HOTEL) {
                            // add JS
                            echo $this->Html->script(  array( 
                                '/aditions/js/adicion.grilla.calendar',
                                '/aditions/js/mesa.hotel.class_extend' ,
                                ));
                        }
                } else {
                    if ( Configure::check('Site.type') && Configure::read('Site.type') == SITE_TYPE_HOTEL) {
                        echo $this->Html->script('/aditions/todos_hotel.min');
                    } else {
                        echo $this->Html->script('/aditions/todos.min');
                    }
                }


                // Para todos los HOteles
                if ( Configure::check('Site.type') && Configure::read('Site.type') == SITE_TYPE_HOTEL) {
                    // Add CSS
                    echo $this->Html->css('/aditions/css/ristorantino_hotel');
                }

            ?>
<?php


    //scripts de Cake
    echo $this->element('js_init');
    
    echo $scripts_for_layout;
    
?>



</head>

<body>
	<?php echo $content_for_layout; ?>
</body>



</html>