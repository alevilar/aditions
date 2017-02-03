<?php

Router::connect('/:tenant/aditions/adicionar', array('plugin'=>'aditions', 'controller' => 'aditions', 'action' => 'adicionar'));


Router::connect('/:tenant/adition.appcache', array('plugin'=>'aditions', 'controller' => 'aditions', 'action' => 'get_manifest'));

