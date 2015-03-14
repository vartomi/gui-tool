var assert = require("assert"),
    exec = require('child_process').exec;
    
describe('Test demo', function() {
    describe('gui-tool', function() {
        it('should return true if mocha is working', function(){
            assert.equal(true, ('gui-tool' === 'gui-tool'));
        });
    });
});