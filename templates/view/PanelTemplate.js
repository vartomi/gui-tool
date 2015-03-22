Ext.define('{{appName}}.view.{{definePath}}',{
    extend: 'Ext.panel.Panel',
    alias: 'widget.{{xtype}}',
    
    height: '100%',
    title: '{{title}}',
    
    padding: 5,
    
    layout: 'fit',
    
    items: [
        {{items}}
    ]
    
});


