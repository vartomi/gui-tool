require('colors');
require('child_process');

var http = require('http'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    open = require('open'),
    Decompress = require('decompress'),
    PropReader = require('properties-reader'),
    generator = require('./lib/generator'),
    fs = require('fs'),
    screenshot = require('screenshot-stream'),
    beautify = require('js-beautify').js_beautify,
    guiGenerator = require('./generator/index.js'),
    testGenerator = require('./generator/test.js'),
    logHandler = require('./loghandler.js'),
    path = require('path'),
    mainDir = path.resolve(__dirname, ''),
    templatePath = mainDir + '/templates',
    browsers = ['chrome', 'firefox', 'iexplore'],
    devUrl = 'http://localhost:4007',
    prodUrl = 'http://localhost:4008',
    testUrl = 'http://localhost:4007/test',
    configuration = {},
    childs = [];

var execute = function(command, directory, finishMsg, logging, callback) {
    'use strict';
    if (!directory) {
        directory = '.';
    }
    var options = {
            cwd: path.resolve(directory)
        },
        child;
    try {
        if (command.args) {
            child = spawn(command.cmd, command.args, options);
        } else {
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
        }
    } catch (err) {
        logHandler.err('child process failed: ' + err);
    }

    if (logging) {
        child.stdout.on('data', function(buf) {
            var s = '' + buf;
            logHandler.log(s.replace('\n', ''));
        });
    }

    child.stderr.on('data', function(buf) {
        var s = '' + buf;
        logHandler.err(s.replace('\n', ''));
    });

    childs.push({
        process: child
    });
};

var getConfiguration = function() {
    var obj = JSON.parse(fs.readFileSync('guitool.json')),
        prop;
    for (prop in obj) {
        configuration[prop] = obj[prop];
    }
};

var setConfiguration = function(obj) {
    generator.processTemplate({
        version: obj.extjsversion,
        specification: obj.specification,
        appname: obj.appname
    }, {
        sourceBaseDir: templatePath + '/guitool',
        targetBaseDir: '.',
        template: 'guitool.json'
    });
};

var exitIfNotProjectDir = function() {
    if (!fs.existsSync('webui')) {
        logHandler.err('command must be run in a gui-tool project folder');
        process.exit(1);
    }
};

var exitIfNotInitializedProject = function() {
    if (!fs.existsSync('guitool.json')) {
        logHandler.err('command must be run in an initialized project folder');
        process.exit(1);
    }
};

var exitIfHasNotPhantomJS = function() {
    if (!fs.existsSync('test/siesta/bin/phantomjs')) {
        logHandler.err('phantomJS integration is missing, maybe Siesta Trial version is used');
        process.exit(1);
    }
};

var openBrowser = function(browser, url) {
    var selectedBrowser = browsers[browser] || 'default browser';
    logHandler.log('open ' + selectedBrowser + ' ...');
    open(url, browsers[browser]);
};

// Phantom js
var consoleTest = function() {
    var platform = process.platform,
        reportFile = path.resolve('test/gui/report.json'),
        isWin = /^win/.test(platform),
        //        isMac = platform === 'darwin',
        isLinux = platform === 'linux';

    exitIfNotProjectDir();
    exitIfHasNotPhantomJS();

    if (isWin) {
        logHandler.log('Run console test in Windows cmd...');
        open('/k cd test/siesta/bin && phantomjs ' + testUrl + ' --report-format JSON --report-file ' + reportFile +
            ' && exit ', 'cmd',
            function() {
                fs.readFile(reportFile, 'utf8', function(err, data) {
                    if (err) {
                        throw err;
                    }
                    fs.writeFile(reportFile, beautify(data), function(err) {
                        if (err) {
                            throw err;
                        }
                        logHandler.finishLog('The test report is generated: ' + reportFile);
                        openBrowser(null, reportFile);
                    });
                });
            });
    } else if (isLinux) {
        execute('phantomjs ' + testUrl + ' --report-format JSON --report-file ' + reportFile, 'test/siesta/bin',
            null, null,
            function() {
                fs.readFile(reportFile, 'utf8', function(err, data) {
                    if (err) {
                        throw err;
                    }
                    fs.writeFile(reportFile, beautify(data), function(err) {
                        if (err) {
                            throw err;
                        }
                        logHandler.finishLog('The test report is generated: ' + reportFile);
                        openBrowser(null, reportFile);
                    });
                });
            });
    } else {
        logHandler.log('Run console test...');
        logHandler.warn('OS might be not supported!');
    }
};

var downloadFramework = function(src, out, callback) {
    var counter = 0,
        limit = 1000;
    logHandler.log('downloading framework from ' + src + ' ...');
    http.get(src, function(res) {
        var data = '';
        res.setEncoding('binary');
        res.on('data', function(chunk) {
            counter += 1;
            if (counter > limit) {
                logHandler.log('...');
                counter = 0;
            }
            data += chunk;
        });

        res.on('end', function() {
            fs.writeFile(out, data, 'binary', function(err) {
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

var decompressFramework = function(src, out, callback) {
    var decompress = new Decompress()
        .src(src)
        .dest(out)
        .use(Decompress.zip());

    logHandler.log('extracting archive (' + src + ') ...');

    decompress.run(function(err) {
        if (err) {
            throw err;
        }
        fs.unlink(src, function(err) {
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

exports.init = function(name, dir, options) {
    var reset = options.reset,
        extjsPath = options.extjs,
        siestaPath = options.siesta,
        extVersion = options.extversion,
        appName = name,
        dirName = dir,
        ext4Src = 'http://cdn.sencha.com/ext/gpl/ext-4.2.1-gpl.zip',
        ext5Src = 'http://cdn.sencha.com/ext/gpl/ext-5.1.0-gpl.zip',
        extSrc,
        siestaSrc = 'http://www.bryntum.com/download/?product_id=siesta-lite',
        remove = (reset ? true : false),
        directories = ['test', 'specification', 'webui', 'screenshots',
            'screenshots/chrome', 'screenshots/firefox', 'screenshots/iexplorer'
        ],
        success = true,
        extProperties,
        extZipPath, siestaZipPath;

    if (extVersion) {
        switch (extVersion) {
            case '4':
                extSrc = ext4Src;
                break;
            case '5':
                extSrc = ext5Src;
                break;
            default:
                logHandler.err('Wrong ExtJS version: ' + extVersion);
                process.exit(1);
        }
    } else {
        extSrc = ext5Src;
        extVersion = '5';
    }

    if (!dirName) {
        directories.forEach(function(directory) {
            success = success && generator.createDirectoryTree(directory, [], remove);
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
            if (!extjsPath) {
                downloadFramework(extSrc, extZipPath, function() {
                    decompressFramework(extZipPath, dirName + 'webui', function() {
                        execute('mv * ./extSDK', dirName + 'webui', null, null, function() {
                            execute('sencha -sdk ./extSDK generate app ' + appName + ' .', dirName + 'webui',
                                'gui-tool project initialized', true);
                        });
                    });
                });
            } else {
                execute('sencha -sdk ' + path.resolve(extjsPath) + ' generate app ' + appName + ' .', dirName + 'webui',
                    'gui-tool project initialized', true);
                extProperties = PropReader(path.resolve(extjsPath) + '/version.properties');
                extVersion = extProperties.get('version.major');
            }

            generator.processTemplate({
                version: extVersion,
                specification: 'gui.yml',
                appname: appName
            }, {
                sourceBaseDir: templatePath + '/guitool',
                targetBaseDir: './' + dirName,
                template: 'guitool.json'
            });

            // Siesta
            if (!siestaPath) {
                downloadFramework(siestaSrc, siestaZipPath, function() {
                    decompressFramework(siestaZipPath, dirName + 'test', function() {
                        execute('mv * ./siesta', dirName + 'test');
                    });
                });
            } else {
                execute('cp -r ' + siestaPath + ' ./test');
            }
        } catch (err) {
            logHandler.err(err);
        }
    } else {
        logHandler.err('directory contains already initialized gui-tool project!');
    }
};

exports.generate = function(options) {
    var templatePath = path.resolve(__dirname, 'templates/'),
        targetPath = 'webui',
        compile = options.compile,
        forceRemove = options.force,
        specPath = options.spec,
        templateExtDir = 'extjs',
        extVersion, viewportSetup, appName;

    exitIfNotProjectDir();
    exitIfNotInitializedProject();

    try {
        getConfiguration();
    } catch (err) {
        logHandler.err('guitool.json project file has errors');
        process.exit(1);
    }

    extVersion = configuration.extjsversion;
    templateExtDir += extVersion;

    appName = configuration.appname;

    logHandler.log('generating basic ExtJS ' + extVersion + ' files for ' + appName + '...');

    if (specPath) {
        logHandler.log('Specification file ' + specPath + ' was given...');
    } else {
        specPath = 'gui.yml';
        logHandler.log('Default specification file gui.yml is used...');
    }

    configuration.specification = specPath;
    setConfiguration(configuration);
    specPath = path.resolve('./specification/', specPath);

    if (generator.createDirectoryTree('webui/app', [
            'controller',
            'model',
            'store',
            'view'
        ], (forceRemove ? true : false))) {
        logHandler.finishLog('ExtJS hierarchy created');

        viewportSetup = guiGenerator.processTemplate(specPath, appName);

        [
            templateExtDir + '/Application.js',
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
            templateExtDir + '/app.js'
        ].forEach(function(fileName) {
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

exports.start = function(options) {
    var guitool = this,
        noBrowser = options.quiet,
        prod = options.prod,
        watch = options.watch,
        devPath = path.resolve('./webui', ''),
        verbose = true,
        prodPath;

    exitIfNotProjectDir();
    getConfiguration();

    if (options.verbose === false) {
        verbose = options.verbose;
    }

    prodPath = path.resolve('./webui/build/production/' + configuration.appname, '');

    execute({
        cmd: 'node',
        args: ['server.js', 'development', devPath, 'without-log']
    }, mainDir + '/server', null, true);

    if (verbose) {
        logHandler.log('development host server starting...');
    }

    if (!noBrowser) {
        openBrowser(null, devUrl);
    }

    if (watch) {
        logHandler.log('watching ' + configuration.specification + '...');
        fs.watchFile(path.resolve('./specification/' + configuration.specification), function() {
            guitool.generate({
                force: true,
                spec: configuration.specification
            });
            logHandler.log('watching ' + configuration.specification + '...');
        });
    }

    if (prod) {
        execute({
            cmd: 'node',
            args: ['server.js', 'production', prodPath, 'without-log', watch ? 'watch' : '']
        }, mainDir + '/server', null, true);
        logHandler.log('production host server starting...');
        if (!noBrowser) {
            openBrowser(null, prodUrl);
        }
    }

    if (verbose) {
        console.log('\nUse ' + '[CTRL + C]'.bold.yellow + ' to exit...\n');
    }
};

exports.createScreenshots = function() {
    var guitool = this,
        counter = 0,
        delay = 2,
        screenshotsName,
        width,
        stream;

    exitIfNotProjectDir();
    getConfiguration();

    logHandler.log('server starting...');
    guitool.start({
        quiet: true,
        verbose: false
    });

    setTimeout(function() {
        logHandler.log('screenshots creating...');
        ['iexplorer', 'chrome', 'firefox'].forEach(function(userAgent) {
            ['1024x768', '1366x768', '1920x1080', '2880x1800', '3840x2160'].forEach(function(resolution) {
                counter++;
                screenshotsName = configuration.appname + '_' + userAgent + '_' + resolution + '.png';
                width = resolution.split('x')[0];

                if (width > 1920) {
                    delay = 3;
                }

                stream = screenshot(devUrl, resolution, {
                    crop: true,
                    userAgent: userAgent,
                    delay: 2
                });
                stream.pipe(fs.createWriteStream('screenshots/' + userAgent + '/' + screenshotsName));
                stream.on('finish', function() {
                    if (counter === 1) {
                        logHandler.finishLog('screenshots are created');
                        process.exit(0);
                    } else {
                        counter--;
                    }
                });
            });
        });
    }, 1000);
};

exports.runTest = function(options) {
    var phantomJS = options.run;

    if (phantomJS) {
        try {
            consoleTest();
        } catch (err) {
            logHandler.err(err);
            process.exit(1);
        }
    } else {
        openBrowser(null, testUrl);
        logHandler.log('test page loading...');
    }
};

var exitHandler = function() {
    var i;
    if (childs.length > 0) {
        logHandler.log('Child processes will be closed');
        for (i = 0; i < childs.length; i++) {
            childs[i].process.kill();
        }
    }
};

process.on('exit', exitHandler);
process.on('SIGINT', function() {
    process.exit(0);
});
process.on('uncaughtException', exitHandler);