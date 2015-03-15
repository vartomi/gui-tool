var Harness = Siesta.Harness.Browser.ExtJS

Harness.configure({
    title: 'RapidGui test suites',
    autoCheckGlobals: true,
    
    loaderPath  : { 'RapidGui' : 'app' },
    
    expectedGlobals: [
        'Ext',
        'RapidGui'
    ],
    
    preload : [
        "http://cdn.sencha.io/ext/gpl/4.2.0/resources/css/ext-all.css",
        "http://cdn.sencha.io/ext/gpl/4.2.0/ext-all-debug.js"
    ]
})


Harness.start(
        {{testUrls}}
)


