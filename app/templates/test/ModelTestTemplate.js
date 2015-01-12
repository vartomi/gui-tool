StartTest(function(t) {
    t.diag('Model class existence');
    t.requireOk(
    [
        {{models}}
    ], 
    function() {
        t.done();
    }
    );
});





