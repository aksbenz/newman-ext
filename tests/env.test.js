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

test('-e', () => {
    let executions = n.run(_.concat(initparams, '-e', path));
    expect(executions[0].environment).toEqual(path);
});
test('--environment', () => {
    let executions = n.run(_.concat(initparams, '--environment', path));
    expect(executions[0].environment).toEqual(path);
});
test('-g', () => {
    executions = n.run(_.concat(initparams, '-g', path));
    expect(executions[0].globals).toEqual(path);
});
test('--globals', () => {
    let executions = n.run(_.concat(initparams, '--globals', path));
    expect(executions[0].globals).toEqual(path);
});
test('-r single', () => {
    let executions = n.run(_.concat(initparams, '-r', 'cli'));
    expect(executions[0].reporters).toEqual('cli');
});
test('-r Multiple', () => {
    let executions = n.run(_.concat(initparams, '-r', 'cli,html'));
    expect(executions[0].reporters.length).toBe(2);
    expect(executions[0].reporters).toEqual(['cli', 'html']);
});
test('--reporters single', () => {
    let executions = n.run(_.concat(initparams, '--reporters', 'cli'));
    expect(executions[0].reporters).toEqual('cli');
});
test('--reporters Multiple', () => {
    let executions = n.run(_.concat(initparams, '--reporters', 'cli,html'));
    expect(executions[0].reporters.length).toBe(2);
    expect(executions[0].reporters).toEqual(['cli', 'html']);
});
test('--iteration-data', () => {
    let executions = n.run(_.concat(initparams, '--iteration-data', path));
    expect(executions[0].iterationData).toEqual(path);
});
test('-d (iteration-data)', () => {
    let executions = n.run(_.concat(initparams, '-d', path));
    expect(executions[0].iterationData).toEqual(path);
});
test('--iteration-count', () => {
    let executions = n.run(_.concat(initparams, '--iteration-count', '99'));
    expect(executions[0].iterationCount).toEqual("99");
});
test('-n (iteration-count)', () => {
    let executions = n.run(_.concat(initparams, '-n', '99'));
    expect(executions[0].iterationCount).toEqual("99");
});
test('--timeout', () => {
    let executions = n.run(_.concat(initparams, '--timeout', '5000'));
    expect(executions[0].timeout).toEqual("5000");
});
test('--timeout-request', () => {
    let executions = n.run(_.concat(initparams, '--timeout-request', '5000'));
    expect(executions[0].timeoutRequest).toEqual("5000");
});
test('--timeout-script', () => {
    let executions = n.run(_.concat(initparams, '--timeout-script', '5000'));
    expect(executions[0].timeoutScript).toEqual("5000");
});
test('--insecure', () => {
    let executions = n.run(_.concat(initparams, '--insecure'));
    expect(executions[0].insecure).toEqual(true);
});
test('-k (--insecure)', () => {
    let executions = n.run(_.concat(initparams, '-k'));
    expect(executions[0].insecure).toEqual(true);
});
test('--ignore-redirects', () => {
    let executions = n.run(_.concat(initparams, '--ignore-redirects'));
    expect(executions[0].ignoreRedirects).toEqual(true);
});
test('--delay-request', () => {
    let executions = n.run(_.concat(initparams, '--delay-request', '5000'));
    expect(executions[0].delayRequest).toEqual("5000");
});
test('--bail', () => {
    let executions = n.run(_.concat(initparams, '--bail'));
    expect(executions[0].bail).toEqual(true);
});
test('--suppress-exit-code', () => {
    let executions = n.run(_.concat(initparams, '--suppress-exit-code'));
    expect(executions[0].suppressExitCode).toEqual(true);
});
test('-x (--suppress-exit-code)', () => {
    let executions = n.run(_.concat(initparams, '-x'));
    expect(executions[0].suppressExitCode).toEqual(true);
});
test('--color', () => {
    let executions = n.run(_.concat(initparams, '--color'));
    expect(executions[0].color).toEqual(true);
});
test('--ssl-client-cert', () => {
    let executions = n.run(_.concat(initparams, '--ssl-client-cert', path));
    expect(executions[0].sslClientCert).toEqual(path);
});
test('--ssl-client-key', () => {
    let executions = n.run(_.concat(initparams, '--ssl-client-key', path));
    expect(executions[0].sslClientKey).toEqual(path);
});
test('--ssl-client-passphrase', () => {
    let executions = n.run(_.concat(initparams, '--ssl-client-passphrase', 'passphrase'));
    expect(executions[0].sslClientPassphrase).toEqual('passphrase');
});
test('All Command Lines', () => {
    let params = _.concat(initparams, '--ssl-client-passphrase', 'passphrase', '--ssl-client-key', path, '--ssl-client-cert', path, '--color', '--suppress-exit-code', '--bail', '--delay-request', '5000', '--ignore-redirects', '--insecure', '--timeout', '5000', '--timeout-request', '5000', '--timeout-script', '5000', '--environment', path, '--globals', path, '--reporters', 'cli,html', '-d', path, '-n', '99');
    // console.log(params);
    let executions = n.run(params);
    expect(executions[0].sslClientPassphrase).toEqual('passphrase');
    expect(executions[0].sslClientKey).toEqual(path);
    expect(executions[0].sslClientCert).toEqual(path);
    expect(executions[0].color).toEqual(true);
    expect(executions[0].suppressExitCode).toEqual(true);
    expect(executions[0].bail).toEqual(true);
    expect(executions[0].delayRequest).toEqual("5000");
    expect(executions[0].ignoreRedirects).toEqual(true);
    expect(executions[0].insecure).toEqual(true);
    expect(executions[0].timeout).toEqual("5000");
    expect(executions[0].timeoutRequest).toEqual("5000");
    expect(executions[0].timeoutScript).toEqual("5000");
    expect(executions[0].iterationCount).toEqual("99");
    expect(executions[0].iterationData).toEqual(path);
    expect(executions[0].reporters.length).toBe(2);
    expect(executions[0].reporters).toEqual(['cli', 'html']);
    expect(executions[0].globals).toEqual(path);
    expect(executions[0].environment).toEqual(path);
});

