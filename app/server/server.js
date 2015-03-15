/*jshint node: true */
"use strict";

var express = require( 'express' ),
    fs = require('fs');
require('colors');

// Get configured
var config = {},
    documentRoot = {};

var withoutLog = false;
exports.config = config;
if( process.argv.length >= 3) {
    var baseConfig = require( './config.js' );
    config = baseConfig.setEnvironment( process.argv[2] );
    documentRoot = process.argv[3];
} else {
    config = require( './config.js' ).parameters;
}

console.log('document root: %s', documentRoot);

if (process.argv.indexOf('without-log')){
    withoutLog = true;
}

var server = module.exports = express();
server.set('env', config.environment );

// Configure the middlewares
server.configure( function() {
        server.use( express.bodyParser() );
        server.use( express.methodOverride() );
        server.use( express.cookieParser() );
        server.use( express.session( {secret: 'keyboard cat'} ) );
        server.use( server.router );
        server.use( express.static( documentRoot ) );
        server.use( '/test', express.static( documentRoot + '/../test'));
    });

server.configure( 'development', function() {
        server.use( express.errorHandler( {
                    dumpExceptions: true,
                    showStack: true
                }));
    });

server.configure( 'production', function() {
        server.use( express.errorHandler() );
    });

function restrict( req, res, next ) {
    next();
}

function accessLogger( req, res, next ) {
    if (!withoutLog)
        console.log( req.method, req.url );
    next();
}

var io = require('socket.io').listen(server.listen( config.port));

io.on('connection', function (socket) {   
    fs.watchFile(documentRoot + '/app/Application.js', function (curr, prev) { 
        io.emit('app change', curr);     
    });
});
// Routes
server.all("*", accessLogger, restrict);

process.on('exit', function() { server.close(); });

// Start the server to listen
//server.listen( config.port );
console.log( 'server  listening on port ' +  '%d'.bold.yellow + ' in %s mode',
    config.port, server.settings.env );
