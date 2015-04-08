'use strict';

var exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    assert = require('assert'),
    fs = require('fs'),
    http = require('http'),
    msPerMin = 1000;

describe('gui-tool run (offline|online)', function() {

    describe('exists', function() {
        it('should return help of gui-tool run', function() {
            exec('node bin/gui-tool run --help', function(err, stdout) {
                assert.equal(true, stdout.indexOf('Usage: run [options]') > -1);
            });
        });
    });

    describe('prepare', function() {
        it('should create tmp directory, init and generate project', function(done) {
            this.timeout(200 * msPerMin);
            fs.mkdir('tmp', function(err) {
                if (err) {
                    throw err;
                }
                exec('node ../bin/gui-tool init TmpApp --extjs ../sdk/extjs --siesta ../sdk/siesta', {
                    cwd: 'tmp'
                }, function(err) {
                    if (err) {
                        throw err;
                    }
                    //                if (stderr) throw new Error('' + stderr);
                    exec('node ../bin/gui-tool generate -f -c', {
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
        });
    });

    describe('run application in development mode', function() {
        this.timeout(30 * msPerMin);
        var serverProcess;

        before(function() {
            serverProcess = spawn('node', ['../bin/gui-tool', 'run', '--quiet'], {
                cwd: 'tmp'
            });
        });

        after(function() {
            serverProcess.kill();
        });

        it('should available on 4007 port', function(done) {
            setTimeout(function() {
                var options = {
                        method: 'HEAD',
                        host: 'localhost',
                        port: 4007,
                        path: '/'
                    },
                    req = http.request(options, function(resp) {
                        if (resp.statusCode === 200) {
                            done();
                        }
                    });
                req.end();
            }, 4000);
        });
    });

    describe('run application in production mode', function() {
        this.timeout(30 * msPerMin);
        var serverProcess;

        before(function() {
            serverProcess = spawn('node', ['../bin/gui-tool', 'run', '--quiet', '--prod'], {
                cwd: 'tmp'
            });
        });

        after(function() {
            serverProcess.kill();
        });

        it('should available on 4008 port', function(done) {
            setTimeout(function() {
                var options = {
                        method: 'HEAD',
                        host: 'localhost',
                        port: 4008,
                        path: '/'
                    },
                    req = http.request(options, function(resp) {
                        if (resp.statusCode === 200) {
                            done();
                        }
                    });
                req.end();
            }, 4000);
        });
    });

    describe('cleanup', function() {
        it('should remove tmp directory', function(done) {
            this.timeout(100 * msPerMin);
            exec('rm -rf tmp', function(err) {
                if (err) {
                    throw err;
                }
                done();
            });
        });
    });
});