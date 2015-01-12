var generator = require('../lib/generator'),
    schema = require('../lib/schemas'),
    path = require('path'),
    logHandler = require('../loghandler.js'),
    fs = require('fs'),
    yaml = require('js-yaml'),
    templatePath = path.resolve(__dirname, '../templates'),    
    schemaPath = path.resolve(__dirname, './schema/guiSchema.yml'),
    targetPath = 'webui/app/',
    senchaCfgPath = 'webui/.sencha/app/',
    extPath = 'RapidGui.',
    specification = require('./specification.js'),
    guiSpec,
    modelGenerator = require('./modelWithStore.js'),
    gridGenerator = require('./view/grid.js'),
    windowGenerator = require('./view/window.js'),
    formGenerator = require('./view/form.js'),
    controllerGenerator = require('./controller.js');

var createViews = function (layout, staticViews) {
    var type,
        com = '\'',
        viewsAndRequires = {},
        viewportItems = [],
        i, c,
        html = 'html: ' +
            'Ext.util.Format.htmlDecode(\'' +
            '<div style="text-align: center"><h2>Prototype placeholder of gui-tool</h2></div>\'' +
            '),',
        components;
     
    viewsAndRequires.items = '';
    viewsAndRequires.requires = '';
    for(i = 0; i < layout.length; i++) {
        viewsAndRequires.items += '{xtype: ' + com + 'container' + com + ',\n' +
                'layout: ' + com + 'hbox' + com + ',\n' + 'flex: 1,\n' + 'items: [';
        components = layout[i].split('|');
        viewportItems = [];
        for(c = 0; c < components.length; c++) {
            viewportItems.push('{xtype: ' + com + components[c] + com + ',\n' +
                    (components[c] === 'container' ? html : '') + 'flex: 1}');
        }
         viewsAndRequires.items += viewportItems.join(',\n{xtype: \'splitter\'},\n');
         viewsAndRequires.items += ']},\n';
         if (i < layout.length - 1){
             viewsAndRequires.items += '{xtype: \'splitter\'},\n';
         }
    };  
    
    staticViews.forEach(function(view) {
        type = view.design.type;
        
        if (type === 'window') {
            windowGenerator.create(view, viewsAndRequires);
        } else if (type === 'form') {
            formGenerator.create(view, viewsAndRequires);
        } else if (type === 'grid') {
            gridGenerator.create(view, viewsAndRequires);
        } else if (type === 'panel') {
            
        } else {
            logHandler.error('Type \'' + type + '\' is not defined for design of ' + view.name + '!');           
        }
    });
    
    
    return viewsAndRequires;
}

exports.processTemplate = function (specPath) {
    if (specPath){
        console.log('Specification file was given...\n'.bold);
        guiSpec = require(specPath)
    } else {
        console.log('Default specification file is used...'.bold);
        console.log('Specification file: ' + path.resolve('', './specification/gui.yml') + '\n');
        guiSpec = yaml.load(fs.readFileSync('./specification/gui.yml'));
    }
    
    console.log('WAT-1');
    specification.setSpecification(guiSpec);
    
    var staticViews = guiSpec.views,
        models = guiSpec.models,
        useCases = guiSpec.useCases,
        layout = guiSpec.layout,
        theme = guiSpec.extTheme,
        modelsAndStores, viewsAndRequires,
        schemaErrors = [];
        viewportSetup = {};

    schemaErrors = schema.validate(guiSpec, schemaPath);
    console.log('WAT-2');

    if (schemaErrors.length > 0) {
        logHandler.errors(schemaErrors);
    } else {
        logHandler.finishLog('Specification schema validated');
    }
    
    generator.processTemplate({theme: theme},{
        sourceBaseDir: templatePath + '/sencha',
        targetBaseDir: senchaCfgPath,
        template: 'sencha.cfg'
    });
    
    modelsAndStores = modelGenerator.createStoresWithModels(models);
    viewportSetup.models = modelsAndStores.models;
    viewportSetup.stores = modelsAndStores.stores;
    
    viewsAndRequires = createViews(layout, staticViews);
    
    viewportSetup.views = viewsAndRequires.views;
    viewportSetup.items = viewsAndRequires.items;
    viewportSetup.appRequires = viewsAndRequires.requires;

    viewportSetup.controllers = controllerGenerator.create(useCases);
    
    return viewportSetup;
}


