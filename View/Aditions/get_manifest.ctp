CACHE MANIFEST
# 2017-02-04 10:09 :v1


# Explicitly cached entries
<?php
// home page
echo $this->Html->url( array('plugin'=>'risto', 'controller'=>'pages', 'action'=>'display', 'dashboard'), true). "\n";
echo $this->Html->url( array('plugin'=>'users', 'controller'=>'users', 'action'=>'tenant_login'), true). "\n";
echo $this->Html->url( array('plugin'=>'aditions', 'controller'=>'aditions', 'action'=>'adicionar'), true). "\n";


//scripts de Cake
echo $this->Html->url( array('plugin'=>'aditions', 'controller'=>'aditions', 'action'=>'js_init'), true). "\n";

echo $this->Html->url ("/apple-touch-icon-57x57.png", true). "\n";
echo $this->Html->url ("/apple-touch-icon-60x60.png", true). "\n";
echo $this->Html->url ("/apple-touch-icon-72x72.png", true). "\n";
echo $this->Html->url ("/apple-touch-icon-76x76.png", true). "\n";
echo $this->Html->url ("/apple-touch-icon-114x114.png", true). "\n";
echo $this->Html->url ("/apple-touch-icon-120x120.png", true). "\n";
echo $this->Html->url ("/apple-touch-icon-144x144.png", true). "\n";
echo $this->Html->url ("/apple-touch-icon-152x152.png", true). "\n";
echo $this->Html->url ("/apple-touch-icon-180x180.png", true). "\n";
echo $this->Html->url ("/favicon-32x32.png", true). "\n";
echo $this->Html->url ("/android-chrome-192x192.png", true ) . "\n";
echo $this->Html->url ("/favicon-96x96.png", true ) . "\n";
echo $this->Html->url ("/favicon-16x16.png", true ) . "\n";
echo $this->Html->url( "/mstile-144x144.png", true) . "\n";
echo $this->Html->url( "/aditions/css/jquery-mobile/images/ajax-loader.png ", true) . "\n";
echo $this->Html->url( "/aditions/css/img/loading.gif", true) . "\n";
echo $this->Html->url( "/aditions/css/jquery-mobile/images/icons-18-white.png", true) . "\n";




echo $this->Html->url('/aditions/css/jquery-mobile/jquerymobile.coqus.css', true)."\n";
echo $this->Html->url('/aditions/css/jquery-mobile/jquery.mobile.actionsheet.css', true)."\n";
echo $this->Html->url('/aditions/css/ristorantino.css', true)."\n";
echo $this->Html->url('/aditions/css/jquery-mobile/jquery.mobile-custom.css', true)."\n";



if ( Configure::check('Site.type') && Configure::read('Site.type') == SITE_TYPE_HOTEL ) {
    echo $this->Html->url('/aditions/todos_hotel.min.js', true)."\n";
} else {
    echo $this->Html->url('/aditions/todos.js', true)."\n";
}


if ( Configure::check('Site.type') && Configure::read('Site.type') == SITE_TYPE_HOTEL) {
    // add JS
        echo $this->Html->url( '/aditions/js/adicion.grilla.calendar.js', true). "\n";
        echo $this->Html->url( '/aditions/js/mesa.hotel.class_extend.js', true). "\n";
}


// Para todos los HOteles
if ( Configure::check('Site.type') && Configure::read('Site.type') == SITE_TYPE_HOTEL) {
    // Add CSS
    echo $this->Html->url('/aditions/css/ristorantino_hotel.css', true). "\n";
}



$Media = ClassRegistry::init("Risto.Media");

echo "# listado de categorias\n";
foreach ($categorias as $cat=>$mediaId) {
	if ( $mediaId & $Media->exists($mediaId) ) {
		echo $this->Html->url(array('plugin'=>'risto', 'controller'=>'medias', 'action'=>'view', $mediaId))."\n";
	}
}

echo "# listado de mozos\n";
foreach ($mozos as $mozo) {
	$mediaId = (int)$mozo['Mozo']['media_id'];
	if ( $mediaId && $Media->exists($mediaId) ) {
		echo $this->Html->url(array('plugin'=>'risto', 'controller'=>'medias', 'action'=>'view', $mediaId))."\n";
		echo $this->Html->url(array('plugin'=>'risto', 'controller'=>'medias', 'action'=>'thumb', $mediaId, 88,88))."\n";
	}
}



