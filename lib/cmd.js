var _ = require('lodash');
var program = require('commander');

module.exports = cmd;

function cmd(args) {
    program
        .version('0.1.0')
        .usage('run <collection> [options]')
        .option('run <collection>', 'Collection to run')
        .option('-e, --environment [source]', 'Specify an environment file path or URL')
        .option('-g, --globals [source]', 'Specify file path or URL for global variables')
        .option('-d, --iteration-data [source]', 'Specify a data source file (CSV) to be used for iteration as a path to a file or as a URL')
        .option('-n, --iteration-count [n]', 'Specifies the number of times the collection has to be run when used in conjunction with iteration data file')
        .option('--folder [name]', 'Run requests within a particular folder in a collection', collect, [])
        .option('--exclude [name]', 'Folder to exclude from collection', collect, [])
        // .option('--export-environment  [path]', 'The path to the file where Newman will output the final environment variables file before completing a run.')
        // .option('--export-globals [path]', 'The path to the file where Newman will output the final global variables file before completing a run.')
        // .option('--export-collection [path]', 'The path to the file where Newman will output the final collection file before completing a run.')
        .option('--timeout-request [ms]', 'Specify the time (in milliseconds) to wait for requests to return a response.')
        .option('-k, --insecure', 'Disables SSL verification checks and allows self-signed SSL certificates.')
        .option('--ignore-redirects', 'Prevents newman from automatically following 3XX redirect responses.')
        .option('--delay-request [ms]', 'Specify the extent of delay between requests (milliseconds).')
        .option('--bail', 'Specify whether or not to stop a collection run on encountering the first error.')
        .option('-x, --suppress-exit-code', 'Specify whether or not to override the default exit code for the current run.')
        .option('--color', 'Use this option to force colored CLI output (for use in CLI for CI / non TTY environments).')
        // .option('--no-color','Newman attempts to automatically turn off color output to terminals when it detects the lack of color support')
        // .option('--disable-unicode', 'Specify whether or not to force the unicode disable option')
        // .option('--global-var [key=value]', 'Allows the specification of global variables via the command line, in a key=value format. like so: --global-var "foo=bar" --global-var "alpha=beta"', map, {})
        .option('-r, --reporters [reporter-name]', 'Specify one reporter name as string or provide more than one reporter name as a comma separated list of reporter names. Available reporters are: cli, json, html and junit', list, ['cli'])
        .option('--reporter-html-export [path]', 'Specify a path where the output HTML file will be written to disk')
        .option('--reporter-html-template [path]', 'Specify a path to the custom template which will be used to render the HTML report')
        .option('--ssl-client-cert [path]', 'The path to the public client certificate file.')
        .option('--ssl-client-key [path]', 'The path to the private client key (optional).')
        .option('--ssl-client-passphrase [value]', 'The secret passphrase used to protect the private client key (optional).')
        .option('--demo', 'Demo mode to run tests. Will not trigger newman execution')
        .option('--group [folders]', 'Overrides --parallel. Create collections with each having these many folders and execute all groups in parallel', /^\d+$/)
        .option('-p, --parallel [executions]', 'Create [executions] number of collections, each having equal(or less) number of folders. Execute all in parallel', /^\d+$/)
        .parse(args);

    if (!program.run) {
        throw Error("run <collection> required \nCheck --help")
    }
    if (program.parallel && program.parallel === true) {
        throw Error("Invalid -p, --parallel : Expected Numeric \nCheck --help")
    }
    if (program.group && program.group === true) {
        throw Error("Invalid --group : Expected Numeric \nCheck --help")
    }

    return program;
}

function collect(val, memo) {
    memo.push(val);
    return memo;
}

function map(val, obj) {
    _.extend(obj, _.fromPairs([val.split('=')]));
    return obj;
}

function list(val) {
    return val.split(',');
}