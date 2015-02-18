//--------------------------------------// 
//  IT'S REQUIRED FOR THE AUTO REFRESH  //
Ext.Loader.injectScriptElement('https://cdn.socket.io/socket.io-1.3.4.js', function () {
    var socket = io();
    socket.on('app change', function(msg) {
        window.location.reload();
    });
});
//--------------------------------------//
Ext.define('RapidGui.Application', {
    name: 'RapidGui',
    extend: 'Ext.app.Application',
    requires: [
        {{appRequires}}
    ],
    views: [
        {{views}}
    ],
    controllers: [
        {{controllers}}
    ],
    models: [
        {{models}}
    ],
    stores: [
        {{stores}}
    ]
});
