/*jshint node: true */
'use strict';
require('colors');

var childProcess  = require('child_process'),
    http = require('http'),
    exec = require('child_process').exec,
    open = require('open'),
    Decompress = require('decompress'),
    generator = require('./lib/generator'),
    fs = require('fs'),
    beautify = require('js-beautify').js_beautify,
    guiGenerator = require('./generator/index.js'),
    testGenerator = require('./generator/test.js'),
    logHandler = require('./loghandler.js'),
    path = require('path'),
    mainDir = path.resolve(__dirname, ''),
    browsers = ["chrome", "firefox", "iexplore"],
    devUrl = 'http://localhost:4007',
    prodUrl = 'http://localhost:4008',
    childs = [];

var execute = function(command, directory, finishMsg, colorizeObject, logging, callback) {
    var options = {
            cwd: path.resolve(process.cwd(), '')
        },
        child;
    
    try {
        if (directory) {
            options.cwd += '/' + directory;
        }

        child = exec(command, { cwd: directory }, function(error, stdout, stderr) {
            if (error !== null) {
                logHandler.err(error);
            } else {
                if (finishMsg) logHandler.finishLog(finishMsg);
                if (callback) callback();
            }            
        });
        if (logging) {
            child.stdout.on('data', function(buf) {
                var s = String(buf);                    
                console.log(s.grey);
            });
        }

        child.stderr.on('data', function (buf) {
            console.log(String(buf).red);
        });

        childs.push({process: child, cmd: directory + '/' + command});
    } catch (err) {
        logHandler.err('child process failed: ' + err);
    }
};

var consoleTest = function () {
    var reportFile = path.resolve('test/gui/report.json');
    console.log('Run test in windows cmd...'.cyan);
    open('/k cd test/siesta/bin && phantomjs http://localhost:4007/test --report-format JSON --report-file ../../gui/report.json && exit ', 'cmd', function () {
        fs.readFile(reportFile, 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            fs.writeFile(reportFile,
                         beautify(data), function(err) {
                if (err) throw err;
                console.log('The test report is generated (%s)'.cyan, reportFile);
                open(reportFile, "chrome");
            });
        });
    });


}

exports.init = function(name, options) {
    var reset = options.reset,
        dirName = name,
        extSrc = 'http://cdn.sencha.com/ext/gpl/ext-4.2.1-gpl.zip',
        siestaSrc = 'http://www.bryntum.com/download/?product_id=siesta-lite',
        remove = (reset ? true : false),
        directories = ['test', 'specification', 'webui'],
        success = true,
        extZipPath, siestaZipPath;
    
    if (!dirName) {        
        directories.forEach(function (dir) {
            success = success && generator.createDirectoryTree(dir, [], remove);
        }); 
        dirName = '';        
    } else {
        success = generator.createDirectoryTree(dirName, directories, remove);        
        dirName += '/';
    }
        
    if (success) {  
        extZipPath = dirName + 'ext.zip';
        siestaZipPath = dirName + 'siesta.zip';
        
        logHandler.finishLog('directories created');
        generator.copyFile('gui.yml', mainDir + '/generator', dirName + 'specification');        
        
        try {
            // ExtJS
            downloadFramework(extSrc, extZipPath, function () {
                decompressFramework(extZipPath, dirName + 'webui', function () {
                    execute('mv * ./ext4', dirName + 'webui', null, null, null, function () {
                        execute('sencha -sdk ./ext4 generate app RapidGui .', dirName + 'webui', 'gui-tool project initialized');  
                    });                    
                });  
            });  
            
            // Siesta
            downloadFramework(siestaSrc, siestaZipPath, function () {
                decompressFramework(siestaZipPath, dirName + 'test', function () {
                    execute('mv * ./siesta', dirName + 'test');
                });  
            });  
        } catch(err) {
            logHandler.err(err);   
        }
    } else {
        logHandler.err('directory contains already initialized gui-tool project!');   
    }
};

