<h3>Informes Fiscales</h3>


<div class="ui-grid-a">
    <div class="ui-block-a">
        <a href="#listado-mesas-cerradas" 
           data-role="button" 
           data-href="<?php echo $this->Html->url(array('plugin'=>'printers', 'controller'=>'printers', 'action'=>'cierre', 'x'));?>" 
           data-direction="reverse">
           Imprimir informe "X"
       </a>
    </div>
    <div class="ui-block-b">
        <a href="#listado-mesas-cerradas" 
           data-role="button" 
           data-href="<?php echo $this->Html->url(array('plugin'=>'printers', 'controller'=>'printers', 'action'=>'cierre', 'z'));?>" 
           data-direction="reverse">
           Imprimir informe "Z"
       </a>
   </div>
</div>
<a href="<?php echo $this->Html->url(array('plugin'=>'printers', 'controller'=>'printers', 'action'=>'nota_credito'));?>" data-role="button">Nota de crédito</a>

<hr />