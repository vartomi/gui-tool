Ext.define('RapidGui.controller.{{definePath}}', {
    extend: 'Ext.app.Controller',

    init: function() {
        this.control({
           {{controls}}
        });
    },

    {{controlFunctions}}
});


