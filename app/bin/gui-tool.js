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
        .description('Init project structure')
        .option('-r, --reset', 'Reset the project structure')
        .action(function(dir, options) {
            require('../guigen.js').init(dir, options);
        });
    
    program
        .version(thisPackage.version)
        .command('create')
        .description('Generate GUI files')
        .option("-s, --spec <file>", "Set specification file's path")
        .option("-c, --compile", "Run sencha build", true)
        .option("-f, --force", "Remove existing files firstly", true)
        .action(function(options) {
            require('../guigen.js').generate(options);
        });

    program
        .command('start')
        .description('Start a node.js servers for this application')
        .option("-o, --open", "Open the application(s) in default browser")
        .option("-t, --test" ,"Open the application (development) in IE, Chrome, Firefox")
        .option("-w, --web-dev", "Start only the host webserver in development mode")
        .option("-b, --web-prod", "Start only the host webserver in production mode, builded ExtJS files are used")
        .action(function(options) {
            require('../guigen.js').startServer(options);
    });
        
    program
        .command('test')
        .description('Test the application: open in different browsers, open the test page or simply run the tests')
        .option("-r, --run", "Run the tests with phantomJS")
        .option("-o, --open", "Open the application in IE, Chrome, Firefox'")
        .option("-p, --page", "Open the test page in default browser")
        .action(function(options){
            require('../guigen.js').startBrowsers(options);
    });
    
    program
            .command('phantom')
            .action(function (options){
                require('../guigen.js').test(options);
    });
    
    program.parse(process.argv);
})();