test('All Command Lines 2', () => {
    let params = _.concat(initparams, '--ssl-client-passphrase', 'passphrase', '--ssl-client-key', path, '--ssl-client-cert', path, '--color', '-x', '--bail', '--delay-request', '5000', '--ignore-redirects', '-k', '--timeout', '5000', '--timeout-request', '5000', '--timeout-script', '5000', '-e', path, '-g', path, '-r', 'cli,html', '--iteration-data', path, '--iteration-count', '99');
    // console.log(params);
    let executions = n.run(params);
    expect(executions[0].sslClientPassphrase).toEqual('passphrase');
    expect(executions[0].sslClientKey).toEqual(path);
    expect(executions[0].sslClientCert).toEqual(path);
    expect(executions[0].color).toEqual(true);
    expect(executions[0].suppressExitCode).toEqual(true);
    expect(executions[0].bail).toEqual(true);
    expect(executions[0].delayRequest).toEqual("5000");
    expect(executions[0].ignoreRedirects).toEqual(true);
    expect(executions[0].insecure).toEqual(true);
    expect(executions[0].timeout).toEqual("5000");
    expect(executions[0].timeoutRequest).toEqual("5000");
    expect(executions[0].timeoutScript).toEqual("5000");
    expect(executions[0].iterationCount).toEqual("99");
    expect(executions[0].iterationData).toEqual(path);
    expect(executions[0].reporters.length).toBe(2);
    expect(executions[0].reporters).toEqual(['cli', 'html']);
    expect(executions[0].globals).toEqual(path);
    expect(executions[0].environment).toEqual(path);
});