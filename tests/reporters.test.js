const _ = require('lodash');
var rewire = require("rewire");
var n = rewire(require.resolve('../newman-ext.js'));

let path = 'C:/tmp/tempfile.json';
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

test('--reporter-html-template', () => {
    let executions = n.run(_.concat(initparams, '--reporter-html-template', 'template.hbs'));
    expect(executions[0].reporter).toEqual({ 'html': { 'template': 'template.hbs' } });
});

test('--reporter-html-template --reporter-html-export', () => {
    let executions = n.run(_.concat(initparams, '--reporter-html-template', 'template.hbs', '--reporter-html-export', 'C://report.html'));
    expect(executions[0].reporter).toEqual({ 'html': { 'template': 'template.hbs', 'export': 'C://report.html' } });
});

test('--reporter-html-template --reporter-cli-export', () => {
    let executions = n.run(_.concat(initparams, '--reporter-html-template', 'template.hbs', '--reporter-cli-export', 'C://report.html'));
    expect(executions[0].reporter).toEqual({ 'html': { 'template': 'template.hbs' }, 'cli': { 'export': 'C://report.html' } });
});

test('--reporter-html-template --reporter-html-export --reporter-junit-export', () => {
    let executions = n.run(_.concat(initparams, '--reporter-html-template', 'template.hbs', '--reporter-html-export', 'C://report.html', '--reporter-junit-export', 'C://junit.xml'));
    expect(executions[0].reporter).toEqual({ 'html': { 'template': 'template.hbs', 'export': 'C://report.html' }, 'junit': { 'export': 'C://junit.xml' } });
});

test('default value to true', () => {
    let executions = n.run(_.concat(initparams, '--reporter-html-no-summary', '--reporter-html-export', 'C://report.html', '--reporter-cli-silent'));
    expect(executions[0].reporter).toEqual({ 'html': { 'no-summary': true, 'export': 'C://report.html' }, 'cli': { 'silent': true } });
});