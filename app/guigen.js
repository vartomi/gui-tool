/*jshint node: true */
'use strict';

require('colors');
require('child_process');

var http = require('http'),
    exec = require('child_process').exec,
    open = require('open'),
    Decompress = require('decompress'),
    generator = require('./lib/generator'),
    fs = require('fs'),
    //beautify = require('js-beautify').js_beautify,
    guiGenerator = require('./generator/index.js'),
    testGenerator = require('./generator/test.js'),
    logHandler = require('./loghandler.js'),
    path = require('path'),
    mainDir = path.resolve(__dirname, ''),
    browsers = ["chrome", "firefox", "iexplore"],
    devUrl = 'http://localhost:4007',
    prodUrl = 'http://localhost:4008',
    testUrl = 'http://localhost:4007/test',
    childs = [];

var execute = function(command, directory, finishMsg, logging, callback) {
    var options = {
            cwd: path.resolve(directory)
        },
        child;
        
    try {
        child = exec(command, options, function(error) {
            if (error) {
                logHandler.err(command + '\n' + error.stack);
            } else {
                if (finishMsg) {
                    logHandler.finishLog(finishMsg);
                }
                if (callback) {
                    callback();
                }
            }            
        });
        if (logging) {
            child.stdout.on('data', function(buf) {
                logHandler.log(buf.replace('\n',''));
            });
        }

        child.stderr.on('data', function (buf) {
            logHandler.err(buf.replace('\n', ''));
        });

        childs.push({process: child, cmd: directory + '/' + command});
    } catch (err) {
        logHandler.err('child process failed: ' + err);
    }
};

// phantom js
/*var consoleTest = function () {
    var reportFile = path.resolve('test/gui/report.json');
    console.log('Run test in windows cmd...'.cyan);
    open('/k cd test/siesta/bin && phantomjs http://localhost:4007/test --report-format JSON --report-file ../../gui/report.json && exit ', 'cmd', function () {
        fs.readFile(reportFile, 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            fs.writeFile(reportFile,
                         beautify(data), function(err) {
                if (err) {
                    throw err;
                }
                console.log('The test report is generated (%s)'.cyan, reportFile);
                open(reportFile, "chrome");
            });
        });
    });


};*/

exports.init = function(name, options) {
    var reset = options.reset,
        extjsPath = options.extjs,
        siestaPath = options.siesta,
        extVersion = options.extversion,
        dirName = name,
        ext4Src = 'http://cdn.sencha.com/ext/gpl/ext-4.2.1-gpl.zip',
        ext5Src = 'http://cdn.sencha.com/ext/gpl/ext-5.1.0-gpl.zip',
        extSrc,
        siestaSrc = 'http://www.bryntum.com/download/?product_id=siesta-lite',
        remove = (reset ? true : false),
        directories = ['test', 'specification', 'webui'],
        success = true,
        templatePath = mainDir + '/templates',
        extZipPath, siestaZipPath;
    
    if (extVersion) {
        switch (extVersion) {
            case "4": extSrc = ext4Src; break;
            case "5": extSrc = ext5Src; break;
            default: logHandler.err('Wrong ExtJS version: ' + extVersion); process.exit(1);
        }
    } else {
        extSrc = ext4Src;
        extVersion = "4";
    }
    
    if (!dirName) {        
        directories.forEach(function (dir) {
            success = success && generator.createDirectoryTree(dir, [], remove);
        }); 
        dirName = '';        
    } else {
        success = generator.createDirectoryTree(dirName, directories, remove);        
        dirName += '/';
    }
    
    console.log(extVersion, templatePath, dirName);
    generator.processTemplate({
                version: extVersion
            }, {
                sourceBaseDir: templatePath + '/guitool',
                targetBaseDir: './' + dirName,
                template: 'guitool.json'
    });
            
    /*if (success) {  
        extZipPath = dirName + 'ext.zip';
        siestaZipPath = dirName + 'siesta.zip';
        
        logHandler.finishLog('directories created');
        generator.copyFile('gui.yml', mainDir + '/generator', dirName + 'specification');    
        
        try {
            // ExtJS
            if (!extjsPath) {
                downloadFramework(extSrc, extZipPath, function () {
                    decompressFramework(extZipPath, dirName + 'webui', function () {
                        execute('mv * ./extSDK', dirName + 'webui', null, null, function () {
                            execute('sencha -sdk ./extSDK generate app RapidGui .', dirName + 'webui', 'gui-tool project initialized', true);  
                        });                    
                    });  
                });
            } else {
                execute('mv ' + extjsPath + ' ./webui/extSDK', null, null, null, function () {
                    execute('sencha -sdk ./extSDK generate app RapidGui .', dirName + 'webui', 'gui-tool project initialized', true);  
                }); 
            }
            
            // Siesta
            if (!siestaPath) {
                downloadFramework(siestaSrc, siestaZipPath, function () {
                    decompressFramework(siestaZipPath, dirName + 'test', function () {
                        execute('mv * ./siesta', dirName + 'test');
                    });  
                });  
            } else {
                execute('mv ' + siestaPath + ' ./test');
            }
        } catch(err) {
            logHandler.err(err);   
        }
    } else {
        logHandler.err('directory contains already initialized gui-tool project!');   
    }*/
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
                if (err) {
                    throw err;
                }
                logHandler.log('downloading from ' + src + ' is done');
                if (callback) {
                    callback();
                }
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
        if (err) {
            throw err;
        }
        fs.unlink(src, function (err) {
            if (err) {
                throw err;
            }
        });
        logHandler.finishLog('archive (' + src + ') extracted');
        if (callback) {
            callback();
        }
    });      
};

