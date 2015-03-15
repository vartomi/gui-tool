StartTest(function(t) {
    t.diag('Controller class existence');
    t.requireOk(
    [
        {{controllers}}
    ], 
    function() {
        t.done();
    }
    );
});


