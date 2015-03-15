var generator = require('../../lib/generator'),
    path = require('path'),
    logHandler = require('../../loghandler.js'),
    formGenerator = require('./form.js'),
    gridGenerator = require('./grid.js'),
    templatePath = path.resolve(__dirname, '../../templates'),
    targetPath = 'webui/app/',
    extPath = 'RapidGui.';

exports.create = function (view, viewsAndRequires) {
    var content = view.content,
        configObj = {},
        itemsArray = [],
        viewsArray = [],
        requiresArray = [],
        itemPath,
        com = '\'';
    try {
        configObj.definePath = view.name;
        configObj.xtype = view.alias;
        configObj.title = view.layout.title;
        configObj.height = view.layout.height;
        configObj.width = view.layout.width;

        content.forEach(function (el){
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
     
     
     itemPath = com + extPath + 'view.' + view.name + com;
     logHandler.itemLog(itemPath);
     viewsArray.push(itemPath);
     
     if (!viewsAndRequires.views) {
         viewsAndRequires.views = '';
     } else {
         viewsAndRequires.views += ',\n';
     }
     viewsAndRequires.views += viewsArray.join(',\n');     
}


