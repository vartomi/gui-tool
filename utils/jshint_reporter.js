require('colors');

var Table = require('cli-table');
module.exports = {
    reporter: function(errorsCollection) {
        var err = errorsCollection.length,
            files = {},
            table = new Table({
                head: ['File'.white.bold, 'Error'.white.bold],
                colWidths: [30, 30]
            });

        errorsCollection.forEach(function(error) {
            if (!files[error.file]) {
                files[error.file] = 1;
            } else {
                files[error.file] += 1;
            }
        });

        for (var file in files) {
            table.push(
                [file, files[file]]
            );
        }

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

        console.log('JSHint check\n' + table.toString());
    }
};