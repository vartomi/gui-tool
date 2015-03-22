var generator = require('../../lib/generator'),
    path = require('path'),
    logHandler = require('../../loghandler.js'),
    spec = require('../specification.js'),
    templatePath = path.resolve(__dirname, '../../templates'),
    targetPath = 'webui/app/',
    application = require('../application.js');

exports.create = function (view, viewsAndRequires) {
    var appName = application.getAppName(),
        content = view.dataContent,
        buttons = view.buttons,
        models = spec.getSpecification().models,
        configObj = {},
        i,
        fieldtype,
        editor,
        columnsArray = [],
        pluginsArray = [],
        viewsArray = [],
        requiresArray = [],
        itemPath,
        com = '\'';
    try {
        configObj.appName = appName;
        configObj.definePath = view.name;
        configObj.xtype = view.alias;
        configObj.title = view.layout.title || view.name;   
        configObj.optionalConfig = '';
        
        
        
        if (!content) {
            throw new Error('Missing data content for grid \'' + view.name + '\'');
        }
        
        configObj.store = appName + '.store.' + content.model + 's';
        
        if(content.edit) {            
            editor = 'editor: ';
            pluginsArray.push('\'rowediting\'');
            requiresArray.push('\'Ext.grid.plugin.RowEditing\'');
            configObj.optionalConfig += 'selType: \'rowmodel\',\n';
        }
        
        if(content.bigData) {
            pluginsArray.push('{ptype: \'rowexpander\',\n' +
                      'rowBodyTpl : new Ext.XTemplate(\n' +
                        '\'{[Ext.util.Format.htmlDecode(\\\'<b>' + content.bigData +
                        ':</b>\\\')]} {' + content.bigData + '}\'\n' +
                        ')' +
            '}');
            requiresArray.push('\'Ext.grid.plugin.RowExpander\'');
        }

        models.forEach(function (model) {
           if (model.name === content.model){
               for(i = 0; i<model.fields.length; i++){
                   columnsArray.push(
                       '{text: ' + com + model.fields[i] + com + ', ' +
                       'dataIndex:' + com + model.fields[i] + com + ', ' +
                       (editor ? editor + '\'textfield\', ' : '') +
                       'flex: 1}'
                        );
               }
               for(i = 0; i<model.typedFields.length; i++){
                   if (model.typedFields[i].type === 'date') {
                        fieldtype = 'datefield';
                        requiresArray.push('\'Ext.form.field.Date\'');
                    } else if (model.typedFields[i].type === 'int' || model.typedFields[i].type === 'float') {
                        fieldtype = 'numberfield';
                        requiresArray.push('\'Ext.form.field.Number\'');
                    } else {
                        fieldtype = 'textfield';
                    }
                   columnsArray.push(
                       '{text: ' + com + model.typedFields[i].name + com + ', ' +
                       'dataIndex: ' + com + model.typedFields[i].name + com + ', ' +
                       (editor ? editor + '\'' + fieldtype + '\', ' : '') +
                       'flex: 1}'
                        );
               }               
           } 
        });   
                
        configObj.columns = columnsArray.join(',\n');
        configObj.plugins = pluginsArray.join(',');
        
        configObj.optionalConfig += 'dockedItems: [{\n' +
                        'xtype: \'toolbar\',\n' +
                        'dock: \'top\',\n' +
                        'enableOverflow: true,\n' +
                        'items: [\n';
        
        if (buttons) {
            
            for(i = 0; i < buttons.length; i++){
                configObj.optionalConfig += '{xtype: \'button\',\n' +
                        'itemId: \'' + buttons[i] + 'Btn\',\n' +
                        'text: \'' + buttons[i] + '\'},\n';
            }
            
        }
        
        if (content.filter) {
            configObj.optionalConfig += '{xtype: \'tbfill\'},\n';
            content.filter.forEach(function (filter) {
                if (filter.type === 'check') {
                    configObj.optionalConfig += '{xtype: \'label\',\n' +
                            'text: \'' + filter.field + ':\'},\n';
                    for(i = 0; i < filter.items.length; i++) {
                        configObj.optionalConfig += '{xtype: \'checkbox\',\n' +
                                'itemId: \'' + filter.items[i] + '.' + filter.field + 
                                '\',\n' + 
                                'boxLabel: \'' + filter.items[i] + '\'},\n';
                    }
                    requiresArray.push('\'Ext.form.field.Checkbox\'');
                    requiresArray.push('\'Ext.form.Label\'');
                } else if (filter.type === 'text') {
                    configObj.optionalConfig += '{xtype: \'textfield\',\n' +
                            'itemId: \'' + filter.alias + 'Textfield\',\n' +
                            'emptyText: \'search for column: ' + filter.field + '\'},\n'; 
                }
                configObj.optionalConfig += '{xtype: \'tbfill\'},\n';
            });
        }
        
        configObj.optionalConfig += ']}],';        
                  
    } catch (e) {
        logHandler.error(e);    
    }
    generator.processTemplate(configObj, {
            sourceBaseDir: templatePath + '/view',
            targetBaseDir: targetPath + '/view',
            template: 'GridTemplate.js',            
            fileName: view.name + '.js'
     });
     
     
     itemPath = com + appName + '.view.' + view.name + com;
     logHandler.itemLog(itemPath);
     viewsArray.push(itemPath);
     
     if (!viewsAndRequires.views) {
         viewsAndRequires.views = '';
     } else {
         viewsAndRequires.views += ',\n';
     }
     viewsAndRequires.views += viewsArray.join(',\n');   
     
      if (!viewsAndRequires.requires) {
            viewsAndRequires.requires = '';         
        } else {
            if (requiresArray.length > 0) {
                viewsAndRequires.requires += ',\n';
            }
        }
        viewsAndRequires.requires += requiresArray.join(',\n');
};





