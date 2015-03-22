exports.cmdToExtJSFunc = {
    add: {
        window: 'add({param})',
        grid: 'add({param})',
        form: 'add({param}',
        panel: 'add({param})'
    },
    close: {
        window: 'close()',
        grid: 'close()',
        form: 'close()',
        panel: 'close()'
    },
    show: {
        window: 'show()',
    },
    filter: {
        grid: 'store.filterBy({param})'
    },
    sorter: {
        grid: 'store.sort({param})'
    },
    collapse: {
        grid: 'toggleCollapse()',
        form: 'toggleCollapse()'
    },
    load: {
        form: 'loadRecord(record)',
        grid: 'store.reload()'
    },
    clear: {
        grid: 'store.clearFilter()'
    }
};

exports.typeToExtJSEvent = {
    click: {
        grid: 'cellclick(me, td, cellIndex, record, tr, rowIndex)',
        button: 'click(me)',
        checkbox: 'change(me, newValue)'
    },
    select: {
        grid: 'select(me, record)'
    },
    dbclick: {
        grid: 'celldbclick(me, td, cellIndex, record, tr, rowIndex)'
    },
    type: {
        textfield: 'change(me, newValue)'
    }
};


