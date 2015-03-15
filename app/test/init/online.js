/*describe('gui-tool init (online)', function() {
    describe('beforeScenario', function() {
        it('should create tmp directory', function(done){
            fs.mkdir('tmp', function(err) {
                if (err) throw err;
                done();
            });
        });
    });
    
    describe('init project', function() {
        it('should create gui-tool project in tmp directory', function(done){
            this.timeout(240000);
            exec('node ../bin/gui-tool init', { cwd: 'tmp' }, function(err, stdout, stderr) {
                if (err) throw err;
                console.log(stdout);
                console.log('######################');
                console.log(stderr);
                done();
            });
        });
    });
    
    describe('afterScenario', function() {
        it('should remove tmp directory', function(done){
            this.timeout(240000);
            exec('rm -rf tmp', function(err, stdout, stder) {
                if (err) throw err;
                done();
            });
        });
    });
});*/