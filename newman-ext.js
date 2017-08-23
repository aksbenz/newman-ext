#! /usr/bin/env node

const fs = require('fs'),
    _ = require('lodash'),
    newman = require('newman'),
    Collection = require('postman-collection').Collection,
    logLevel = 'INFO|ERROR|FATAL',
    cmd = require('./lib/cmd');

let testMode = false;

module.exports.run = run;
module.exports.setTestMode = function(mode) { testMode = mode; }
module.exports.getTestMode = function() { return testMode; }

if (process.argv.length > 2)
    run(process.argv);
else
    console.log('Usage: newman-ext run <collection> [options]');

function run(args) {
    let program = cmd(args);
    let options = prepareOptions(program);

    if (program.folder.length > 1) {
        let inputCollection = new Collection(JSON.parse(fs.readFileSync(program.run).toString()));
        let filteredCollection = filter(inputCollection, inputCollection, program.folder);
        options.collection = filteredCollection;
        _.unset(options, 'folder');
    } else
        options.collection = program.run;

    console.log(args);

    if (testMode)
        return options;
    else
        newman.run(options, (err, summary) => {
            if (err)
                log('ERROR', err);
            log('INFO', 'DONE');
        });
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