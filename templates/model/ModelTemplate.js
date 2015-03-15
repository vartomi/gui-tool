Ext.define('RapidGui.model.{{definePath}}', {
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


