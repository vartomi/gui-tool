var generator = require('../lib/generator'),
    path = require('path'),
    logHandler = require('../loghandler.js'),
    templatePath = path.resolve(__dirname, '../templates'),
    targetPath = 'webui/app/',
    extPath = 'RapidGui.';    

exports.createStoresWithModels = function (models) {
    var modelName,
        storeName,
        modelPath,
        storePath,
        fieldsArray = [],
        fieldsString,
        itemPath,
        com = '\'',
        modelsArray = [],
        storesArray = [];

    try {

        models.forEach(function (model) {
            modelName = model.name;
            modelPath = extPath + 'model.' + modelName;
            storeName = modelName + 's';
            storePath = extPath + 'store.' + storeName;

            // Store generating
            generator.processTemplate(
            {
                definePath: storeName,
                model: modelPath,
                proxyUrl: model.proxy
            }, {
                sourceBaseDir: templatePath + '/store',
                targetBaseDir: targetPath + '/store',
                template: 'StoreTemplate.js',
                fileName: storeName + '.js'
            });

            itemPath = '\'' + storePath + '\'';
            logHandler.itemLog(itemPath);  
            storesArray.push(itemPath);       

            fieldsArray = model.fields;

            if (model.has) {
                model.has.forEach(function (assoc) {
                    if (assoc.inResource) {
                        // TODO hasmany
                    } else {
                        fieldsArray.push(assoc.key);
                    }
                });
            }

            fieldsString = '\'';
            fieldsString += fieldsArray.join('\',\'');
            fieldsString += '\'';

            if (model.typedFields) {
                fieldsArray = [];
                model.typedFields.forEach(function (field) {
                    fieldsArray.push('{name: ' + com + field.name + com + ',' +
                                     'type: ' + com + field.type + com + ',' + 
                                     'format: ' + com + field.format + com + '}');
                });
                fieldsString += ',' + fieldsArray.join(',');
            }

            generator.processTemplate(
            {
                definePath: modelName,
                fields: fieldsString,
            }, {
                sourceBaseDir: templatePath + '/model',
                targetBaseDir: targetPath + '/model',
                template: 'ModelTemplate.js',
                fileName: modelName + '.js'
            });

            itemPath = '\'' + modelPath + '\'';
            logHandler.itemLog(itemPath);        
            modelsArray.push(itemPath);
        });
    } catch (e) {        
        logHandler.error(e);    
    }
    
    return {
        models: modelsArray.join(',\n'),
        stores: storesArray.join(',\n'),
    };
}


