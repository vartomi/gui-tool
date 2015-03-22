Ext.define('{{appName}}.view.{{definePath}}',{
    extend: 'Ext.grid.Panel',
    alias: 'widget.{{xtype}}',
    collapsible: true,
    store: '{{store}}',
    height: '100%',
    title: '{{title}}',
        
    {{optionalConfig}}
    
    columns: [
        {{columns}}
    ],
    
    plugins: [
        {{plugins}}
    ]
});


