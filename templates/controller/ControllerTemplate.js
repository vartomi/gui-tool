Ext.define('{{appName}}.controller.{{definePath}}', {
    extend: 'Ext.app.Controller',

    init: function() {
        this.control({
           {{controls}}
        });
    },

    {{controlFunctions}}
});


