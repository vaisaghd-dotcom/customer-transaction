const mix = require('laravel-mix');

mix.js('resources/js/panel.js', 'public/js')
   .setPublicPath('public')
   .version();