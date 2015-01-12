Ext.define('RapidGui.store.{{definePath}}',{
   extend: 'Ext.data.Store',
   model: '{{model}}',
   
   proxy: {
       type: 'ajax',
       url: '{{proxyUrl}}',
       reader: {
           type: 'json',
           root: 'result.data'
       },
    },
    
    autoLoad: true,
       
    sorters: [
        {{sorters}}
    ]
});


