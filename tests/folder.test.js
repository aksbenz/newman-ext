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
    let options = n.run(_.concat(initparams, '--folder', 'one'));
    expect(options.folder).to.equal('one');
});
test('--folder multiple single level', () => {
    let options = n.run(_.concat(initparams, '--folder', 'one', '--folder', 'two'));
    expect(options.folder).to.be.undefined;
    expect(options.collections).to.have.length(1);
    expect(options.collections[0].items.count()).to.equal(2);

    let fldone = options.collections[0].items.idx(0),
        fldtwo = options.collections[0].items.idx(1);
    expect(fldone.name).to.equal('one');
    expect(fldtwo.name).to.equal('two');
    expect(fldone.items.count()).to.equal(3);
    expect(coll.allRequestsUnder(fldone)).to.have.length(7);
    expect(coll.allRequestsUnder(fldtwo)).to.have.length(3);
});

test('--folder multiple level two', () => {
    let options = n.run(_.concat(initparams, '--folder', 'one_one', '--folder', 'two_one'));
    expect(options.folder).to.be.undefined;
    expect(options.collections).to.have.length(1);
    expect(options.collections[0].items.count()).to.equal(2);

    let fldone = options.collections[0].items.idx(0),
        fldtwo = options.collections[0].items.idx(1);

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