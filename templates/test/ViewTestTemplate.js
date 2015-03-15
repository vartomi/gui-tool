StartTest(function(t) {
    t.diag('View class existence');
    t.requireOk(
    [
        {{views}}
    ], 
    function() {
        t.done();
    }
    );
});


