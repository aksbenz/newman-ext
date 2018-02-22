const _ = require('lodash');
var expect = require('chai').expect;
var rewire = require("rewire");
var coll = require('../lib/collection');
var n = rewire(require.resolve('../newman-ext.js'));
var fs = require('fs');

let initparams = _.concat(process.argv, 'run', './tests/sample.postman_collection.json', '--demo');

beforeEach(() => {
    // This is required to have a new command object for each test
    // Otherwise due to the way CommanderJS creates the command object
    // it is just created once by first test and same object is used by all tests
    var program = rewire(require.resolve('commander'));
    var cmd = rewire(require.resolve('../lib/cmd.js'));
    cmd.__set__('program', program);
    n.__set__('cmd', cmd);
});

test('run single collection', () => {
    let executions = n.run(initparams);
    expect(executions).to.have.length(1);
    expect(executions[0].collection.items.count()).to.equal(10);
    expect(coll.allFoldersUnder(executions[0].collection)).to.have.length(21);
});

test('run two collections', () => {
    let executions = n.run(_.concat(initparams, 'run', './tests/sample2.postman_collection.json'));
    expect(executions).to.have.length(1);
    expect(executions[0].collection.items.count()).to.equal(2);

    let fldone = executions[0].collection.items.idx(0),
        fldtwo = executions[0].collection.items.idx(1);

    expect(fldone.name).to.equal('sample');
    expect(fldtwo.name).to.equal('sample2');

    expect(fldone.items.count()).to.equal(10);
    expect(fldtwo.items.count()).to.equal(10);

    expect(coll.allFoldersUnder(fldone)).to.have.length(21);
    expect(coll.allFoldersUnder(fldtwo)).to.have.length(21);

    expect(coll.allFoldersUnder(executions[0].collection)).to.have.length(44);
    expect(executions[0].collection.name).to.equal('sample_sample2');

    // fs.writeFileSync('merged.json', JSON.stringify(options.collections[0].toJSON(), '', 2));
});

test('run two collections filter one folder', () => {
    let executions = n.run(_.concat(initparams, 'run', './tests/sample2.postman_collection.json', '--folder', 'one'));

    expect(executions[0].folder).to.equal('one');
    expect(executions).to.have.length(1);
    expect(executions[0].collection.items.count()).to.equal(2);

    let fldone = executions[0].collection.items.idx(0),
        fldtwo = executions[0].collection.items.idx(1);

    expect(fldone.name).to.equal('sample');
    expect(fldtwo.name).to.equal('sample2');

    expect(fldone.items.count()).to.equal(10);
    expect(fldtwo.items.count()).to.equal(10);

    expect(coll.allFoldersUnder(fldone)).to.have.length(21);
    expect(coll.allFoldersUnder(fldtwo)).to.have.length(21);

    expect(coll.allFoldersUnder(executions[0].collection)).to.have.length(44);
    expect(executions[0].collection.name).to.equal('sample_sample2');
});

test('run two collections filter folders multiple level two', () => {
    let executions = n.run(_.concat(initparams, 'run', './tests/sample2.postman_collection.json', '--folder', 'one_one', '--folder', 'two_one'));

    expect(executions[0].folder).to.be.undefined;
    expect(executions).to.have.length(1);
    expect(executions[0].collection.items.count()).to.equal(2);
    expect(executions[0].collection.name).to.equal('sample_sample2');

    let collone = executions[0].collection.items.idx(0),
        colltwo = executions[0].collection.items.idx(1);

    expect(collone.name).to.equal('sample');
    expect(colltwo.name).to.equal('sample2');
    expect(collone.items.count()).to.equal(2);

    // Test Collection One
    let fldone = collone.items.idx(0),
        fldtwo = collone.items.idx(1);

    expect(fldone.name).to.equal('one');
    expect(fldtwo.name).to.equal('two');
    expect(fldone.items.count()).to.equal(1);

    expect(coll.allRequestsUnder(fldone)).to.have.length(5);
    expect(coll.allRequestsUnder(fldtwo)).to.have.length(2);

    expect(coll.allFoldersUnder(fldone)).to.have.length(5);
    expect(coll.allFoldersUnder(fldtwo)).to.have.length(2);

    let fldOneNames = _.map(coll.allFoldersUnder(fldone), fld => { return fld.name });
    expect(_.difference(['one_one', 'one_one_one', 'one_one_one_one', 'one_one_one_two', 'common_one'], fldOneNames)).to.have.length(0);
    expect(_.difference(fldOneNames, ['one_one', 'one_one_one', 'one_one_one_one', 'one_one_one_two', 'common_one'])).to.have.length(0);

    let fldTwoNames = _.map(coll.allFoldersUnder(fldtwo), fld => { return fld.name });
    expect(_.difference(['two_one', 'common_one'], fldTwoNames)).to.have.length(0);
    expect(_.difference(fldTwoNames, ['two_one', 'common_one'])).to.have.length(0);

    // Test Collection Two
    fldone = colltwo.items.idx(0);
    fldtwo = colltwo.items.idx(1);

    expect(fldone.name).to.equal('one');
    expect(fldtwo.name).to.equal('two');
    expect(fldone.items.count()).to.equal(1);

    expect(coll.allRequestsUnder(fldone)).to.have.length(5);
    expect(coll.allRequestsUnder(fldtwo)).to.have.length(2);

    expect(coll.allFoldersUnder(fldone)).to.have.length(5);
    expect(coll.allFoldersUnder(fldtwo)).to.have.length(2);

    fldOneNames = _.map(coll.allFoldersUnder(fldone), fld => { return fld.name });
    expect(_.difference(['one_one', 'one_one_one', 'one_one_one_one', 'one_one_one_two', 'common_one'], fldOneNames)).to.have.length(0);
    expect(_.difference(fldOneNames, ['one_one', 'one_one_one', 'one_one_one_one', 'one_one_one_two', 'common_one'])).to.have.length(0);

    fldTwoNames = _.map(coll.allFoldersUnder(fldtwo), fld => { return fld.name });
    expect(_.difference(['two_one', 'common_one'], fldTwoNames)).to.have.length(0);
    expect(_.difference(fldTwoNames, ['two_one', 'common_one'])).to.have.length(0);
});