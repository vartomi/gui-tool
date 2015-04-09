'use strict';

var dummyjson = require('dummy-json'),
    generator = require('../lib/generator'),
    path = require('path'),
    logHandler = require('../loghandler.js'),
    templatePath = path.resolve(__dirname, '../templates'),
    targetPath = 'webui/app/',
    application = require('./application.js'),
    proxyTpl = '\nproxy: {\
        type: \'ajax\',\
        reader: {\
            url: \'{{proxyUrl}}\',\
            type: \'json\',\
            root: \'result.data\'\
        },\
    },\n';

var dummyString = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
        'adipisicing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut',
        'labore', 'et', 'dolore', 'magna', 'aliqua.', 'enim', 'ad', 'minim', 'veniam'
    ],
    dummyStringLen = dummyString.length;

var dummyHelpers = {
    dummyString: function() {
        var index = Math.floor((Math.random() * dummyStringLen) + 1);
        return dummyString[index - 1];
    }
};

var generateMockData = function(fields, number) {
    var template = '{{#repeat ' + number + '}}{',
        templateArray = [],
        result;

    fields.forEach(function(field) {
        var templateParam = 'dummyString',
            fieldName = field;
        if (field.type) {
            fieldName = field.name;
            switch (field.type) {
                case 'int':
                    templateParam = 'number 100';
                    break;
                case 'float':
                    templateParam = 'number 100.0';
                    break;
                case 'boolean':
                    templateParam = 'boolean';
                    break;
                case 'date':
                    templateParam = 'number 1 12}}/{{number 1 31}}/{{number 1990 2010';
                    break;
                case 'id':
                    templateParam = 'uniqueIndex';
                    break;
                default:
                    break;
            }
        }
        templateArray.push(fieldName + ': \'{{' + templateParam + '}}\'');
    });

    template += templateArray.join(',') + '}{{/repeat}}';

    result = dummyjson.parse(template, {
        helpers: dummyHelpers
    });

    return result;
};

exports.createStoresWithModels = function(models) {
    var appName = application.getAppName(),
        format = '',
        modelName,
        storeName,
        modelPath,
        storePath,
        fieldsArray = [],
        fieldsString,
        itemPath,
        com = '\'',
        modelsArray = [],
        storesArray = [],
        dataArray,
        proxy;

    try {

        models.forEach(function(model) {
            modelName = model.name;
            modelPath = appName + '.model.' + modelName;
            storeName = modelName + 's';
            storePath = appName + '.store.' + storeName;

            proxy = model.proxy.split(':');
            if (proxy[0] === 'mock') {
                dataArray = generateMockData(model.fields.concat(model.typedFields), proxy[1]);
                proxy = null;
            } else {
                proxyTpl = proxyTpl.replace('{{proxyUrl}}', proxy);
            }

            // Store generating
            generator.processTemplate({
                appName: appName,
                definePath: storeName,
                model: modelPath,
                proxy: proxy ? proxyTpl : '',
                data: dataArray
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
                model.has.forEach(function(assoc) {
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
                model.typedFields.forEach(function(field) {
                    if (field.format) {
                        format = ',' + 'format: ' + com + field.format + com;
                    } else if (field.type === 'date') {
                        // throw new Error('Date fields ');
                    }

                    if (field.type === 'id') {
                        field.type = 'int';
                    }

                    fieldsArray.push('{name: ' + com + field.name + com + ',' +
                        'type: ' + com + field.type + com + format + '}');
                });
                fieldsString += ',' + fieldsArray.join(',');
            }

            generator.processTemplate({
                appName: appName,
                definePath: modelName,
                fields: fieldsString
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
};