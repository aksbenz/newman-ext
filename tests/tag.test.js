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

test('--tag-includetest single tag', () => {
    let executions = n.run(_.concat(initparams, '--tag-includetest', 'l1'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(10);
    expect(executions[0].collection.items.count()).to.equal(10);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        expect(description).to.include('@l1');
    });
});

test('--tag-includetest multiple tags', () => {
    let executions = n.run(_.concat(initparams, '--tag-includetest', 'l1', '--tag-includetest', 'sanity'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(12);
    expect(executions[0].collection.items.count()).to.equal(10);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        expect(description).to.match(/@l1|@sanity/, 'Fail for: ' + _.get(item, 'name'));
    });
});