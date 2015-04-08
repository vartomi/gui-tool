'use strict';

var assert = require('assert'),
    fs = require('fs'),
    exec = require('child_process').exec,
    msPerMin = 1000;

describe('gui-tool test (offline|online)', function() {

    describe('exists', function() {
        it('should return help of gui-tool test', function() {
            exec('node bin/gui-tool test --help', function(err, stdout) {
                assert.equal(true, stdout.indexOf('Usage: test [options]') > -1);
            });
        });
    });

    describe('prepare', function() {
        it('should create tmp directory, init project', function(done) {
            this.timeout(100 * msPerMin);
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
                    // if (stderr) throw new Error('' + stderr);
                    done();
                });
            });
        });
    });

    describe('test screen', function() {
        it('should create screenshots', function(done) {
            this.timeout(50 * msPerMin);
            exec('node ../bin/gui-tool test screen', {
                cwd: 'tmp'
            }, function(err) {
                if (err) {
                    throw err;
                }
                done();
            });
        });

        it('should find screenshots created in chrome', function() {
            fs.existsSync('tmp/screenshots/chrome/TmpApp_chrome_1024x768.png').should.equal(true);
            fs.existsSync('tmp/screenshots/chrome/TmpApp_chrome_1366x768.png').should.equal(true);
            fs.existsSync('tmp/screenshots/chrome/TmpApp_chrome_1920x1080.png').should.equal(true);
        });

        it('should find screenshots created in firefox', function() {
            fs.existsSync('tmp/screenshots/firefox/TmpApp_firefox_1024x768.png').should.equal(true);
            fs.existsSync('tmp/screenshots/firefox/TmpApp_firefox_1366x768.png').should.equal(true);
            fs.existsSync('tmp/screenshots/firefox/TmpApp_firefox_1920x1080.png').should.equal(true);
        });

        it('should find screenshots created in iexplorer', function() {
            fs.existsSync('tmp/screenshots/iexplorer/TmpApp_iexplorer_1024x768.png').should.equal(true);
            fs.existsSync('tmp/screenshots/iexplorer/TmpApp_iexplorer_1366x768.png').should.equal(true);
            fs.existsSync('tmp/screenshots/iexplorer/TmpApp_iexplorer_1920x1080.png').should.equal(true);
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