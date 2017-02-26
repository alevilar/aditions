window.addEventListener("load", function load(event){
    <?php
    $mesas = json_encode($mesas);
    ?>

    var jsonMesas = <?php echo $mesas; ?>;

    Risto.Adition.adicionar.initialize( jsonMesas );


     var categorias = <?php echo json_encode($categorias, JSON_NUMERIC_CHECK); ?>;
    Risto.Adition.menu.updateLocal( categorias );



   
    // unset, free var
    delete jsonMesas;
    delete categorias;

});