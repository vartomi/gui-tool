exports.error = function (error) {
    console.log('Specification error:\n %s'.bold.red, error);
    process.exit(1);
}

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
    exit(1);
}

exports.itemLog = function (info) {
    console.log('%s component is generated.\n'.green, info);
}

exports.finishLog = function (info) {
    console.log('%s!\n'.bold.green, info);
}


