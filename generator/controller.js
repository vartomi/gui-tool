var generator = require('../lib/generator'),
    path = require('path'),
    logHandler = require('../loghandler.js'),
    templatePath = path.resolve(__dirname, '../templates'),
    targetPath = 'webui/app/',
    application = require('./application.js'),
    spec = require('./specification.js'),
    models,
    staticViews,
    types = require('./dictonary.js').typeToExtJSEvent,
    cmds = require('./dictonary.js').cmdToExtJSFunc;


var filterFn = function (field, compare) {
    return 'function (r, id) {\n' +
                'if (r.get(' + field + ') === ' + compare + ') {\n' +
                    'return true;\n' +
                '}\n' +
            '}';
};
    
var filterAnyFn = function (compare) {
    return 'function(r, id) {\n' +
                'var fields = r.fields,\n' +
                'found = false;\n' + 
                'fields.each(function (field) {\n' +
                    'if (r.get(field.name).toString().indexOf(newValue) !== -1) {\n' +
                        'found = true;\n' + 
                    '}\n' +
                '});\n' +
                'if (found) {\n' +
                    'return true;\n' +
                '}\n' +
            '}';
};
    
var sorterFn = '';
var loadFn = '';

exports.create = function (useCases) {
    var appName = application.getAppName(),
        viewName,
        selector,
        i,
        obj,
        controllersArray = [],
        controllersObjs = {},
        com = '\'';
        
    models = spec.getSpecification().models;
    staticViews = spec.getSpecification().views;
   
    useCases.forEach(function (useCase) {
        var controlName,
            control,
            configObj = {controls: '', controlFunctions: ''};
        try {
            viewName = useCase.on.substring(0, useCase.on.indexOf('.'));

            if (!viewName) {
                viewName = useCase.on;
            }
            viewName = viewName[0].toUpperCase() + viewName.substring(1, viewName.length);

            selector = useCase.on.split('.');
            selector = selector.join(' ');

            if (!controllersObjs[viewName]) {  
                controllersObjs[viewName] = configObj;
                controllersObjs[viewName].definePath = viewName;
            } 
            control = addControl(selector, useCase.type);

            controllersObjs[viewName].appName = appName;
            controllersObjs[viewName].controls += control.controlString + ',\n';
            controllersObjs[viewName].controlFunctions += addFunction(control.name, useCase.do, control.parameterString) + ',\n';

        } catch (e) {
            logHandler.error(e);    
        }  
        
    });
        
    for(var i in controllersObjs){
        obj = controllersObjs[i];
        generator.processTemplate(obj, {
            sourceBaseDir: templatePath + '/controller',
            targetBaseDir: targetPath + '/controller',
            template: 'ControllerTemplate.js',
            fileName: i + '.js'
        });

        itemPath = com + appName + '.controller.' + i + com;
        logHandler.itemLog(itemPath);
        controllersArray.push(itemPath);
    }
        
       return controllersArray.join(',\n');
}

var addControl = function (selector, type) {
    var control,
        controlName,
        selectors,
        eventType,
        params,
        xtype;
    
    controlName = 'on';
    
    
    
    selectors = selector.split(' ');
    
    xtype = selectors[selectors.length -1].toLowerCase();
    
    if (xtype.indexOf('list') > -1 || xtype.indexOf('grid') > -1) {
        xtype = 'grid';
    } else if (xtype.indexOf('btn') > -1) {
        xtype = 'button';
    } else if (xtype.indexOf('chk') > -1 || xtype.indexOf('checkbox') > -1) {
        xtype = 'checkbox';
    } else if (xtype.indexOf('form') > -1) {
        xtype = 'form';
    } else if (xtype.indexOf('window') > -1) {
        xtype = 'window';
    } else if (xtype.indexOf('textfield') > -1) {
        xtype = 'textfield';
    } else {
        throw new Error('Invalid type name in alias \'' + xtype + '\'\n' +
                ' it should contain one of the following [list, btn, form, window, chk, checkbox, textfield]');
    }
        
    try {
        eventType = types[type][xtype];
    } catch (e){
        throw new Error('Invalid type attribute \'' + type +'\' in useCase');
    }
    
    params = eventType.substring(eventType.indexOf('('));
    eventType = eventType.substring(0,eventType.indexOf('('));
        
    selectors.forEach(function (selector) {
        var c = selector[0],
            s;
          
        if (c === '#') {
            c = selector[1];
        }
        s = c.toUpperCase() + selector.substring(1, selector.length);
        
        controlName += s;
    });
    
    controlName += eventType[0].toUpperCase() + eventType.substring(1, eventType.length);
    
    control = '\'' + selector + '\': {\n' +
            eventType + ': this.' + controlName + '\n}';
    
    return {
        controlString: control,
        name: controlName,
        parameterString: params
    }
}

