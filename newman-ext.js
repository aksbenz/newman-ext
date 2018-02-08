#! /usr/bin/env node

var fs = require('fs'),
    _ = require('lodash'),
    newman = require('newman'),
    tmp = require('tmp'),
    Collection = require('postman-collection').Collection,
    ItemGroup = require('postman-collection').ItemGroup,
    logLevel = 'INFO|ERROR|FATAL',
    cmd = require('./lib/cmd'),
    coll_ops = require('./lib/collection');

module.exports.run = run;

if (process.argv[1].endsWith('newman-ext.js'))
    run(process.argv);
else
    console.log('Usage: newman-ext run <collection> [options]');

function run(params) {
    let program = cmd(params);

    let options = prepareOptions(program);
    let inputCollection;
    let collections = [];

    // Merge multiple collections
    if (program.run.length > 1) {
        inputCollection = coll_ops.merge_v2(program.run);
    } else
        inputCollection = JSON.parse(fs.readFileSync(program.run[0]).toString());

    // Filter Collection to include only the provided folders
    if (program.folder.length > 1) {
        inputCollection = coll_ops.filter_v2(inputCollection, inputCollection, program.folder);
        _.unset(options, 'folder');
    }

    // Split into multiple collections
    if (program.group)
        collections = coll_ops.split_v2(inputCollection, program.group)
    else if (program.parallel)
        collections = coll_ops.split_v2(inputCollection, program.parallel, true)
    else
        collections.push(inputCollection);

    if (program.demo) {
        // In DEMO mode, convert each collection to Postman Collection Object to support for unit tests
        options.collections = _.each(collections, (coll, idx) => {
            collections[idx] = new Collection(coll);
        });
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

function log(lvl, msg) {
    logLevel.includes(lvl) ? console.log(msg) : '';
}