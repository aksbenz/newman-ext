const _ = require('lodash');
const fs = require('fs');
var expect = require('chai').expect;
var rewire = require("rewire");
var coll = require('../lib/collection');
var n = rewire(require.resolve('../newman-ext.js'));

let path = 'C:/tmp/euat.json';
let initparams = _.concat(process.argv, 'run', './tests/sample.postman_collection.json', '--demo');

beforeEach(() => {
    var program = rewire(require.resolve('commander'));
    var cmd = rewire(require.resolve('../lib/cmd.js'));
    cmd.__set__('program', program);
    n.__set__('cmd', cmd);
});

test('--parallel', () => {
    let options = n.run(_.concat(initparams, '--parallel', '3'));
    expect(options.collections).to.have.length(4);

    expect(options.collections[0].items.count()).to.eql(3);
    expect(options.collections[1].items.count()).to.eql(3);
    expect(options.collections[2].items.count()).to.eql(3);
    expect(options.collections[3].items.count()).to.eql(1);

    expect(coll.allFoldersUnder(options.collections[0])).to.have.length(14);
    expect(coll.allRequestsUnder(options.collections[0])).to.have.length(14);

    expect(coll.allFoldersUnder(options.collections[1])).to.have.length(3);
});

test('--parallel count equal to number of folders', () => {
    let options = n.run(_.concat(initparams, '--parallel', '10'));
    fs.writeFileSync('results.json', JSON.stringify(options, '', 2));
    expect(options.collections).to.have.length(1);
    expect(options.collections[0].items.count()).to.eql(10);
    expect(coll.allFoldersUnder(options.collections[0])).to.have.length(21);
    expect(coll.allRequestsUnder(options.collections[0])).to.have.length(21);

});