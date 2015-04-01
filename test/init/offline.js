'use strict';

var assert = require('assert'),
    fs = require('fs'),
    exec = require('child_process').exec,
    msPerMin = 1000;

describe('gui-tool init (offline)', function() {
    describe('exists', function() {
        it('should return help of gui-tool init', function() {
            exec('node bin/gui-tool init --help', function(err, stdout) {
                assert.equal(true, stdout.indexOf('Usage: init [options] <name> [dir]') > -1);
            });
        });
    });

    describe('prepare', function() {
        it('should create tmp directory', function(done) {
            fs.mkdir('tmp', function(err) {
                if (err) {
                    throw err;
                }
                done();
            });
        });
    });

    describe('init project with existing ExtJS and Siesta', function() {
        it('should create gui-tool project in tmp directory', function(done) {
            this.timeout(100 * msPerMin);
            exec('node ../bin/gui-tool init TmpApp --extjs ../sdk/extjs --siesta ../sdk/siesta', {
                cwd: 'tmp'
            }, function(err) {
                if (err) {
                    throw err;
                }
                //                if (stderr) throw new Error('' + stderr);
                done();
            });
        });
    });

    describe('project files exist', function() {
        it('should found project hierarchy', function() {
            fs.existsSync('tmp/guitool.json').should.equal(true);
            fs.existsSync('tmp/test').should.equal(true);
            fs.existsSync('tmp/specification').should.equal(true);
            fs.existsSync('tmp/webui').should.equal(true);
        });

        it('should found ExtJS hierarchy', function() {
            fs.existsSync('tmp/webui/.sencha').should.equal(true);
            fs.existsSync('tmp/webui/ext').should.equal(true);
            fs.existsSync('tmp/webui/app').should.equal(true);
            fs.existsSync('tmp/webui/app.json').should.equal(true);
            fs.existsSync('tmp/webui/build.xml').should.equal(true);
        });
    });

    describe('re-init project with existing ExtJS and Siesta', function() {
        before(function(done) {
            this.timeout(100 * msPerMin);
            exec('rm -rf webui/ && rm -rf test/', {
                cwd: 'tmp'
            }, function(err) {
                if (err) {
                    throw err;
                }
                fs.unlink('tmp/guitool.json', function(err) {
                    if (err) {
                        throw err;
                    }
                    done();
                });
            });
        });

        it('should create gui-tool project in tmp directory', function(done) {
            this.timeout(80 * msPerMin);
            exec('node ../bin/gui-tool init -r TmpApp --extjs ../sdk/extjs --siesta ../sdk/siesta', {
                cwd: 'tmp'
            }, function(err) {
                if (err) {
                    throw err;
                }
                //                if (stderr) throw new Error('' + stderr);
                done();
            });
        });
    });

    describe('project files exist after re-init', function() {
        it('should found project hierarchy', function() {
            fs.existsSync('tmp/guitool.json').should.equal(true);
            fs.existsSync('tmp/test').should.equal(true);
            fs.existsSync('tmp/specification').should.equal(true);
            fs.existsSync('tmp/webui').should.equal(true);
        });

        it('should found ExtJS hierarchy', function() {
            fs.existsSync('tmp/webui/.sencha').should.equal(true);
            fs.existsSync('tmp/webui/ext').should.equal(true);
            fs.existsSync('tmp/webui/app').should.equal(true);
            fs.existsSync('tmp/webui/app.json').should.equal(true);
            fs.existsSync('tmp/webui/build.xml').should.equal(true);
        });
    });

    describe('cleanup', function() {
        it('should remove tmp directory', function(done) {
            this.timeout(100 * msPerMin);
            exec('rm -rf tmp/', function(err) {
                if (err) {
                    throw err;
                }
                done();
            });
        });
    });
});