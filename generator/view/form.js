var generator = require('../../lib/generator'),
    path = require('path'),
    logHandler = require('../../loghandler.js'),
    templatePath = path.resolve(__dirname, '../../templates'),
    targetPath = 'webui/app/',
    spec = require('../specification.js'),
    application = require('../application.js'),
    models;

exports.create = function (view, viewsAndRequires) {
    var appName = application.getAppName(),
        content = view.content,
        buttons = view.buttons,
        dataContent = view.dataContent,
        configObj = {},
        itemsArray = [],
        buttonsArray = [],
        viewsArray = [],
        requiresArray = [],
        itemPath,
        com = '\'';
    
    models = spec.getSpecification().models;
    try {
        configObj.appName = appName;
        configObj.definePath = view.name;
        configObj.xtype = view.alias;
        configObj.title = view.layout.title;

        if (!content) {
            throw new Error('Missing contents for form \'' + view.name + '\'');
        }
        
        content.forEach(function (el){
           if (el.layout.type === 'text') {
               itemsArray.push('{xtype: ' + com + 'textfield' + com + ', ' +
                       'fieldLabel: ' + com + el.name + com + '}');
           } else if (el.layout.type === 'password') {
                itemsArray.push('{xtype: ' + com + 'textfield' + com + ', ' +
                        'fieldLabel: ' + com + el.name + com + ',' +
                        'inputType: ' + com + el.type + com + '}'
                        );
            }
        });
                
        if (dataContent) {
            itemsArray = createFields(dataContent.model);
            requiresArray.push('\'Ext.form.field.Date\'');
        }
        
        configObj.items = itemsArray.join(',\n');
        
        if (buttons) {
            buttons.forEach(function (but){
                buttonsArray.push('{text: ' + com + but + com + ',\n' +
                                  'itemId: ' + com + but + 'Btn' + com + '}');
            });
        }
        
        configObj.buttons = buttonsArray.join(',');
  
    } catch (e) {
        logHandler.error(e);    
    }
    generator.processTemplate(configObj, {
            sourceBaseDir: templatePath + '/view',
            targetBaseDir: targetPath + '/view',
            template: 'FormTemplate.js',
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

var createFields = function (model) {
    var i, j,
        label,
        fieldtype,
        field,
        items = [],
        com = '\'';
    
    for(i = 0; i < models.length; i++) {
        if (models[i].name === model) {
            for (j = 0; j < models[i].fields.length; j++) {
                field = models[i].fields[j];
                label = field[0].toUpperCase() + field.substring(1, field.length);
                items.push('{xtype: ' + com + 'textfield' + com + ', ' +
                        'name: ' + com + field + com + ', ' +
                       'fieldLabel: ' + com + label + com + '}');
            }
            for (j = 0; j <  models[i].typedFields.length; j++) {
                field = models[i].typedFields[j];
                label = field.name[0].toUpperCase() + field.name.substring(1, field.name.length);
                if (field.type === 'date') {
                    fieldtype = 'datefield';
                } else if (field.type === 'int' || field.type === 'float') {
                    fieldtype = 'numberfield';
                } else {
                    fieldtype = 'textfield';
                }
                items.push('{xtype: ' + com + fieldtype + com + ', ' +
                        'name: ' + com + field.name + com + ', ' +
                       'fieldLabel: ' + com + label + com + '}');
            }
            
            break;
        }
    }
    return items;
};

