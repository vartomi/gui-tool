//--------------------------------------// 
//  IT'S REQUIRED FOR THE AUTO REFRESH  //
Ext.Loader.loadScript({
    url: 'https://cdn.socket.io/socket.io-1.3.4.js',
    onLoad: function () {
    var socket = io();
    socket.on('app change', function(msg) {
        window.location.reload();
    });
}});
//--------------------------------------//
Ext.define('{{appName}}.Application', {
    name: '{{appName}}',
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