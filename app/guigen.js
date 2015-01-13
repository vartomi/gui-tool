var childProcess  = require('child_process'),
    wget = require('wget'),
    exec = require('child_process').exec,
    open = require('open'),
    generator = require('./lib/generator'),
    fs = require('fs'),
    beautify = require('js-beautify').js_beautify,
    guiGenerator = require('./generator/index.js'),
    testGenerator = require('./generator/test.js'),
    colors = require('colors'),
    logHandler = require('./loghandler.js'),
    path = require('path'),
    mainDir = path.resolve(__dirname, ''),
    browsers = ["chrome", "firefox", "iexplore"],
    devUrl = 'http://localhost:4007',
    prodUrl = 'http://localhost:4008',
    childs = [];

var execute = function(command, directory, finishMsg, colorizeObject, logging, callback) {
    var child;
    try {
        if (directory) {
            process.chdir(directory);
        }

        child = exec(command, function(error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: '.red.bold + error);
            } else {
                if (finishMsg) console.log(finishMsg.bold);                
            }
            if (callback) callback();
        });
        if (logging) {
            child.stdout.on('data', function(buf) {
                var s = String(buf);                    
                console.log(s.grey);
            });
        }

        child.stderr.on('data', function (buf) {
            console.log(String(buf).yellow);
        });

        childs.push({process: child, cmd: directory + '/' + command});
    }
    catch (err) {
        console.log('chdir err: ' + err);
    }
}

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
        src = 'http://cdn.sencha.com/ext/gpl/ext-4.2.1-gpl.zip',        
        remove = (reset ? true : false),
        directories = ['test', 'specification', 'webui'],
        success = true,
        zipPath;
    
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
        zipPath = dirName + 'ext.zip';
        
        console.log('directories created...');
        generator.copyFile('gui.yml', mainDir + '/generator', dirName + 'specification');        
        
        var download = wget.download(src, zipPath),
            oneFourth = false,
            twoFourth = false,
            threeFourth = false;
        console.log('downloading ExtJS 4.2.1 gpl framework');
        download.on('error', function(err) {
            console.log(err);
        });
        download.on('progress', function(progress) {
            var pr = parseFloat(progress) * 100;
            
            if (pr > 25 && !oneFourth) {
                process.stdout.write('...'); 
                oneFourth = true;
            } else if (pr > 50 && !twoFourth) {
                twoFourth = true;
                process.stdout.write('...'); 
            } else if (pr > 75 && !threeFourth) {
                threeFourth = true;
                process.stdout.write('...');
            }
        });
        download.on('end', function() {
            console.log('Done');
            execute('unzip -q ' + zipPath + ' -d ' + dirName + 'webui', null, null, null, null, function () { 
                execute('mv * ./ext4', dirName + 'webui', null, null, null, function () {
                    execute('sencha -sdk ./ext4 generate app RapidGui .', null, 'gui-tool project initialized');   
                });
            });        
        });
    }
};

exports.generate = function(options) {
    var templatePath = path.resolve(__dirname, 'templates/'),
        targetPath = 'webui/app/',
        testPath = 'test/gui/',
        compile = options.compile,
        forceRemove = options.force,
        specPath = options.spec,
        viewportSetup;

    console.log('Generate basic ExtJS files...\n'.bold);

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
        console.log('Child processes should be closed...'.bold);
        for(i = 0; i < childs.length; i++){
            console.log('\'%s\' process will be closed.'.grey, childs[i].cmd);
            childs[i].process.kill();
        }
    }
}

process.on('exit', exitHandler);

process.on('SIGINT', exitHandler);

process.on('uncaughtException', exitHandler);





