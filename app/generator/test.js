var generator = require('../lib/generator'),  
    path = require('path')
    colors = require('colors'),
    templatePath = path.resolve(__dirname, '../templates/'),
    targetPath = 'webui/app/',
    testPath = 'test/gui/';
    
exports.createTests = function (viewportSetup) {
    var urlsArray = [],
        files = [{
            template: 'ViewTestTemplate.js',
            url: 'view/view.t.js'
        }, {
            template: 'ModelTestTemplate.js',
            url: 'model/model.t.js'
        }, {
            template: 'StoreTestTemplate.js',
            url: 'store/store.t.js'
        }, {
            template: 'ControllerTestTemplate.js',
            url: 'controller/controller.t.js'
        }],
        i;

    for(i = 0; i < files.length; i++) {
        urlsArray.push('{url: \'test/gui/' + files[i].url + '\'}');
        generator.processTemplate(viewportSetup, {
            sourceBaseDir: templatePath + '/test',
            targetBaseDir: testPath,
            template: files[i].template,            
            fileName: files[i].url
        });
    }
    
    viewportSetup.testUrls = urlsArray.join(',\n');
    
    [
        'index.js'
    ].forEach(function(fileName) {
        generator.processTemplate(viewportSetup, {
                sourceBaseDir: templatePath + '/test',
                targetBaseDir: testPath,
                template: fileName                           
        });
    });
}


