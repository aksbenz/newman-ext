#! /usr/bin/env node

var fs = require('fs'),
    _ = require('lodash'),
    uuid = require('uuid/v4'),
    newman = require('newman'),
    tmp = require('tmp'),
    Collection = require('postman-collection').Collection,
    logLevel = 'INFO|ERROR|FATAL|DEBUG',
    cmd = require('./lib/cmd'),
    coll_ops = require('./lib/collection'),
    Limiter = require('async-limiter'),
    t;

module.exports.run = run;

if (process.argv[1].endsWith('newman-ext.js'))
    run(process.argv);
else
    console.log('Usage: newman-ext run <collection> [options]');

function run(params) {
    let program = cmd(params);

    let options = program.newmanOptions;
    let inputCollection;
    // let collections = [];
    let executions = [];

    // Merge multiple collections
    if (program.run.length > 1) {
        inputCollection = coll_ops.merge(program.run);
    } else
        inputCollection = JSON.parse(fs.readFileSync(program.run[0]).toString());

    if (program.tagParser)
        inputCollection = coll_ops.tagFilter(inputCollection, inputCollection, program.tagParser, program.removeEmptyDesc);

    // Remove exclude folders
    if (program.exclude.length > 0)
        inputCollection = coll_ops.exclude(inputCollection, inputCollection, program.exclude);

    // If THREADS is ON then ignore filtering by --folder
    if (!program.threads) {
        // Filter Collection to include only the provided folders
        if (program.folder.length > 1) {
            inputCollection = coll_ops.filter(inputCollection, inputCollection, program.folder);
            _.unset(options, 'folder');
        }
    }

    // If THREADS is ON, then create multiple options with same collection having a single folder filter for each
    if (program.threads && program.folder.length > 1) {
        _.each(program.folder, (folder) => {
            let option = _.cloneDeep(options);
            option.folder = folder;
            option.collection = inputCollection;
            executions.push(option);
            log('DEBUG', 'ADD: ' + folder);
        });
    } else {
        let option = _.cloneDeep(options);
        option.collection = inputCollection;
        executions.push(option);
    }

    if (program.exportCollection)
        fs.writeFileSync(program.exportCollection, JSON.stringify(inputCollection, null, 2));

    // In DEMO mode, convert each collection to Postman Collection Object to support unit tests
    if (program.demo) {
        executions = _.each(executions, (option, idx) => {
            executions[idx].collection = new Collection(option.collection);
        });
        return executions;
    } else
        executeNewman(executions, program.threads);
}

function executeNewman(executions, threads) {
    log('INFO', 'THREADS: ' + threads);
    if (threads) {
        t = new Limiter({ concurrency: threads });
        _.forEach(executions, (option) => { newmanrun(option, () => {}) });
    } else
        _.each(executions, (option) => {
            newman.run(option, (err, summary) => {});
        });
}

function newmanrun(option, cb) {
    t.push(function(done) {
        newman.run(option, (err, summary) => {
            if (err)
                log('ERROR', err);
            log('DEBUG', 'DONE NEWMAN: ' + option.folder);
            done();
            cb(err, summary)
        });
    });
}

function log(lvl, msg) {
    logLevel.includes(lvl) ? console.log(msg) : '';
}