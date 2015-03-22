Ext.define('{{appName}}.view.{{definePath}}',{
    extend: 'Ext.form.Panel',
    alias: 'widget.{{xtype}}',
    collapsible: true,
    height: '100%',
    title: '{{title}}',
    
    autoScroll: true,
        
    bodyPadding: 10,
        
    items: [
        {{items}}
    ],
    
    buttons: [
        {{buttons}}
    ]
});

