Ext.define('{{appName}}.store.{{definePath}}',{
   extend: 'Ext.data.Store',
   model: '{{model}}',  
    {{proxy}}     
    autoLoad: true,
       
    sorters: [
        {{sorters}}
    ],
    
    data: [
        {{data}}
    ]
});


