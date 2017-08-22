#! /usr/bin/env node

const fs = require('fs'), 
    _ = require('lodash'),
    newman = require('newman'),
    program = require('commander'),
    Collection = require('postman-collection').Collection,
    ItemGroup = require('postman-collection').ItemGroup,
    logLevel = 'INFO';

function collect(val, memo) {
    memo.push(val);
    return memo;
}
function map(val,obj){
    _.extend(obj,_.fromPairs([val.split('=')]));
    return obj;
}
function list(val) {
  return val.split(',');
}
program
    .version('0.1.0')
    .usage('run <collection> [options]')
    .option('run <collection>','Collection to run')
    .option('-e, --environment [source]','Specify an environment file path or URL')
    .option('-g, --globals [source]','Specify file path or URL for global variables')
    .option('-d, --iteration-data [source]','Specify a data source file (CSV) to be used for iteration as a path to a file or as a URL')
    .option('-n, --iteration-count [n]','Specifies the number of times the collection has to be run when used in conjunction with iteration data file')
    .option('--folder [name]','Run requests within a particular folder in a collection',collect,[])
    .option('--export-environment  [path]','The path to the file where Newman will output the final environment variables file before completing a run.')
    .option('--export-globals [path]','The path to the file where Newman will output the final global variables file before completing a run.')
    .option('--export-collection [path]','The path to the file where Newman will output the final collection file before completing a run.')
    .option('--timeout-request [ms]','Specify the time (in milliseconds) to wait for requests to return a response.')
    .option('-k, --insecure','Disables SSL verification checks and allows self-signed SSL certificates.')
    .option('--ignore-redirects','Prevents newman from automatically following 3XX redirect responses.')
    .option('--delay-request [ms]','Specify the extent of delay between requests (milliseconds).')
    .option('--bail','Specify whether or not to stop a collection run on encountering the first error.')
    .option('-x, --suppress-exit-code','Specify whether or not to override the default exit code for the current run.')
    .option('--color','Use this option to force colored CLI output (for use in CLI for CI / non TTY environments).')
    // .option('--no-color','Newman attempts to automatically turn off color output to terminals when it detects the lack of color support')
    .option('--disable-unicode','Specify whether or not to force the unicode disable option')
    .option('--global-var [key=value]','Allows the specification of global variables via the command line, in a key=value format. like so: --global-var "foo=bar" --global-var "alpha=beta"',map,{})
    .option('-r, --reporters [reporter-name]','Specify one reporter name as string or provide more than one reporter name as a comma separated list of reporter names. Available reporters are: cli, json, html and junit',list,['cli'])
    .option('--reporter-html-export [path]','Specify a path where the output HTML file will be written to disk')
    .option('--reporter-html-template [path]','Specify a path to the custom template which will be used to render the HTML report')
    .option('--ssl-client-cert [path]','The path to the public client certificate file.')
    .option('--ssl-client-key [path]','The path to the private client key (optional).')
    .option('--ssl-client-passphrase [value]','The secret passphrase used to protect the private client key (optional).')
    .parse(process.argv);

if (!program.run)
    {console.log('\n  error: run <collection> required'); program.help();}

let options = prepareOptions(program);

if (program.folder.length > 1){
    let inputCollection = new Collection(JSON.parse(fs.readFileSync(program.run).toString()));
    filter(inputCollection,inputCollection,program.folder);
    options.collection = inputCollection;
    _.unset(options,'folder');
    // fs.writeFileSync('NewCollection.json', JSON.stringify(inputCollection.toJSON(),'',2));    
    // log('INFO','DONE WITH COLLECTION');
}
else
    options.collection = program.run;

newman.run(options,(err,summary)=>{
    if (err) log('INFO',err);
    log('INFO','DONE');
});

function prepareOptions(program){
    let reporter;
    if (program.reporterHtmlExport)
        reporter = { html : { export : program.reporterHtmlExport} };
    if (program.reporterHtmlTemplate)
        reporter = reporter ? _.set(reporter,'html.template',program.reporterHtmlTemplate) : { html : { template: program.reporterHtmlTemplate } };

    let options = {
        'environment': program.environment,
        'globals': program.globals,
        'iterationCount': program.iterationCount,
        'iterationData': program.iterationData,
        'folder': program.folder.length === 1 ? program.folder[0] : undefined,
        'timeoutRequest': program.timeoutRequest,
        'delayRequest': program.delayRequest,
        'ignoreRedirects': program.ignoreRedirects,
        'insecure': program.insecure,
        'bail': program.bail,
        'suppressExitCode': program.suppressExitCode,
        'reporters': program.reporters.length === 1 ? program.reporters[0] : program.reporters,
        'reporter': reporter,
        'color': program.color ? program.color : undefined,
        'sslClientCert': program.sslClientCert,
        'sslClientKey': program.sslClientKey,
        'sslClientPassphrase': program.sslClientPassphrase
    };
    let newopts = {};
    newopts = _.pickBy(options,src => {if (src === undefined) return false; else return true;})
    log('INFO',newopts);
    return newopts;
}

// Keeps all requests and folders below the Matching Folders
// Maintains tree structure of matching folder
// Deletes any requests in parent folders
function filter(folder,parent,includeFolders,l='|__'){
    // console.log(l+folders)
    log('DEBUG',l+'START:' + folder.name);
    // Skip the Folder if Name is part of include list
    if (!includeFolders.includes(folder.name)){
        // Check if it has any sub-folders
        if (!isLeaf(folder)){
            for (var i=folder.items.count()-1;i >= 0; i--){
                let item = folder.items.idx(i);
                log('DEBUG',l+'ITEM:' + item.name)
                if (item.items) // If a folder then recurse
                    filter(item,folder,includeFolders,l+'|__');
                else // If a request then remove it
                    {log('DEBUG',l+'REMOVE1:' + item.name);folder.items.remove(item.id);}
            }
            if (isLeaf(folder)) // If all sub-folders are removed then remove the parent
                {log('DEBUG',l+'REMOVE2:' + folder.name);parent.items.remove(folder.id);}
        }
        else // Remove if there are no sub-folders
            {log('DEBUG',l+'REMOVE3:' + folder.name);parent.items.remove(folder.id);}
    }
    log('DEBUG',l+'END:' + folder.name);
}

function isLeaf(fld){
    return !fld.items.all().some(item => {return item.items;});
}

function log(lvl,msg){lvl === logLevel ? console.log(msg): '';}