require('colors');
var Table = require('cli-table');

module.exports = function(errorsCollection) {
    var err = 0,
        table = new Table({
            head: ['File'.white.bold, 'Errors'.white.bold],
            colWidths: [30, 30]
        });

    errorsCollection.forEach(function(errors) {
        var file = errors.getFilename(),
            errorsCount = errors.getErrorList().length;

        if (!errors.isEmpty()) {
            table.push(
                [file, errorsCount]
            );
            err += errorsCount;
        }
    });

    err += '';

    if (err > 0) {
        table.push(
            ['Total'.red.bold, err.red.bold]
        );
    } else {
        table.push(
            ['Total'.green.bold, err.green.bold]
        );
    }

    console.log('JSCS check\n' + table.toString());
};