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

    let options = program.newmanOptions;
    let inputCollection;
    let collections = [];
    let executions = [];

    // Merge multiple collections
    if (program.run.length > 1) {
        inputCollection = coll_ops.merge(program.run);
    } else
        inputCollection = JSON.parse(fs.readFileSync(program.run[0]).toString());

    if (program.tagIncludetest.length > 0)
        inputCollection = coll_ops.tagFilter(inputCollection, inputCollection, { 'tagIncludetest': program.tagIncludetest });

    // Remove exclude folders
    if (program.exclude.length > 0)
        inputCollection = coll_ops.exclude(inputCollection, inputCollection, program.exclude);

    // If SEQUENTIAL is ON then ignore --folder, --group and --parallel
    if (!program.seq) {
        // Filter Collection to include only the provided folders
        if (program.folder.length > 1) {
            inputCollection = coll_ops.filter(inputCollection, inputCollection, program.folder, { 'tagIncludetest': program.tagIncludetest });
            _.unset(options, 'folder');
        }
        collections.push(inputCollection)

        // // Split into multiple collections
        // if (program.group)
        //     collections = coll_ops.split(inputCollection, program.group);
        // else if (program.parallel)
        //     collections = coll_ops.split(inputCollection, program.parallel, true);
        // else collections.push(inputCollection);
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
        // console.log(options);
        executions = _.each(executions, (option, idx) => {
            executions[idx].collection = new Collection(option.collection);
        });
        return executions;

    } else
        executeNewman(executions, program.seq)
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

function log(lvl, msg) {
    logLevel.includes(lvl) ? console.log(msg) : '';
}