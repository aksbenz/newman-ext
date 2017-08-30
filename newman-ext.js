#! /usr/bin/env node

var fs = require('fs'),
    _ = require('lodash'),
    newman = require('newman'),
    Collection = require('postman-collection').Collection,
    logLevel = 'INFO|ERROR|FATAL',
    cmd = require('./lib/cmd');

module.exports.run = run;
if (process.argv[1].endsWith('newman-ext.js'))
    run(process.argv);
else
    console.log('Usage: newman-ext run <collection> [options]');

function run(params) {
    let program = cmd(params);
    let options = prepareOptions(program);
    let inputCollection = new Collection(JSON.parse(fs.readFileSync(program.run).toString()));
    let collections = [];

    if (program.folder.length > 1) {
        let filteredCollection = filter(inputCollection, inputCollection, program.folder);
        inputCollection = filteredCollection;
        _.unset(options, 'folder');
    }

    if (program.parallel)
        collections = splitCollection(inputCollection, program.parallel)
    else
        collections.push(inputCollection);

    if (program.demo) {
        // console.log('DEMO MODE');
        options.collections = collections;
        return options;
    } else
        executeNewman(collections, options);
}

function executeNewman(collections, options) {
    collections.forEach(collection => {
        let option = _.cloneDeep(options);
        option.collection = collection;
        newman.run(option, (err, summary) => {
            if (err)
                log('ERROR', err);
            log('INFO', 'DONE');
        });
    })
}

function splitCollection(collection, count) {
    count = _.parseInt(count);
    let collections = [];
    let totalFolders = collection.items.count();
    if (count >= totalFolders)
        collections.push(collection);
    else {
        for (var i = 0; i < totalFolders; i += count) {
            let partCollection = new Collection(collection.toJSON());
            for (var j = totalFolders - 1; j >= 0; j--) // Remove all other folders from this collection
                if (!(j >= i && j < (i + count)))
                    partCollection.items.remove(partCollection.items.idx(j).id);
            collections.push(partCollection);
        }
    }
    return collections;
}

function prepareOptions(program) {
    let reporter;
    if (program.reporterHtmlExport)
        reporter = {
            html: {
                export: program.reporterHtmlExport
            }
        };
    if (program.reporterHtmlTemplate)
        reporter = reporter ? _.set(reporter, 'html.template', program.reporterHtmlTemplate) : {
            html: {
                template: program.reporterHtmlTemplate
            }
        };

    let options = {
        'environment': program.environment,
        'globals': program.globals,
        'iterationCount': program.iterationCount,
        'iterationData': program.iterationData,
        'folder': program.folder.length === 1 ? program.folder[0] : undefined,
        'timeoutRequest': program.timeoutRequest,
        'delayRequest': program.delayRequest,
        'ignoreRedirects': program.ignoreRedirects,
        'insecure': program.insecure,
        'bail': program.bail,
        'suppressExitCode': program.suppressExitCode,
        'reporters': program.reporters.length === 1 ? program.reporters[0] : program.reporters,
        'reporter': reporter,
        'color': program.color ? program.color : undefined,
        'sslClientCert': program.sslClientCert,
        'sslClientKey': program.sslClientKey,
        'sslClientPassphrase': program.sslClientPassphrase
    };

    // Remove undefined parameters
    options = _.pickBy(options, src => {
        if (src === undefined) return false;
        else return true;
    })
    return options;
}

// Keeps all requests and folders below the Matching Folders
// Maintains tree structure of matching folder
// Deletes any requests in parent folders
function filter(folder, parent, includeFolders, l = '|__') {
    log('DEBUG', l + 'START:' + folder.name);
    if (!includeFolders.includes(folder.name)) { // Skip the Folder if Name is part of include list
        if (!isLeaf(folder)) { // Check if it has any sub-folders
            for (var i = folder.items.count() - 1; i >= 0; i--) {
                let item = folder.items.idx(i);
                log('DEBUG', l + 'ITEM:' + item.name)
                if (item.items) // If a folder then recurse
                    filter(item, folder, includeFolders, l + '|__');
                else // If a request then remove it
                {
                    log('DEBUG', l + 'REMOVE1:' + item.name);
                    folder.items.remove(item.id);
                }
            }
            if (isLeaf(folder)) // If all sub-folders are removed then remove the parent
            {
                log('DEBUG', l + 'REMOVE2:' + folder.name);
                parent.items.remove(folder.id);
            }
        } else // Remove if there are no sub-folders
        {
            log('DEBUG', l + 'REMOVE3:' + folder.name);
            parent.items.remove(folder.id);
        }
    }
    log('DEBUG', l + 'END:' + folder.name);
    return folder;
}

function isLeaf(fld) {
    return !fld.items.all().some(item => {
        return item.items;
    });
}

function log(lvl, msg) {
    logLevel.includes(lvl) ? console.log(msg) : '';
}