'use strict';

var mu = require('mu2'),
    fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    extend = require('./extend'),
    beautify = require('js-beautify').js_beautify;

var verbose = false;

exports.createDirectoryTree = function(rootDirName, projectTree, removeIfExist) {
    var rootDirPath = path.resolve(rootDirName);

    if (fs.existsSync(rootDirPath)) {
        if (!removeIfExist) {
            console.log('Directory exists! ' + rootDirPath);
            return false;
        }
        console.log('Remove existing directory... (' + rootDirPath + ')');
        wrench.rmdirSyncRecursive(rootDirPath);
    }

    fs.mkdirSync(rootDirPath);
    projectTree.forEach(function(dir) {
        var dirToCreate = path.resolve(path.join(rootDirName, dir));
        if (verbose) {
            console.log('Create "' + dirToCreate + '"');
        }
        fs.mkdirSync(dirToCreate);
    });
    return true;
};

exports.copyDir = function(context, opts) {
    var sourceDirName = path.resolve(opts.sourceBaseDir, opts.dirName),
        destDirName = path.resolve(opts.targetBaseDir, opts.dirName);

    if (verbose) {
        console.log('Copy dir from: ' + sourceDirName + ' to: ' + destDirName);
    }
    wrench.copyDirSyncRecursive(sourceDirName, destDirName, opts);
};

exports.copyFile = function(fileName, sourceBaseDir, targetBaseDir) {
    if (verbose) {
        console.log('copyFile...' + fileName);
    }

    var sourceFileName = path.resolve(sourceBaseDir, fileName),
        destFileName = path.resolve(targetBaseDir, fileName);

    if (verbose) {
        console.log('Copy file from: ' + sourceFileName + ' to: ' + destFileName);
    }
    fs.writeFileSync(destFileName, fs.readFileSync(sourceFileName));
};

exports.processTemplate = function(context, opts) {
    var templateFileName = path.resolve(opts.sourceBaseDir, opts.template),
        fileName = path.resolve(opts.targetBaseDir, (opts.fileName ? opts.fileName : opts.template)),
        buffer = '',
        view = {},
        fileType;
    if (verbose) {
        console.log('templateFileName: ' + templateFileName);
        console.log('fileName: ' + fileName);
    }

    extend(view, context);

    fileType = fileName.split('.');
    fileType = fileType[fileType.length - 1];

    if (fileType === 'js') {
        if (verbose) {
            console.log('js formatted: ' + fileName);
        }
    }

    mu.compileAndRender(templateFileName, view)
        .on('data', function(c) {
            buffer += c.toString();
        })
        .on('end', function() {
            if (fileType === 'js') {
                buffer = beautify(buffer);
            }
            fs.writeFile(fileName,
                buffer,
                function compileAndRenderCallback(err) {
                    if (err) {
                        throw err;
                    }
                });
        });
};