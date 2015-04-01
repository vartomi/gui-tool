var generator = require('../../lib/generator'),
    path = require('path'),
    logHandler = require('../../loghandler.js'),
    formGenerator = require('./form.js'),
    gridGenerator = require('./grid.js'),
    templatePath = path.resolve(__dirname, '../../templates'),
    targetPath = 'webui/app/',
    application = require('../application.js');

exports.create = function(view, viewsAndRequires) {
    var appName = application.getAppName(),
        content = view.content,
        configObj = {},
        itemsArray = [],
        viewsArray = [],
        itemPath,
        com = '\'';
    try {
        configObj.appName = appName;
        configObj.definePath = view.name;
        configObj.xtype = view.alias;
        configObj.title = view.layout.title;
        configObj.height = view.layout.height;
        configObj.width = view.layout.width;

        content.forEach(function(el) {
            if (el.layout.type === 'form') {
                itemsArray.push('{xtype:' + com + el.alias + com + ',' +
                    'header: false }');

                formGenerator.create(el, viewsAndRequires);
            } else if (el.layout.type === 'grid') {
                itemsArray.push('{xtype:' + com + el.alias + com + ',' +
                    'header: false }');

                gridGenerator.create(el, viewsAndRequires);
            }
        });

        configObj.items = itemsArray.join(',');

    } catch (e) {
        logHandler.error(e);
    }
    generator.processTemplate(configObj, {
        sourceBaseDir: templatePath + '/view',
        targetBaseDir: targetPath + '/view',
        template: 'WindowTemplate.js',
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
};