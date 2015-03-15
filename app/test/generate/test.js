'use strict';

var assert = require('assert'),
    fs = require('fs'),
    exec = require('child_process').exec;

describe('gui-tool generate (offline|online)', function() {
    
    describe('exists', function() {
        it('should return help of gui-tool generate', function() {
            exec('node bin/gui-tool generate --help', function (err, stdout) {
                assert.equal(true, stdout.indexOf('Usage: generate [options]') > -1);
            });
        });
    });
    
    describe('prepare', function() {
        it('should create tmp directory, init project', function(done) {
            this.timeout(60000);
            fs.mkdir('tmp', function(err) {
                if (err) throw err;
                exec('node ../bin/gui-tool init --extjs ../sdk/extjs --siesta ../sdk/siesta', { cwd: 'tmp' }, function(err, stdout, stderr) {
                    if (err) throw err;
    //                if (stderr) throw new Error('' + stderr);                
                    done();
                });
            });
        });
    });
    
    describe('generate with gui.yml specification file', function() {        
        it('should found gui.yml in specification folder', function() {
            fs.existsSync('tmp/specification/gui.yml').should.equal(true); 
        });
        
        it('should generate application sources', function(done) {
            exec('node ../bin/gui-tool generate -f', { cwd: 'tmp' }, function(err, stdout, stderr) {
                if (err) throw err;
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
            this.timeout(60000);
            exec('rm -rf tmp', function(err) {
                if (err) throw err;
                done();
            });
        });
    });
});