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

test('--threads --folder multiple single level', () => {
    let executions = n.run(_.concat(initparams, '--folder', 'one', '--folder', 'two', '--threads', '1'));
    expect(executions).to.have.length(2);

    expect(executions[0].folder).to.equal('one');
    expect(executions[0].collection.items.count()).to.equal(10);

    expect(executions[1].folder).to.equal('two');
    expect(executions[1].collection.items.count()).to.equal(10);

    let fldone = executions[0].collection.items.idx(0),
        fldtwo = executions[1].collection.items.idx(1);
    expect(fldone.name).to.equal('one');
    expect(fldtwo.name).to.equal('two');
    expect(fldone.items.count()).to.equal(3);
    expect(coll.allRequestsUnder(fldone)).to.have.length(7);
    expect(coll.allRequestsUnder(fldtwo)).to.have.length(3);
});

test('--threads --folder multiple level two', () => {
    let executions = n.run(_.concat(initparams, '--folder', 'one_one', '--folder', 'two_one', '--threads', '1'));
    expect(executions).to.have.length(2);

    expect(executions[0].folder).to.equal('one_one');
    expect(executions[0].collection.items.count()).to.equal(10);

    expect(executions[1].folder).to.equal('two_one');
});