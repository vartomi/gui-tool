#!/usr/bin/env node
/*jshint node: true */
'use strict';

/**
 * GuiTool command-line utility
 */
(function() {
    var program = require('commander');
    var thisPackage = require(__dirname + '/../package.json');
    var compile = false;
    program._name = thisPackage.name;

    // Setup the project generator command
    program
        .version(thisPackage.version)
        .command('init [name]')
        .description('Init a gui-tool project structure')
        .option('-r, --reset', 're-generate structure')
        .option('-e, --extjs <extjs_path>', 'init with given extjs framework')
        .option('-s, --siesta <siesta_path>', 'init with given siesta framework')
        .action(function(dir, options) {
            require('../guigen.js').init(dir, options);
        });
    
    program
        .version(thisPackage.version)
        .command('generate')
        .description('Generate the ExtJS components with Siesta test skeletons')
        .option('-s, --spec <spec_path>', 'generate from the given specification file')
        .option('-c, --compile', 'run sencha building process after creation', true)
        .option('-f, --force', 'overwrite existing generated files', true)
        .action(function(options) {
            require('../guigen.js').generate(options);
        });

    program
        .command('run')
        .description('Run the generated application. Development server will be started')
        .option('-o, --open <browser_name>', 'open the application in given browser')
        .option('-p, --prod', 'start another instance of the webserver in production mode')
        .action(function(options){
            require('../guigen.js').startBrowsers(options);
    });
    
    program
        .command('test')
        .description('Open the test page.')        
        .option('-r, --run', 'Run the tests with phantomJS')
        .action(function(options){
            require('../guigen.js').startBrowsers(options);
    });
    
    program.parse(process.argv);
})();