var exitIfNotProjectDir = function () {
    if (!fs.existsSync('webui')) {
        logHandler.err('command must be run from a gui-tool project folder');
        process.exit(1);
    }
};

exports.generate = function(options) {
    var templatePath = path.resolve(__dirname, 'templates/'),
        targetPath = 'webui',
        compile = options.compile,
        forceRemove = options.force,
        specPath = options.spec,
        viewportSetup;
    
    exitIfNotProjectDir();

    logHandler.log('generating basic ExtJS files...');

    if (specPath) {
        specPath = path.resolve('.', options.spec);
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
            'extjs5/Application.js',
            'view/Viewport.js'
        ].forEach(function(fileName) {
            generator.processTemplate(viewportSetup, {
                        sourceBaseDir: templatePath,
                        targetBaseDir: targetPath + '/app',
                        template: fileName,
                        fileName: fileName.replace(/(extjs4\/|extjs5\/)/, '')
                });
        });
        [
            'extjs5/app.js'
        ].forEach(function(fileName)  {
            generator.processTemplate(viewportSetup, {
                        sourceBaseDir: templatePath,
                        targetBaseDir: targetPath,
                        template: fileName,
                        fileName: fileName.replace(/(extjs4\/|extjs5\/)/, '')
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
                'Sencha build finished\n', true);
    }
};

var openBrowser = function (browser, url) {
    var selectedBrowser = browsers[browser] || 'default browser';
    logHandler.log('open ' + selectedBrowser + ' ...' );  
    open(url, browsers[browser]);    
};

exports.start = function (options) {
    var guitool = this,
        browser = options.open,
        prod = options.prod,
        watch = options.watch,
        prodPath = path.resolve('./webui/build/production/RapidGui', ''),
        devPath = path.resolve('./webui', '');
    
    exitIfNotProjectDir();
        
    execute('node server.js development ' + devPath + ' without-log', mainDir + '/server', null, true);
    logHandler.log('development host server starting...');
    
    if (browser){
        openBrowser(browser, devUrl);
    }
    
    if (watch) {
        logHandler.log('watching...');
        fs.watchFile(path.resolve('./specification/gui.yml'), function () { 
            guitool.generate({force: true});
            logHandler.log('watching...');
        });
    }
    
    if (prod) {
        execute('node server.js production ' + prodPath + ' without-log', mainDir + '/server', null, true);
        logHandler.log('production host server starting...');
        if (browser) {
            openBrowser(browser, prodUrl);
        }
    }
};

exports.runTest = function (options) {
    var phantomJS = options.run;
    
    if (phantomJS) {
        // TODO phantom js
        logHandler.err('phantomJS integration required');
    } else {
        openBrowser(null, testUrl); 
        logHandler.log('test page loading...');
    }
};

var exitHandler = function () {
    var i;
    if (childs.length > 0) {
        logHandler.log('Child processes will be closed');
        for(i = 0; i < childs.length; i++){
            childs[i].process.kill();
        }
    }
};

process.on('exit', exitHandler);

process.on('SIGINT', exitHandler);

process.on('uncaughtException', exitHandler);





