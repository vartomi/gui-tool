/*jshint node: true */
'use strict';

var generator = require('../lib/generator'),  
    path = require('path'),
    templatePath = path.resolve(__dirname, '../templates/'),
    application = require('./application.js'),
    testPath = 'test';
    
exports.createTests = function (viewportSetup) {
    var appName = application.getAppName(),
        urlsArray = [],
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
            targetBaseDir: testPath + '/gui',
            template: files[i].template,            
            fileName: files[i].url
        });
    }
    
    viewportSetup.testUrls = urlsArray.join(',\n');
    viewportSetup.appName = appName;
    
    [
        'index.js'
    ].forEach(function(fileName) {
        generator.processTemplate(viewportSetup, {
                sourceBaseDir: templatePath + '/test',
                targetBaseDir: testPath + '/gui',
                template: fileName                           
        });
    });
    
    generator.processTemplate(null, {
        sourceBaseDir: templatePath + '/test',
        targetBaseDir: testPath,
        template: 'index.html' 
    });
};


