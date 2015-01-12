StartTest(function(t) {
    t.diag('Store class existence');
    t.requireOk(
    [
        {{stores}}
    ], 
    function() {
        t.done();
    }
    );
});