var downloadFramework = function (src, out, callback) {
    var counter = 0,
        limit = 1000;
    logHandler.log('downloading framework from ' + src + ' ...');
    http.get(src, function (res) {
        var data = '';
        res.setEncoding('binary');    
        res.on('data', function (chunk) {
            counter += 1;
            if (counter > limit) {
                logHandler.log('...');
                counter = 0;
            }
            data += chunk;
        });

        res.on('end', function () {
            fs.writeFile(out, data, 'binary', function (err) {
                if (err) throw err;
                logHandler.log('downloading from ' + src + ' is done');
                if (callback) callback();
            });
        });
    });
};
    
var decompressFramework = function (src, out, callback) {
    var decompress = new Decompress()
        .src(src)
        .dest(out)
        .use(Decompress.zip());
    
    logHandler.log('extracting archive (' + src + ') ...');

    decompress.run(function (err) {
        if (err) throw err;
        fs.unlink(src, function (err) {
            if (err) throw err;
        });
        logHandler.finishLog('archive (' + src + ') extracted');
        if (callback) callback();
    });      
};

exports.generate = function(options) {
    var templatePath = path.resolve(__dirname, 'templates/'),
        targetPath = 'webui/app/',
        testPath = 'test/gui/',
        compile = options.compile,
        forceRemove = options.force,
        specPath = options.spec,
        viewportSetup;

    logHandler.log('generating basic ExtJS files...');

    if (specPath) {
        specPath = path.resolve('.', options.spec)
    }

    if (generator.createDirectoryTree('webui/app', [
        'controller',
        'model',
        'store',
        'view'
    ], (forceRemove ? true : false))) {
        logHandler.finishLog('ExtJS hierarchy created');

        viewportSetup = guiGenerator.processTemplate(specPath);

        [
            'Application.js',
            'view/Viewport.js'
        ].forEach(function(fileName) {
//            generator.copyFile(fileName, templatePath, targetPath);
            generator.processTemplate(viewportSetup, {
                        sourceBaseDir: templatePath,
                        targetBaseDir: targetPath,
                        template: fileName
                });
        });
        logHandler.finishLog('ExtJS components created');
    }

    if (generator.createDirectoryTree('test/gui', [
        'store',
        'model',
        'view',
        'controller'
    ], (forceRemove ? true : false))) {
        logHandler.finishLog('Siesta test hierarchy created');

        testGenerator.createTests(viewportSetup);

        logHandler.finishLog('Siesta test files created');
    }

    if (compile) {
        console.log('Sencha building...\n'.bold);
        execute('sencha app build', 'webui',
                'Sencha build finished\n', [{text: '[INF]'}, {text: '[ERR]'}], true);
    }
}

var openBrowsers = function () {
    var i;
    for(i = 0; i < browsers.length; i++) {
        open(devUrl, browsers[i]);
        console.log('Open app in %s...'.cyan, browsers[i]);
    }
}

exports.startBrowsers = function (options) {
    var i,
        openUrl = options.open,
        run = options.run,
        test = options.page;
    if (openUrl){
       openBrowsers();
    }

    if (run) {
        consoleTest();
    }

    if (test){
        open(devUrl + '/test');
        console.log('Open test page in browser...'.cyan);
    }
}

exports.startServer = function(options) {
    var mock = options.mock,
        webdev = options.webDev,
        webprod = options.webProd,
        openApp = options.open,
        test = options.test,
        devPath = path.resolve('./webui', ''),
        prodPath = path.resolve('./webui/build/production/RapidGui', ''),
        i;

    if (!mock && !webdev && !webprod) {
        mock = webdev = webprod = true;
    }

    if (webdev) {
        execute('node server.js development ' + devPath + ' without-log', mainDir + '/server');
        console.log('Development host server starting...\n'.bold);
        if (openApp) {
            console.log('Open app in browser...'.cyan);
            open(devUrl)
        } else if (test) {
            openBrowsers();
        }
    }

    if (webprod) {
        execute('node server.js production ' + prodPath + ' without-log', mainDir + '/server');
        console.log('Production host server starting...\n'.bold);
        if (openApp) {
            console.log('Open builded app in browser...'.cyan);
            open(prodUrl);
        }
    }
}

var exitHandler = function () {
    var i;
    if (childs.length > 0) {
        logHandler.log('Child processes will be closed');
        for(i = 0; i < childs.length; i++){
            childs[i].process.kill();
        }
    }
}

process.on('exit', exitHandler);

process.on('SIGINT', exitHandler);

process.on('uncaughtException', exitHandler);





