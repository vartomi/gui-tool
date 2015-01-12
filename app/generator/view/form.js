var generator = require('../../lib/generator'),
    path = require('path'),
    logHandler = require('../../loghandler.js'),
    templatePath = path.resolve(__dirname, '../../templates'),
    targetPath = 'webui/app/',
    spec = require('../specification.js'),
    models,
    extPath = 'RapidGui.';

exports.create = function (view, viewsAndRequires) {
   var content = view.content,
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
        configObj.definePath = view.name;
        configObj.xtype = view.alias;
        configObj.title = view.design.title;

        if (!content) {
            throw new Error('Missing contents for form \'' + view.name + '\'')
        }
        
        content.forEach(function (el){
           if (el.design.type === 'text') {
               itemsArray.push('{xtype: ' + com + 'textfield' + com + ', ' +
                       'fieldLabel: ' + com + el.name + com + '}');
            } else if (el.design.type == 'password') {
                itemsArray.push('{xtype: ' + com + 'textfield' + com + ', ' +
                        'fieldLabel: ' + com + el.name + com + ',' +
                        'inputType: ' + com + el.type + com + '}'
                        )
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
     
     itemPath = com + extPath + 'view.' + view.name + com;
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
}

var createFields = function (model) {
    var i,
        label,
        fieldtype,
        items = [],
        com = '\'';
    
    for(i = 0; i < models.length; i++) {
        if (models[i].name === model) {
            models[i].fields.forEach(function (field) {
                label = field[0].toUpperCase() + field.substring(1, field.length);
                items.push('{xtype: ' + com + 'textfield' + com + ', ' +
                        'name: ' + com + field + com + ', ' +
                       'fieldLabel: ' + com + label + com + '}');
            });
            models[i].typedFields.forEach(function (field) {
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
            });
            
            break;
        }
    }
    return items;
}

