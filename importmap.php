<?php

/**
 * Returns the importmap for this application.
 *
 * - "path" is a path inside the asset mapper system. Use the
 *     "debug:asset-map" command to see the full list of paths.
 *
 * - "entrypoint" (JavaScript only) set to true for any module that will
 *     be used as an "entrypoint" (and passed to the importmap() Twig function).
 *
 * The "importmap:require" command can be used to add new entries to this file.
 *
 * This file has been auto-generated by the importmap commands.
 */
return [
    'js/layout/fen/elems.js' => [
        'path' => './assets/js/layout/fen/elems.js',
        'entrypoint' => true,
    ],
    'js/layout/rav/elems.js' => [
        'path' => './assets/js/layout/rav/elems.js',
        'entrypoint' => true,
    ],
    'js/layout/play/elems.js' => [
        'path' => './assets/js/layout/play/elems.js',
        'entrypoint' => true,
    ],
    'js/layout/san/elems.js' => [
        'path' => './assets/js/layout/san/elems.js',
        'entrypoint' => true,
    ],
    'js/layout/stockfish/elems.js' => [
        'path' => './assets/js/layout/stockfish/elems.js',
        'entrypoint' => true,
    ],
    '@chesslablab/cmblab' => [
        'version' => '0.0.1',
    ],
    '@chesslablab/jsblab' => [
        'version' => '0.1.4',
    ],
    'bootstrap' => [
        'version' => '5.3.2',
    ],
    'bootstrap/dist/js/bootstrap.bundle.min.js' => [
        'version' => '5.3.2',
    ],
    'bootstrap/dist/css/bootstrap.min.css' => [
        'version' => '5.3.2',
        'type' => 'css',
    ],
    'bootstrap/js/dist/modal.js' => [
        'version' => '5.3.2',
    ],
    'jwt-decode' => [
        'version' => '4.0.0',
    ],
];
