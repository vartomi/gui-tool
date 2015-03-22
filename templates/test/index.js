var Harness = Siesta.Harness.Browser.ExtJS

Harness.configure({
    title: '{{appName}} test suites',
    autoCheckGlobals: true,
    
    loaderPath  : { '{{appName}}' : 'app' },
    
    expectedGlobals: [
        'Ext',
        '{{appName}}'
    ],
    
    preload : [
        "http://cdn.sencha.io/ext/gpl/4.2.0/resources/css/ext-all.css",
        "http://cdn.sencha.io/ext/gpl/4.2.0/ext-all-debug.js"
    ]
})


Harness.start(
        {{testUrls}}
)


