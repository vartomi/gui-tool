var generator = require('../lib/generator'),
    path = require('path'),
    logHandler = require('../loghandler.js'),
    templatePath = path.resolve(__dirname, '../templates'),
    targetPath = 'webui/app/',
    extPath = 'RapidGui.';    

exports.createStoresWithModels = function (models) {
    var modelName,
        storeName,
        modelPath,
        storePath,
        fieldsArray = [],
        fieldsString,
        itemPath,
        com = '\'',
        modelsArray = [],
        storesArray = [],
        dataArray,
        proxy;
    

    try {

        models.forEach(function (model) {
            modelName = model.name;
            modelPath = extPath + 'model.' + modelName;
            storeName = modelName + 's';
            storePath = extPath + 'store.' + storeName;
            
            proxy = model.proxy.split(':');
            if (proxy[0] === 'mock') {
                dataArray = generateMockData(model.fields, proxy[1]);                
                proxy = '';
            }

            // Store generating
            generator.processTemplate(
            {
                definePath: storeName,
                model: modelPath,
                proxyUrl: proxy,
                data: dataArray
            }, {
                sourceBaseDir: templatePath + '/store',
                targetBaseDir: targetPath + '/store',
                template: 'StoreTemplate.js',
                fileName: storeName + '.js'
            });

            itemPath = '\'' + storePath + '\'';
            logHandler.itemLog(itemPath);  
            storesArray.push(itemPath);       

            fieldsArray = model.fields;

            if (model.has) {
                model.has.forEach(function (assoc) {
                    if (assoc.inResource) {
                        // TODO hasmany
                    } else {
                        fieldsArray.push(assoc.key);
                    }
                });
            }

            fieldsString = '\'';
            fieldsString += fieldsArray.join('\',\'');
            fieldsString += '\'';

            if (model.typedFields) {
                fieldsArray = [];
                model.typedFields.forEach(function (field) {
                    fieldsArray.push('{name: ' + com + field.name + com + ',' +
                                     'type: ' + com + field.type + com + ',' + 
                                     'format: ' + com + field.format + com + '}');
                });
                fieldsString += ',' + fieldsArray.join(',');
            }

            generator.processTemplate(
            {
                definePath: modelName,
                fields: fieldsString
            }, {
                sourceBaseDir: templatePath + '/model',
                targetBaseDir: targetPath + '/model',
                template: 'ModelTemplate.js',
                fileName: modelName + '.js'
            });

            itemPath = '\'' + modelPath + '\'';
            logHandler.itemLog(itemPath);        
            modelsArray.push(itemPath);
        });
    } catch (e) {        
        logHandler.error(e);    
    }
    
    return {
        models: modelsArray.join(',\n'),
        stores: storesArray.join(',\n'),
    };
};

var loremIpsumArray =["lorem","ipsum","dolor","sit","amet,","consectetur","adipisicing","elit,","sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua.","enim","ad","minim","veniam,","quis","nostrud","exercitation","ullamco","laboris","nisi","ut","aliquip","ex","ea","commodo","consequat.","duis","aute","irure","dolor","in","reprehenderit","in","voluptate","velit","esse","cillum","dolore","eu","fugiat","nulla","pariatur.","excepteur","sint","occaecat","cupidatat","non","proident,","sunt","in","culpa","qui","officia","deserunt","mollit","anim","id","est","laborum.","sed","ut","perspiciatis,","unde","omnis","iste","natus","error","sit","voluptatem","accusantium","doloremque","laudantium,","totam","rem","aperiam","eaque","ipsa,","quae","ab","illo","inventore","veritatis","et","quasi","architecto","beatae","vitae","dicta","sunt,","explicabo.","nemo","enim","ipsam","voluptatem,","quia","voluptas","sit,","aspernatur","aut","odit","aut","fugit,","sed","quia","consequuntur","magni","dolores","eos,","qui","ratione","voluptatem","sequi","nesciunt,","neque","porro","quisquam","est,","qui","dolorem","ipsum,","quia","dolor","sit,","amet,","consectetur,","adipisci","velit,","sed","quia","non","numquam","eius","modi","tempora","incidunt,","ut","labore","et","dolore","magnam","aliquam","quaerat","voluptatem.","ut","enim","ad","minima","veniam,","quis","nostrum","exercitationem","ullam","corporis","suscipit","laboriosam,","nisi","ut","aliquid","ex","ea","commodi","consequatur?","quis","autem","vel","eum","iure","reprehenderit,","qui","in","ea","voluptate","velit","esse,","quam","nihil","molestiae","consequatur,","vel","illum,","qui","dolorem","eum","fugiat,","quo","voluptas","nulla","pariatur?","at","vero","eos","et","accusamus","et","iusto","odio","dignissimos","ducimus,","qui","blanditiis","praesentium","voluptatum","deleniti","atque","corrupti,","quos","dolores","et","quas","molestias","excepturi","sint,","obcaecati","cupiditate","non","provident,","similique","sunt","in","culpa,","qui","officia","deserunt","mollitia","animi,","id","est","laborum","et","dolorum","fuga.","harum","quidem","rerum","facilis","est","et","expedita","distinctio.","Nam","libero","tempore,","cum","soluta","nobis","est","eligendi","optio,","cumque","nihil","impedit,","quo","minus","id,","quod","maxime","placeat,","facere","possimus,","omnis","voluptas","assumenda","est,","omnis","dolor","repellendus.","temporibus","autem","quibusdam","aut","officiis","debitis","aut","rerum","necessitatibus","saepe","eveniet,","ut","et","voluptates","repudiandae","sint","molestiae","non","recusandae.","itaque","earum","rerum","hic","tenetur","a","sapiente","delectus,","aut","reiciendis","voluptatibus","maiores","alias","consequatur","aut","perferendis","doloribus","asperiores","repellat"];
var loremIpsumArrayLength = loremIpsumArray.length;

var generateMockDataArrayPush = function (field) {
    var wordIndex = Math.floor((Math.random() * loremIpsumArrayLength) + 1);
    this.push(field + ': ' + '\'' + loremIpsumArray[wordIndex - 1] + '\'');
};

var generateMockData = function (fields, number) {
    var fieldsArray = [],
        dataArray = [],
        fieldsString,
        i;
    
    for (i = number; i > 0; i--) {
        fieldsString = '{';
        fields.forEach(generateMockDataArrayPush.bind(fieldsArray));
        fieldsString += fieldsArray.join(',') + '}';
        dataArray.push(fieldsString);
        fieldsArray = [];
    }
    
    return dataArray.join(',');
};


