Ext.define('{{appName}}.model.{{definePath}}', {
   extend: 'Ext.data.Model', 
   
   fields: [
       {{fields}}
   ],
   
   hasMany:[
       {{hasMany}}
   ],
   
   hasOne: [
       {{hasOne}}
   ]
});


