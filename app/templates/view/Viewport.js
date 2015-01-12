Ext.define('RapidGui.view.Viewport', {
    id: 'viewport',
    requires:[
        'Ext.layout.container.Border',
        {{viewportRequires}}
    ],
    extend: 'Ext.container.Viewport',
    
    layout: {
        type: 'vbox',
        align: 'stretch'
     },
    
    items: [
        {{items}}
    ]
});


