'use strict';

var assert = require('assert'),
    fs = require('fs'),
    exec = require('child_process').exec,
    msPerMin = 1000;

describe('gui-tool generate (offline|online)', function() {

    describe('exists', function() {
        it('should return help of gui-tool generate', function() {
            exec('node bin/gui-tool generate --help', function(err, stdout) {
                assert.equal(true, stdout.indexOf('Usage: generate [options]') > -1);
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
                    //                    if (stderr) throw new Error('' + stderr);
                    done();
                });
            });
        });
    });

    describe('generate with gui.yml specification file', function() {
        this.timeout(20 * msPerMin);
        it('should found gui.yml in specification folder', function() {
            fs.existsSync('tmp/specification/gui.yml').should.equal(true);
        });

        it('should generate application sources', function(done) {
            exec('node ../bin/gui-tool generate -f', {
                cwd: 'tmp'
            }, function(err) {
                if (err) {
                    throw err;
                }
                //                if (stderr) throw new Error('' + stderr);
                done();
            });
        });

        it('should found generated files', function() {
            fs.existsSync('tmp/webui/app/Application.js').should.equal(true);
            fs.existsSync('tmp/webui/app/controller').should.equal(true);
            fs.existsSync('tmp/webui/app/model').should.equal(true);
            fs.existsSync('tmp/webui/app/store').should.equal(true);
            fs.existsSync('tmp/webui/app/view').should.equal(true);
            fs.existsSync('tmp/webui/app/view/Viewport.js').should.equal(true);
        });
    });

    describe('generate and compile with gui.yml specification file', function() {
        this.timeout(100 * msPerMin);
        it('should not found build folder', function() {
            fs.existsSync('tmp/webui/build/production/TmpApp').should.equal(false);
        });

        it('should generate and compile application sources', function(done) {
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

        it('should found generated files', function() {
            fs.existsSync('tmp/webui/app/Application.js').should.equal(true);
            fs.existsSync('tmp/webui/app/controller').should.equal(true);
            fs.existsSync('tmp/webui/app/model').should.equal(true);
            fs.existsSync('tmp/webui/app/store').should.equal(true);
            fs.existsSync('tmp/webui/app/view').should.equal(true);
            fs.existsSync('tmp/webui/app/view/Viewport.js').should.equal(true);
        });

        it('should found compiled files', function() {
            fs.existsSync('tmp/webui/build/production/TmpApp').should.equal(true);
        });
    });

    describe('generate with gui_copy.yml specification file', function() {
        this.timeout(20 * msPerMin);
        before(function(done) {
            var stream = fs.createReadStream('tmp/specification/gui.yml')
                .pipe(fs.createWriteStream('tmp/specification/gui_copy.yml'));
            stream.on('finish', function() {
                done();
            });
        });

        it('should found gui_copy.yml in specification folder', function() {
            fs.existsSync('tmp/specification/gui_copy.yml').should.equal(true);
        });

        it('should generate application sources', function(done) {
            exec('node ../bin/gui-tool generate -f -s gui_copy.yml', {
                cwd: 'tmp'
            }, function(err) {
                if (err) {
                    throw err;
                }
                //                if (stderr) throw new Error('' + stderr);
                done();
            });
        });

        it('should found generated files', function() {
            fs.existsSync('tmp/webui/app/Application.js').should.equal(true);
            fs.existsSync('tmp/webui/app/controller').should.equal(true);
            fs.existsSync('tmp/webui/app/model').should.equal(true);
            fs.existsSync('tmp/webui/app/store').should.equal(true);
            fs.existsSync('tmp/webui/app/view').should.equal(true);
            fs.existsSync('tmp/webui/app/view/Viewport.js').should.equal(true);
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