echo "# listado de tipos de pago\n";
foreach ($tipo_de_pagos as $mediaId) {
	if ( $mediaId & $Media->exists($mediaId) ) {
		echo $this->Html->url(array('plugin'=>'risto', 'controller'=>'medias', 'action'=>'view', $mediaId))."\n";
	}
}



echo "#mesa-view";
echo $this->Html->url( '/paxapos/img/isologo_rojo.png', true). "\n";
echo $this->Html->url( '/img/mesa-abrio.png', true)."\n";
echo $this->Html->url( '/img/mozomoniob.png', true)."\n";
echo $this->Html->url( '/aditions/css/img/products_64.png', true ). "\n";
echo $this->Html->url( '/aditions/css/img/customers.png', true ). "\n";
echo $this->Html->url( '/aditions/css/img/cerrarmesa.png') . "\n";
echo $this->Html->url( '/aditions/css/img/cobrar.png', true) ."\n";
echo $this->Html->url( '/aditions/css/img/printer.png', true) ."\n";
echo $this->Html->url( '/aditions/css/img/printernc.png', true) ."\n";
echo $this->Html->url( '/aditions/css/img/checkout.png', true) ."\n";
echo $this->Html->url( '/aditions/css/img/cambiarmozo.png', true) ."\n";
echo $this->Html->url( '/aditions/css/img/cambiarmesa.png', true) ."\n";
echo $this->Html->url( '/aditions/css/img/reabrir.png', true) ."\n";
echo $this->Html->url( '/aditions/css/img/write.png', true) ."\n";
echo $this->Html->url( '/aditions/css/img/borrarmesa.png', true) ."\n";
echo $this->Html->url( '/aditions/css/img/editarmesa.png', true) ."\n";




echo $this->Html->url( '/risto/css/risto_base_style.css', true) ."\n";


echo $this->Html->url('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css')."\n";
echo $this->Html->url('/paxapos/css/paxapos-bootstrap-supernice.css', true). "\n";
echo $this->Html->url('/risto/css/ristorantino/style.css', true). "\n";
echo $this->Html->url('/risto/lib/bootstrap_datetimepicker/css/bootstrap-datetimepicker.min.css', true). "\n";
echo $this->Html->url('/risto/css/ristorantino/print.css', true). "\n";



// CSS by Rol
if ( $this->Session->check('Auth.User.Rol') ) {
    $roles = $this->Session->read('Auth.User.Rol');

    foreach ($roles as $r ) {
    	$rcss = "acl-" . $r['machin_name'];
        $ppath = App::pluginPath('Risto');
        if ( file_exists( $ppath . DS . 'webroot' . DS . 'css' . DS . $rcss . '.css') ) {
            echo $this->Html->url('/risto/css/'.$rcss.".css");
        }
    }
}



echo $this->Html->url( 'https://code.jquery.com/jquery-2.2.4.min.js', true ). "\n";
echo $this->Html->url( 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js', true ). "\n";
echo $this->Html->url( '/risto/lib/bootstrap_datetimepicker/js/bootstrap-datetimepicker.min.js', true ). "\n";

echo $this->Html->url( '/risto/js/jquery/jquery-ui.js', true)."\n";
echo $this->Html->url( '/paxapos/img/logotip_azul_con_isologo_rojo.png', true). "\n";



echo $this->Html->url( '/risto/font-awesome-4.6.3/css/font-awesome.min.css', true). "\n";
echo $this->Html->url( '/risto/css/layout_header_late.css', true). "\n";
echo $this->Html->url( '/risto/css/ristorantino/home/ristorantino.dashboard.css', true). "\n";
echo $this->Html->url( '/risto/js/layout_header_late.js', true). "\n";



?>

https://fonts.googleapis.com/css?family=Merriweather+Sans:700,400,300



# offline.html will be displayed if the user is offline
# FALLBACK:
<?php echo $this->Html->url( array('plugin'=>'risto', 'controller'=>'pages', 'action'=>'display', 'dashboard'), true). " ".$this->Html->url( array('plugin'=>'risto', 'controller'=>'pages', 'action'=>'display', 'dashboard_offline'), true)."\n";
 ?>

# All other resources (e.g. sites) require the user to be online. 
NETWORK:
<?php echo $this->Html->url( array('plugin'=>'aditions', 'controller'=>'aditions', 'action'=>'js_mesas_init'), true). "\n"; ?>
*

# Additional resources to cache
# CACHE: