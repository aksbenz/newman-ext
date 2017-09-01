const _ = require('lodash');
var rewire = require("rewire");
var n = rewire(require.resolve('./newman-ext.js'));

let path = 'C:/tmp/euat.json';
let initparams = _.concat(process.argv, 'run', './tests/sample.postman_collection.json', '--demo');
var program = rewire(require.resolve('commander'));
var cmd = rewire(require.resolve('./lib/cmd.js'));
cmd.__set__('program', program);
n.__set__('cmd', cmd);

let options = n.run(_.concat(initparams, '--group', 'a'));
console.log(options);