Ext.define('{{appName}}.view.{{definePath}}', {
    extend: 'Ext.window.Window',
    xtype: '{{xtype}}',
    
    height: {{height}},
    width: {{width}},
    title: '{{title}}',
    
    autoScroll: true,
    
    items: [
        {{items}}
    ],
    
    bodyPadding: 10
});


