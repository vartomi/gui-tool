/*jshint node: true */
'use strict';

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

exports.err = function (err) {
    console.error('[ERR]'.bold.red, err.bold);
};

exports.log = function (log) {
    console.log('[INF]'.bold, log);
};


