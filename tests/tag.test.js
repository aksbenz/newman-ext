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

test('-t include single tag, include empty description by default', () => {
    let executions = n.run(_.concat(initparams, '-t', '@l1'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(13);
    expect(executions[0].collection.items.count()).to.equal(10);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        if (!_.isNil(description))
            expect(description).to.include('@l1');
    });
});

test('-t single tag NOT, include empty description by default', () => {
    let executions = n.run(_.concat(initparams, '-t', 'not @l2'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(15);
    expect(executions[0].collection.items.count()).to.equal(10);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        // console.log(item);
        let description = _.get(item, 'request.description.content')
        if (!_.isNil(description))
            expect(description).to.not.include('@l2');
    });
});

test('-t include multiple tags AND, include empty description by default', () => {
    let executions = n.run(_.concat(initparams, '-t', '@l1 and @sanity'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(5);
    expect(executions[0].collection.items.count()).to.equal(3);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        if (!_.isNil(description)) {
            expect(description).to.include('@l1');
            expect(description).to.include('@sanity');
        }
    });
});

test('-t include multiple tags OR, include empty description by default', () => {
    let executions = n.run(_.concat(initparams, '-t', '@l1 or @sanity'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(15);
    expect(executions[0].collection.items.count()).to.equal(10);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        if (!_.isNil(description))
            expect(description).to.match(/@l1|@sanity/, 'Fail for: ' + _.get(item, 'name'));
    });
});

test('-t include multiple tags AND NOT, include empty description by default', () => {
    let executions = n.run(_.concat(initparams, '-t', '@l1 and not @sanity'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(11);
    expect(executions[0].collection.items.count()).to.equal(9);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        if (!_.isNil(description)) {
            expect(description).to.include('@l1');
            expect(description).to.not.include('@sanity');
        }
    });
});

test('-t include multiple tags brackets, include empty description by default', () => {
    let executions = n.run(_.concat(initparams, '-t', '(@l1 or @l2) and (not @sanity)'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(17);
    expect(executions[0].collection.items.count()).to.equal(9);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        if (!_.isNil(description)) {
            expect(description).to.match(/@l1|@l2/, 'Fail for: ' + _.get(item, 'name'));
            expect(description).to.not.include('@sanity');
        }
    });
});

//---------------------------------------------------

test('-t include single tag, exclude empty description', () => {
    let executions = n.run(_.concat(initparams, '-t', '@l1', '-m'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(10);
    expect(executions[0].collection.items.count()).to.equal(10);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        expect(description).to.include('@l1');
    });
});

test('-t single tag NOT, exclude empty description', () => {
    let executions = n.run(_.concat(initparams, '-t', 'not @l2', '--remove-emptyDesc'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(12);
    expect(executions[0].collection.items.count()).to.equal(10);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        expect(description).to.not.include('@l2');
    });
});

test('-t include multiple tags AND, exclude empty description', () => {
    let executions = n.run(_.concat(initparams, '-t', '@l1 and @sanity', '-m'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(2);
    expect(executions[0].collection.items.count()).to.equal(2);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        expect(description).to.include('@l1');
        expect(description).to.include('@sanity');
    });
});

test('-t include multiple tags OR, exclude empty description', () => {
    let executions = n.run(_.concat(initparams, '-t', '@l1 or @sanity', '-m'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(12);
    expect(executions[0].collection.items.count()).to.equal(10);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        expect(description).to.match(/@l1|@sanity/, 'Fail for: ' + _.get(item, 'name'));
    });
});

test('-t include multiple tags AND NOT, exclude empty description', () => {
    let executions = n.run(_.concat(initparams, '-t', '@l1 and not @sanity', '-m'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(8);
    expect(executions[0].collection.items.count()).to.equal(8);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        expect(description).to.include('@l1');
        expect(description).to.not.include('@sanity');
    });
});

test('-t include multiple tags brackets, exclude empty description', () => {
    let executions = n.run(_.concat(initparams, '-t', '(@l1 or @l2) and (not @sanity)', '-m'));
    expect(executions).to.have.length(1);
    expect(coll.allRequestsUnder(executions[0].collection)).to.have.length(14);
    expect(executions[0].collection.items.count()).to.equal(9);
    _.each(coll.allRequestsUnder(executions[0].collection), (item) => {
        let description = _.get(item, 'request.description.content')
        expect(description).to.match(/@l1|@l2/, 'Fail for: ' + _.get(item, 'name'));
        expect(description).to.not.include('@sanity');
    });
});