const _ = require('lodash');
const fs = require('fs');
var expect = require('chai').expect;
var rewire = require("rewire");
var coll = require('../lib/collection');
var n = rewire(require.resolve('../newman-ext.js'));

let path = 'C:/tmp/euat.json';
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

test('--group', () => {
    let options = n.run(_.concat(initparams, '--group', '3'));
    expect(options.collections).to.have.length(4);

    expect(options.collections[0].items.count()).to.eql(3);
    expect(options.collections[1].items.count()).to.eql(3);
    expect(options.collections[2].items.count()).to.eql(3);
    expect(options.collections[3].items.count()).to.eql(1);

    expect(coll.allFoldersUnder(options.collections[0])).to.have.length(14);
    expect(coll.allRequestsUnder(options.collections[0])).to.have.length(14);

    expect(coll.allFoldersUnder(options.collections[1])).to.have.length(3);

    let fldNames = _.map(coll.allFoldersUnder(options.collections[0]), fld => { return fld.name });
    let expFlds = ['one', 'one_one', 'one_one_one', 'one_one_one_one', 'one_one_one_two', 'common_one', 'one_two', 'two', 'two_one', 'common_one', 'three', 'three_one', 'three_two', 'common_one'];
    expect(_.difference(expFlds, fldNames)).to.have.length(0);
});

test('--group count equal to number of folders', () => {
    let options = n.run(_.concat(initparams, '--group', '10'));
    expect(options.collections).to.have.length(1);
    expect(options.collections[0].items.count()).to.eql(10);
    expect(coll.allFoldersUnder(options.collections[0])).to.have.length(21);
    expect(coll.allRequestsUnder(options.collections[0])).to.have.length(21);

});

test('--group invalid non-numeric', () => {
    let err;
    try {
        let options = n.run(_.concat(initparams, '--group', 'a'));
    } catch (e) {
        err = e;
    } finally { expect(err).is.not.undefined; }
});


test('--parallel', () => {
    let options = n.run(_.concat(initparams, '--parallel', '3'));
    fs.writeFileSync('results.json', JSON.stringify(options, '', 2));
    expect(options.collections).to.have.length(3);

    expect(options.collections[0].items.count()).to.eql(4);
    expect(options.collections[1].items.count()).to.eql(4);
    expect(options.collections[2].items.count()).to.eql(2);

    expect(coll.allFoldersUnder(options.collections[0])).to.have.length(15);
    expect(coll.allRequestsUnder(options.collections[0])).to.have.length(15);

    expect(coll.allFoldersUnder(options.collections[1])).to.have.length(4);
});

test('--parallel count equal to number of folders', () => {
    let options = n.run(_.concat(initparams, '--parallel', '10'));
    expect(options.collections).to.have.length(10);
    expect(options.collections[0].items.count()).to.eql(1);
    expect(coll.allFoldersUnder(options.collections[0])).to.have.length(7);
    expect(coll.allRequestsUnder(options.collections[0])).to.have.length(7);

});

test('--parallel invalid non-numeric', () => {
    let err;
    try {
        let options = n.run(_.concat(initparams, '--parallel', 'a'));
    } catch (e) {
        err = e;
    } finally { expect(err).is.not.undefined; }
});

test('-p (--parallel)', () => {
    let options = n.run(_.concat(initparams, '-p', '3'));
    fs.writeFileSync('results.json', JSON.stringify(options, '', 2));
    expect(options.collections).to.have.length(3);

    expect(options.collections[0].items.count()).to.eql(4);
    expect(options.collections[1].items.count()).to.eql(4);
    expect(options.collections[2].items.count()).to.eql(2);

    expect(coll.allFoldersUnder(options.collections[0])).to.have.length(15);
    expect(coll.allRequestsUnder(options.collections[0])).to.have.length(15);

    expect(coll.allFoldersUnder(options.collections[1])).to.have.length(4);
});

test('-p (--parallel) invalid non-numeric', () => {
    let err;
    try {
        let options = n.run(_.concat(initparams, '-p', 'a'));
    } catch (e) {
        err = e;
    } finally { expect(err).is.not.undefined; }
});