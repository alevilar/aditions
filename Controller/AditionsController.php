<?php 


App::uses('AditionsAppController', 'Aditions.Controller');



class AditionsController extends AditionsAppController {
    
	public $uses = array('Mesa.Mozo','Mesa.Mesa','Product.Categoria', 'Printers.Printer');
	public $current_mozo_id;
	public $current_mesa_id;
	public $current_mesa_numero;
	public $layout = 'adicion';


	function home()
        {
            $this->set('mozos',$this->Mozo->dameActivos());
	}

	
	
	/**
	 * 
	 * esta es la accion para que adicione la adicion
	 * la diferencia aca es que se van amostrar todas las mesas abiertas independientemente del mozo
	 * @return unknown_type
	 */
	function adicionar()
        {
        	$this->Printer->recursive = -1;
        	$this->set('categorias', $this->Categoria->array_listado());
            $this->set('tipo_de_pagos', $this->Mozo->Mesa->Pago->TipoDePago->find('all'));
            $this->set('mesas', $this->Mozo->mesasAbiertas());
            $this->set('mozos', $this->Mozo->dameActivos());
            $this->set('printer', $this->Printer->read(null, Configure::read('Printers.fiscal_id') ));
            $this->set('comanderaPpal', $this->Printer->read(null, Configure::read('Printers.receipt_id') ));
            $this->set('printers', $this->Printer->find('all', array('recursive'=>-1)));
            $this->set('observaciones', ClassRegistry::init('Comanda.Observacion')->find('list', array('order' => 'Observacion.name')));
            $this->set('observacionesComanda', ClassRegistry::init('Comanda.ObservacionComanda')->find('list', array('order' => 'ObservacionComanda.name')));
	}


	function js_init() {
		$this->layout = false;
		$this->response->header( 'Content-type', "application/javascript");

		$this->Printer->recursive = -1;
    	$this->set('categorias', $this->Categoria->array_listado());
        $this->set('tipo_de_pagos', $this->Mozo->Mesa->Pago->TipoDePago->find('all'));
        $this->set('mesas', $this->Mozo->mesasAbiertas());
        $this->set('mozos', $this->Mozo->dameActivos());
        $this->set('printer', $this->Printer->read(null, Configure::read('Printers.fiscal_id') ));
        $this->set('comanderaPpal', $this->Printer->read(null, Configure::read('Printers.receipt_id') ));
        $this->set('printers', $this->Printer->find('all', array('recursive'=>-1)));
        $this->set('observaciones', ClassRegistry::init('Comanda.Observacion')->find('list', array('order' => 'Observacion.name')));
        $this->set('observacionesComanda', ClassRegistry::init('Comanda.ObservacionComanda')->find('list', array('order' => 'ObservacionComanda.name')));
		
	}


	function get_manifest(){
		$this->layout = false;
		$this->response->header( 'Content-type', "text/cache-manifest");


		$this->set('categorias', $this->Categoria->find('list', array(
			'fields' => array('id', 'media_id')
			)));

		$this->set('tipo_de_pagos', $this->Mozo->Mesa->Pago->TipoDePago->find('list', array(
			'fields' => array('id', 'media_id')
			)));

		$this->set('mozos', $this->Mozo->dameActivos());
	}
    

	
}
