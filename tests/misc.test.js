const _ = require('lodash');
const fs = require('fs');
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

test('--group and --folder', () => {
    let executions = n.run(_.concat(initparams, '--group', '3', '--folder', 'common_one', '--folder', 'five', '--folder', 'six', '--folder', 'seven'));
    expect(executions).to.have.length(2);

    expect(executions[0].collection.items.count()).to.eql(3);
    expect(executions[1].collection.items.count()).to.eql(3);

    expect(coll.allFoldersUnder(executions[0].collection)).to.have.length(9);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(3);

    expect(coll.allFoldersUnder(executions[1].collection)).to.have.length(3);
    expect(coll.allRequestsUnder(executions[1].collection)).to.have.length(3);

    let fldNames = _.map(coll.allFoldersUnder(executions[0].collection), fld => { return fld.name });
    let expFlds = ['one', 'one_one', 'one_one_one', 'common_one', 'two', 'two_one', 'common_one', 'three', 'common_one'];
    expect(_.difference(expFlds, fldNames)).to.have.length(0);
});

test('--parallel and --folder', () => {
    let executions = n.run(_.concat(initparams, '--group', '3', '--folder', 'common_one', '--folder', 'five', '--folder', 'six', '--folder', 'seven'));
    expect(executions).to.have.length(2);

    expect(executions[0].collection.items.count()).to.eql(3);
    expect(executions[1].collection.items.count()).to.eql(3);

    expect(coll.allFoldersUnder(executions[0].collection)).to.have.length(9);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(3);

    expect(coll.allFoldersUnder(executions[1].collection)).to.have.length(3);
    expect(coll.allRequestsUnder(executions[1].collection)).to.have.length(3);

    let fldNames = _.map(coll.allFoldersUnder(executions[0].collection), fld => { return fld.name });
    let expFlds = ['one', 'one_one', 'one_one_one', 'common_one', 'two', 'two_one', 'common_one', 'three', 'common_one'];
    expect(_.difference(expFlds, fldNames)).to.have.length(0);
});