#! /usr/bin/env node

var fs = require('fs'),
    _ = require('lodash'),
    uuid = require('uuid/v4'),
    newman = require('newman'),
    tmp = require('tmp'),
    Collection = require('postman-collection').Collection,
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
    let executions = [];

    // Merge multiple collections
    if (program.run.length > 1) {
        inputCollection = coll_ops.merge_v2(program.run);
    } else
        inputCollection = JSON.parse(fs.readFileSync(program.run[0]).toString());

    if (program.tagIncludetest.length > 0) {
        // console.log('TAG INCLUDE');
        // console.log(program.tagIncludetest);
        inputCollection = coll_ops.tagFilter(inputCollection, inputCollection, { 'tagIncludetest': program.tagIncludetest })
            // console.log(inputCollection);
    }

    // If SEQUENTIAL is ON then ignore --folder, --group and --parallel
    if (!program.seq) {
        // Filter Collection to include only the provided folders
        if (program.folder.length > 1) {
            inputCollection = coll_ops.filter_v2(inputCollection, inputCollection, program.folder, { 'tagIncludetest': program.tagIncludetest });
            _.unset(options, 'folder');
        }

        // Split into multiple collections
        if (program.group)
            collections = coll_ops.split_v2(inputCollection, program.group);
        else if (program.parallel)
            collections = coll_ops.split_v2(inputCollection, program.parallel, true);
        else collections.push(inputCollection);
    } else
        collections.push(inputCollection);

    // If SEQUENTIAL is ON, then create multiple options with same collection having a single folder filter for each
    if (program.seq && program.folder.length > 1) {
        _.each(program.folder, (folder) => {
            let option = _.cloneDeep(options);
            option.folder = folder;
            option.collection = collections[0];
            executions.push(option);
        });
    } else {
        _.each(collections, (collection) => {
            let option = _.cloneDeep(options);
            option.collection = collection;
            executions.push(option);
        });
    }

    // In DEMO mode, convert each collection to Postman Collection Object to support unit tests
    if (program.demo) {
        console.log(options);
        executions = _.each(executions, (option, idx) => {
            executions[idx].collection = new Collection(option.collection);
        });
        return executions;

    } else
        executeNewman(executions, program.seq)
}

function executeNewman_v1(collections, options) {
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

function executeNewman(executions, isSequential) {
    // Using Array Reduce to execute promises in sequence
    if (isSequential)
        _.reduce(executions, (chain, option) => {
            return chain.then(() => { return newmanPromise(option); });
        }, Promise.resolve([]));
    else
        _.each(executions, (option) => {
            newman.run(option, (err, summary) => {
                console.log('Finished');
            });
        });
}

let newmanPromise = function(option) {
    return new Promise((resolve, reject) => {
        newman.run(option, (err, summary) => {
            if (err)
                log('ERROR', err);
            log('INFO', 'DONE');
            resolve(summary);
        });
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
        'sslClientPassphrase': program.sslClientPassphrase,
        'timeout': program.timeout || 36000000
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