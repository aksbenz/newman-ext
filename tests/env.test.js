const _ = require('lodash');
var rewire = require("rewire");
var n = rewire(require.resolve('../newman-ext.js'));

let path = 'C:/tmp/euat.json';
let initparams = _.concat(process.argv, 'run', './tests/sample.postman_collection.json', '--demo');

beforeEach(() => {
    var program = rewire(require.resolve('commander'));
    var cmd = rewire(require.resolve('../lib/cmd.js'));
    cmd.__set__('program', program);
    n.__set__('cmd', cmd);
});

test('-e', () => {
    let options = n.run(_.concat(initparams, '-e', path));
    expect(options.environment).toEqual(path);
});
test('--environment', () => {
    let options = n.run(_.concat(initparams, '--environment', path));
    expect(options.environment).toEqual(path);
});
test('-g', () => {
    options = n.run(_.concat(initparams, '-g', path));
    expect(options.globals).toEqual(path);
});
test('--globals', () => {
    let options = n.run(_.concat(initparams, '--globals', path));
    expect(options.globals).toEqual(path);
});
test('-r single', () => {
    let options = n.run(_.concat(initparams, '-r', 'cli'));
    expect(options.reporters).toEqual('cli');
});
test('-r Multiple', () => {
    let options = n.run(_.concat(initparams, '-r', 'cli,html'));
    expect(options.reporters.length).toBe(2);
    expect(options.reporters).toEqual(['cli', 'html']);
});
test('--reporters single', () => {
    let options = n.run(_.concat(initparams, '--reporters', 'cli'));
    expect(options.reporters).toEqual('cli');
});
test('--reporters Multiple', () => {
    let options = n.run(_.concat(initparams, '--reporters', 'cli,html'));
    expect(options.reporters.length).toBe(2);
    expect(options.reporters).toEqual(['cli', 'html']);
});
test('--iteration-data', () => {
    let options = n.run(_.concat(initparams, '--iteration-data', path));
    expect(options.iterationData).toEqual(path);
});
test('-d (iteration-data)', () => {
    let options = n.run(_.concat(initparams, '-d', path));
    expect(options.iterationData).toEqual(path);
});
test('--iteration-count', () => {
    let options = n.run(_.concat(initparams, '--iteration-count', '99'));
    expect(options.iterationCount).toEqual("99");
});
test('-n (iteration-count)', () => {
    let options = n.run(_.concat(initparams, '-n', '99'));
    expect(options.iterationCount).toEqual("99");
});
test('--timeout-request', () => {
    let options = n.run(_.concat(initparams, '--timeout-request', '5000'));
    expect(options.timeoutRequest).toEqual("5000");
});
test('--insecure', () => {
    let options = n.run(_.concat(initparams, '--insecure'));
    expect(options.insecure).toEqual(true);
});
test('-k (--insecure)', () => {
    let options = n.run(_.concat(initparams, '-k'));
    expect(options.insecure).toEqual(true);
});
test('--ignore-redirects', () => {
    let options = n.run(_.concat(initparams, '--ignore-redirects'));
    expect(options.ignoreRedirects).toEqual(true);
});
test('--delay-request', () => {
    let options = n.run(_.concat(initparams, '--delay-request', '5000'));
    expect(options.delayRequest).toEqual("5000");
});
test('--bail', () => {
    let options = n.run(_.concat(initparams, '--bail'));
    expect(options.bail).toEqual(true);
});
test('--suppress-exit-code', () => {
    let options = n.run(_.concat(initparams, '--suppress-exit-code'));
    expect(options.suppressExitCode).toEqual(true);
});
test('-x (--suppress-exit-code)', () => {
    let options = n.run(_.concat(initparams, '-x'));
    expect(options.suppressExitCode).toEqual(true);
});
test('--color', () => {
    let options = n.run(_.concat(initparams, '--color'));
    expect(options.color).toEqual(true);
});
test('--ssl-client-cert', () => {
    let options = n.run(_.concat(initparams, '--ssl-client-cert', path));
    expect(options.sslClientCert).toEqual(path);
});
test('--ssl-client-key', () => {
    let options = n.run(_.concat(initparams, '--ssl-client-key', path));
    expect(options.sslClientKey).toEqual(path);
});
test('--ssl-client-passphrase', () => {
    let options = n.run(_.concat(initparams, '--ssl-client-passphrase', 'passphrase'));
    expect(options.sslClientPassphrase).toEqual('passphrase');
});
test('All Command Lines', () => {
    let params = _.concat(initparams, '--ssl-client-passphrase', 'passphrase', '--ssl-client-key', path, '--ssl-client-cert', path, '--color', '--suppress-exit-code', '--bail', '--delay-request', '5000', '--ignore-redirects', '--insecure', '--timeout-request', '5000', '--environment', path, '--globals', path, '--reporters', 'cli,html', '-d', path, '-n', '99');
    // console.log(params);
    let options = n.run(params);
    expect(options.sslClientPassphrase).toEqual('passphrase');
    expect(options.sslClientKey).toEqual(path);
    expect(options.sslClientCert).toEqual(path);
    expect(options.color).toEqual(true);
    expect(options.suppressExitCode).toEqual(true);
    expect(options.bail).toEqual(true);
    expect(options.delayRequest).toEqual("5000");
    expect(options.ignoreRedirects).toEqual(true);
    expect(options.insecure).toEqual(true);
    expect(options.timeoutRequest).toEqual("5000");
    expect(options.iterationCount).toEqual("99");
    expect(options.iterationData).toEqual(path);
    expect(options.reporters.length).toBe(2);
    expect(options.reporters).toEqual(['cli', 'html']);
    expect(options.globals).toEqual(path);
    expect(options.environment).toEqual(path);
});

test('All Command Lines 2', () => {
    let params = _.concat(initparams, '--ssl-client-passphrase', 'passphrase', '--ssl-client-key', path, '--ssl-client-cert', path, '--color', '-x', '--bail', '--delay-request', '5000', '--ignore-redirects', '-k', '--timeout-request', '5000', '-e', path, '-g', path, '-r', 'cli,html', '--iteration-data', path, '--iteration-count', '99');
    // console.log(params);
    let options = n.run(params);
    expect(options.sslClientPassphrase).toEqual('passphrase');
    expect(options.sslClientKey).toEqual(path);
    expect(options.sslClientCert).toEqual(path);
    expect(options.color).toEqual(true);
    expect(options.suppressExitCode).toEqual(true);
    expect(options.bail).toEqual(true);
    expect(options.delayRequest).toEqual("5000");
    expect(options.ignoreRedirects).toEqual(true);
    expect(options.insecure).toEqual(true);
    expect(options.timeoutRequest).toEqual("5000");
    expect(options.iterationCount).toEqual("99");
    expect(options.iterationData).toEqual(path);
    expect(options.reporters.length).toBe(2);
    expect(options.reporters).toEqual(['cli', 'html']);
    expect(options.globals).toEqual(path);
    expect(options.environment).toEqual(path);
});