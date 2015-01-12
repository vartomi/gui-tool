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


