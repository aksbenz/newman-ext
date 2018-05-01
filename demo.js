const _ = require('lodash');
var rewire = require("rewire");
var n = rewire(require.resolve('./newman-ext.js'));

let path = 'C:/tmp/euat.json';
let initparams = _.concat(process.argv, 'run', './tests/sample.postman_collection.json', '--demo');
// let initparams = _.concat(process.argv, 'run', 'C:/Users/aadm221/Documents/workspace/esb-automation-tests_git/TestCollections/Test Services.postman_collection.json', '--demo');
var program = rewire(require.resolve('commander'));
var cmd = rewire(require.resolve('./lib/cmd.js'));
cmd.__set__('program', program);
n.__set__('cmd', cmd);

// let options = n.run(_.concat(initparams, '-e', "C:/Users/aadm221/Documents/workspace/esb-automation-tests_git/TestEnvironments/EUAT.json", '-g', "C:/Users/aadm221/Documents/workspace/esb-automation-tests_git/TestEnvironments/globals.json", '-r', "cli,html", '--reporter-html-template', "C:/Users/aadm221/Documents/workspace/esb-automation-tests_git/TestResultTemplate/template-new-merged.hbs", '-k', '--ignore-redirects', '--folder', "Login to VSL - YearlyEvents", '--folder', "S01 - VHRV", '--folder', "Logout of VSL - YearlyEvents"));
let executions = n.run(_.concat(initparams, '--exclude', 'one'));
console.log(executions);
// console.log(options);