var addFunction = function (controlName, controlDo, fnParams) {
    var controlFunction = '',
        selector,
        dataContent,
        filter,
        xtype,
        type,
        checkboxFiltering,
        command,
        elementString,
        foreginKey;

    controlFunction += controlName + ': function' + fnParams + ' {\n';
    
    controlDo.forEach(function (cmd) {    
        
        if (['alert', 'show'].indexOf(cmd.cmd) > -1) {
            controlFunction += 'Ext.Msg.alert(\'Info\', ' + '\'' +
                    cmd.msg + '\');\n';
        }
        elementString = '';
        selector = cmd.cmd.split('.');
        type = selector[0];  
        
        if (selector[1]){
            xtype = selector[1].toLowerCase();

            if (xtype.indexOf('list') > -1) {
                xtype = 'grid';
            } else if (xtype.indexOf('btn') > -1) {
                xtype = 'button';
            } else if (xtype.indexOf('chk') > -1 || xtype.indexOf('checkbox') > -1) {
                xtype = 'checkbox';
            } else if (xtype.indexOf('form') > -1) {
                xtype = 'form';
            } else if (xtype.indexOf('window') > -1) {
                xtype = 'window';
            } else if (xtype.indexOf('textfield') > -1) {
                xtype = 'textfield';
            } else {
                throw new Error('Invalid type name in alias \'' + xtype + '\'\n' +
                        ' it should contain one of the following [list, btn, form, window, chk, checkbox, textfield]');
            }
            
            try {
                command = cmds[type][xtype];
            } catch (e){
                throw new Error('Invalid type attribute \'' + type +'\' in useCase');
            }
            
            if (type === 'show') {
                controlFunction += 'Ext.create(\'widget.' + selector[1] + '\').show();\n';
            } else {
                
                if (type === 'filter') {
                    if (controlName.toLowerCase().indexOf('chk') > -1 ||
                        controlName.toLowerCase().indexOf('checkbox') > -1) {
                        controlFunction += 'if (newValue) {\n';    
                        for(i = 0; i < staticViews.length; i++) {
                            if (selector[1] === staticViews[i].alias) {
                                dataContent = staticViews[i].dataContent;
                                filter = dataContent.filter;
                                if (filter && filter[0]) {
                                    foreginKey = filter[0].field;
                                }
                            }
                        }
                        command = command.replace('{param}', filterFn('me.getItemId().split(\'.\')[1]', 'me.getItemId().split(\'.\')[0]'));
                        
                        checkboxFiltering = true;
                        
                    } else if (controlName.toLowerCase().indexOf('textfield') > -1) {
                        command = command.replace('{param}', filterAnyFn('newValue'));
                    } else {
                        checkboxFiltering = false;
                        for(i = 0; i < models.length; i++) {
                            if (xtype === 'grid' && selector[1].replace('list', '') === models[i].name.toLowerCase()) {

                                if (models[i].has && models[i].has[0]) {
                                    foreginKey = '\'' + models[i].has[0].key + '\'';
                                }
                            }
                        }
                        command = command.replace('{param}', filterFn(foreginKey, 'record.get(\'id\')'));                           
                    }
                }
                
                if (controlName.toLowerCase().indexOf('btn') > -1) {
                    elementString += 'me.up(\'' + selector[1] + '\')';
                    controlFunction += elementString + '.' + command + ';\n';
                } else {
                    elementString += 'Ext.getCmp(\'viewport\')';
                    elementString += '.down(\'' + selector[1] + '\')'
                    controlFunction += elementString + '.' + command + ';\n'; 
                }       
                
                if (checkboxFiltering) {
                    controlFunction += '} else {\n' + 
                        elementString + '.store.clearFilter();\n' + '}';
                }
            }   
            
            
            
        }    
    });
    
    controlFunction += '}\n';
     
    return controlFunction;
}


