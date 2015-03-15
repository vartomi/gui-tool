'use strict';

var assert = require('assert'),
    exec = require('child_process').exec;

describe('gui-tool test (offline|online)', function() {
    
    describe('exists', function() {
        it('should return help of gui-tool test', function() {
            exec('node bin/gui-tool test --help', function (err, stdout) {
                assert.equal(true, stdout.indexOf('Usage: test [options]') > -1);
            });
        });
    });
});