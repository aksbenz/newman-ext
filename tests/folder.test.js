const _ = require('lodash');
var expect = require('chai').expect;
var rewire = require("rewire");
var coll = require('../lib/collection');
var n = rewire(require.resolve('../newman-ext.js'));

let initparams = _.concat(process.argv, 'run', './tests/sample.postman_collection.json', '--demo');

beforeEach(() => {
    // This is required to have a new command object for each test
    // Otherwise due to how CommanderJS creates the command object
    // it is just created once by first test and same object is used by all tests
    var program = rewire(require.resolve('commander'));
    var cmd = rewire(require.resolve('../lib/cmd.js'));
    cmd.__set__('program', program);
    n.__set__('cmd', cmd);
});

test('--folder single', () => {
    let executions = n.run(_.concat(initparams, '--folder', 'one'));
    expect(executions[0].folder).to.equal('one');
});
test('--folder multiple single level', () => {
    let executions = n.run(_.concat(initparams, '--folder', 'one', '--folder', 'two'));
    expect(executions[0].folder).to.be.undefined;
    expect(executions).to.have.length(1);
    expect(executions[0].collection.items.count()).to.equal(2);

    let fldone = executions[0].collection.items.idx(0),
        fldtwo = executions[0].collection.items.idx(1);
    expect(fldone.name).to.equal('one');
    expect(fldtwo.name).to.equal('two');
    expect(fldone.items.count()).to.equal(3);
    expect(coll.allRequestsUnder(fldone)).to.have.length(7);
    expect(coll.allRequestsUnder(fldtwo)).to.have.length(3);
});

test('--folder multiple level two', () => {
    let executions = n.run(_.concat(initparams, '--folder', 'one_one', '--folder', 'two_one'));
    expect(executions[0].folder).to.be.undefined;
    expect(executions).to.have.length(1);
    expect(executions[0].collection.items.count()).to.equal(2);

    let fldone = executions[0].collection.items.idx(0),
        fldtwo = executions[0].collection.items.idx(1);

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
});

test('--exclude single', () => {
    let executions = n.run(_.concat(initparams, '--exclude', 'one'));
    expect(executions[0].folder).to.be.undefined;
    expect(executions).to.have.length(1);
    expect(executions[0].collection.items.count()).to.equal(9);

    let expectedFolders = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    expect(executions[0].collection.items.idx(0).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(1).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(2).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(3).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(4).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(5).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(6).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(7).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(8).name).to.be.oneOf(expectedFolders);

    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(14);
});

test('--exclude multiple single level', () => {
    let executions = n.run(_.concat(initparams, '--exclude', 'one', '--exclude', 'three'));
    expect(executions[0].folder).to.be.undefined;
    expect(executions).to.have.length(1);

    let expectedFolders = ['two', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    expect(executions[0].collection.items.count()).to.equal(expectedFolders.length);
    expect(executions[0].collection.items.idx(0).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(1).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(2).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(3).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(4).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(5).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(6).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(7).name).to.be.oneOf(expectedFolders);

    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(10);
});

test('--exclude multiple level two', () => {
    let executions = n.run(_.concat(initparams, '--exclude', 'one_one', '--exclude', 'two_one'));
    expect(executions[0].folder).to.be.undefined;
    expect(executions).to.have.length(1);

    expect(executions[0].collection.items.count()).to.equal(10);

    let fldone = executions[0].collection.items.find((i) => { return i.name === 'one' }),
        fldtwo = executions[0].collection.items.find((i) => { return i.name === 'two' });

    expect(fldone.name).to.equal('one');
    expect(coll.allFoldersUnder(fldone)).to.have.length(1);
    expect(fldone.items.idx(0).name).to.equal('one_two');
    expect(coll.allRequestsUnder(fldone)).to.have.length(2);

    expect(fldtwo.name).to.equal('two');
    expect(coll.allFoldersUnder(fldtwo)).to.have.length(0);
    expect(coll.allRequestsUnder(fldtwo)).to.have.length(1);

    let expectedFolders = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    expect(executions[0].collection.items.idx(0).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(1).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(2).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(3).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(4).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(5).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(6).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(7).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(8).name).to.be.oneOf(expectedFolders);
    expect(executions[0].collection.items.idx(9).name).to.be.oneOf(expectedFolders);

    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(14);
});

test('--exclude single --include multiple', () => {
    let executions = n.run(_.concat(initparams, '--exclude', 'one', '--folder', 'one', '--folder', 'two'));
    expect(executions[0].folder).to.be.undefined;
    expect(executions).to.have.length(1);
    expect(executions[0].collection.items.count()).to.equal(1);
    expect(executions[0].collection.items.idx(0).name).to.equal('two');
});

test('--exclude third level --include multiple', () => {
    let executions = n.run(_.concat(initparams, '--exclude', 'one_one_one', '--folder', 'one', '--folder', 'two'));
    expect(executions[0].folder).to.be.undefined;
    expect(executions).to.have.length(1);
    expect(executions[0].collection.items.count()).to.equal(2);

    expect(executions[0].collection.items.idx(0).name).to.equal('one');
    expect(executions[0].collection.items.idx(1).name).to.equal('two');

    let oneSubFolderNames = _.map(coll.allFoldersUnder(executions[0].collection.items.idx(0)), (fld) => { return fld.name; });
    expect(oneSubFolderNames).to.not.include('one_one_one');
    expect(oneSubFolderNames).to.not.include('one_one_one_one');
    expect(oneSubFolderNames).to.include('one_one');
    expect(oneSubFolderNames).to.include('one_two');

    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(6);
});