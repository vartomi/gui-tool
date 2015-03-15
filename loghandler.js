/*jshint node: true */
'use strict';

require('colors');

var senchaColors = {
    '[ERR]': 'red',
    '[WRN]': 'yellow'
};

function senchaLogger (log) {
    var senchaTagBegin = log.indexOf('['),        
        out = '',
        senchaTagEnd,
        senchaTag,
        senchaLog;
    
    senchaTagEnd = log.indexOf(']') + 1;        
    senchaTag = log.slice(senchaTagBegin, senchaTagEnd);
    if (senchaColors[senchaTag]) {
        out = senchaTag[senchaColors[senchaTag]];
    } else {
        out = senchaTag;
    }
    senchaLog = log.replace(senchaTag + ' ', '');
    console.log(out.bold, senchaLog);
}

exports.error = function (error) {
    console.log('Specification error:\n %s'.bold.red, error);
    process.exit(1);
};

exports.errors = function (errors) {
    var errorString = '',
        i = 0;
    errors.forEach(function (error) {
       i++;
       errorString += ' - \n';
       for(var p in error) {
           errorString += '  ' + p + ': ' + error[p] + '\n'; 
       }
    });
    console.log('Specification errors(%s):\n%s'.bold.red, i, errorString);
    process.exit(1);
};

exports.itemLog = function (info) {
    this.log(info + ' component is generated');
};

exports.finishLog = function (info) {
    console.log('[DONE]'.bold.green, info.bold, '\n');
};

exports.warn = function (warn) {
    var senchaTagBegin = warn.indexOf('[');
    
    if (senchaTagBegin > -1) {
        senchaLogger(warn);
    } else {
        console.error('[WRN]'.bold.yellow, warn);
    }   
};

exports.err = function (err) {
    var senchaTagBegin = err.indexOf('[');
    
    if (senchaTagBegin > -1) {
        senchaLogger(err);
    } else {
        console.error('[ERR]'.bold.red, err.bold);
    }   
};

exports.log = function (log) {
    var senchaTagBegin = log.indexOf('[');
    
    if (senchaTagBegin > -1) {
        senchaLogger(log);
    } else {
        console.log('[INF]'.bold, log);
    }
};


