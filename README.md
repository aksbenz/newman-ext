# newman-ext
Extensions to newman   
Mainly to support running multiple folders at the same time, with few more additions.

```terminal
$ npm install newman-ext --global
```

Extension parameters:  
 - `run`  
 Can be given multiple times to merge and execute multiple collections as a single collection.
 - `--folder`  
 Can be provided multiple times. Collection will be filtered to keep only these folders.
 - `--exclude`  
 Folders to exclude. Can be provided multiple times. Executed before --folder.
 - `--seq`  
 Execute newman seperately for each selected `--folder`. Mainly to create seperate report for each folder.  
 - `-t, --tags`  
 Filters REQUESTS(not folders) based on the provided tags. Based on [Cucumber Tags Expressions](http://docs.cucumber.io/cucumber/api/#tags)

## Examples:
- `run`
```terminal
$ newman-ext run <PathToCollection1> run <PathToCollection2>
```  
    This will create a single collection with name : <Collection1.name>_<Collection2.name>
    A folder will be created for each collection with name : <Collection.name>
    All folders of that collection will be added under folder <Collection.name>
    Example: newman-ext run Coll1 run Coll2
    New Collection will look like:
        Coll1_Coll2
        |_Coll1
        | |_Coll1Fld1
        | |_Coll1Fld2
        |_Coll1
          |_Coll2Fld1
          |_Coll2Fld2

- `--folder`
```terminal
$ newman-ext run <Collection> --folder one --folder two --folder three
```
This will filter `Collection` to include folders `one`, `two` and `three`

- `--exclude`
```terminal
$ newman-ext run <Collection> --exclude one --exclude two
```
This will filter `Collection` to exclude folders `one` and `two`

- `--exclude --folder`
```terminal
$ newman-ext run <Collection>  --folder one --folder two --exclude one_one
```
This will filter `Collection` to exclude folders `one_one` and then include folders `one` and `two`

## Command line Options

### `newman run <collection-file-source> [options]`

- `-e <source>`, `--environment <source>`<br />
  Specify an environment file path or URL. Environments provide a set of variables that one can use within collections.
  [Read More](https://www.getpostman.com/docs/environments)

- `-g <source>`, `--globals <source>`<br />
  Specify file path or URL for global variables. Global variables are similar to environment variables but has a lower
  precedence and can be overridden by environment variables having same name.

- `-d <source>`, `--iteration-data <source>`<br />
  Specify a data source file (CSV) to be used for iteration as a path to a file or as a URL.
  [Read More](https://www.getpostman.com/docs/multiple_instances)

- `-n <number>`, `--iteration-count <number>`<br />
  Specifies the number of times the collection has to be run when used in conjunction with iteration data file.

- `--folder <name>`<br />
  Run requests within a particular folder in a collection.

- `--timeout <ms>`<br />
  Specify the time (in milliseconds) to wait for the entire collection run to complete execution.

- `--timeout-request <ms>`<br />
  Specify the time (in milliseconds) to wait for requests to return a response.

- `--timeout-script <ms>`<br />
  Specify the time (in milliseconds) to wait for scripts to complete execution.

- `-k`, `--insecure`<br />
  Disables SSL verification checks and allows self-signed SSL certificates.

- `--ignore-redirects`<br />
  Prevents newman from automatically following 3XX redirect responses.

- `--delay-request`<br />
  Specify the extent of delay between requests (milliseconds).

- `-x`, `--suppress-exit-code`<br />
  Specify whether or not to override the default exit code for the current run.

- `--color`<br />
  Use this option to force colored CLI output (for use in CLI for CI / non TTY environments).

- `-t, --tags`<br />
  Exclude/include REQUESTS based on tag(@text) in description. Requests with no description are not filtered and present in final collection.

- `-m, --remove-emptyDesc`<br />
  If present, alongwith --tags, then removes requests with empty description

#### Configuring Reporters

Reporters provide information about the current collection run in a format that is easy to both: disseminate and assimilate.

- `-r <reporter-name>`, `--reporters <reporter-name>`<br />
  Specify one reporter name as `string` or provide more than one reporter name as a comma separated list of reporter names. Available reporters are: `cli`, `json`, `html` and `junit`.<br/><br/>
Spaces should **not** be used between reporter names / commas whilst specifying a comma separted list of reporters. For instance:<br/><br/>
:white_check_mark: `-r html,cli,json,junit` <br/>
:x: `-r html, cli , json,junit`

- `--reporter-{{reporter-name}}-{{reporter-option}}`<br />
  When multiple reporters are provided, if one needs to specifically override or provide an option to one reporter, this
  is achieved by prefixing the option with `--reporter-{{reporter-name}}-`.<br /><br />
  For example, `... --reporters cli,html --reporter-cli-silent` would silence the CLI reporter only.

##### CLI reporter options
These options are supported by the CLI reporter, use them with appropriate argument switch prefix. For example, the
option `no-summary` can be passed as `--reporter-no-summary` or `--reporter-cli-no-summary`.

CLI reporter is enabled by default, you do not need to specifically provide the same as part of `--reporters` option.
However, enabling one or more of the other reporters will result in no CLI output. Explicitly enable the CLI option in
such a scenario.

| CLI Option  | Description       |
|-------------|-------------------|
| `--reporter-cli-silent`         | The CLI reporter is internally disabled and you see no output to terminal. |
| `--reporter-cli-no-summary`     | The statistical summary table is not shown. |
| `--reporter-cli-no-failures`    | This prevents the run failures from being separately printed. |
| `--reporter-cli-no-assertions`  | This turns off the output for request-wise assertions as they happen. |
| `--reporter-cli-no-success-assertions`  | This turns off the output for successful assertions as they happen. |
| `--reporter-cli-no-console`     | This turns off the output of `console.log` (and other console calls) from collection's scripts. |

##### JSON reporter options
The built-in JSON reporter is useful in producing a comprehensive output of the run summary. It takes the path to the
file where to write the file. The content of this file is exactly same as the `summary` parameter sent to the callback
when Newman is used as a library.

To enable JSON reporter, provide `--reporters json` as a CLI option.

| CLI Option  | Description       |
|-------------|-------------------|
| `--reporter-json-export <path>` | Specify a path where the output JSON file will be written to disk. If not specified, the file will be written to `newman/` in the current working directory. |


##### HTML reporter options
The built-in HTML reporter produces and HTML output file outlining the summary and report of the Newman run. To enable the
HTML reporter, provide `--reporters html` as a CLI option.

| CLI Option  | Description       |
|-------------|-------------------|
| `--reporter-html-export <path>` | Specify a path where the output HTML file will be written to disk. If not specified, the file will be written to `newman/` in the current working directory. |
| `--reporter-html-template <path>` | Specify a path to the custom template which will be used to render the HTML report. This option depends on `--reporter html` and `--reporter-html-export` being present in the run command. If this option is not specified, the [default template](https://github.com/postmanlabs/newman/blob/develop/lib/reporters/html/template-default.hbs) is used |

Custom templates (currently handlebars only) can be passed to the HTML reporter via `--reporter-html-template <path>` with `--reporters html` and `--reporter-html-export`.
The [default template](https://github.com/postmanlabs/newman/blob/develop/lib/reporters/html/template-default.hbs) is used in all other cases.

##### JUNIT/XML reporter options
Newman can output a summary of the collection run to a JUnit compatible XML file. To enable the JUNIT reporter, provide
`--reporters junit` as a CLI option.

| CLI Option  | Description       |
|-------------|-------------------|
| `--reporter-junit-export <path>` | Specify a path where the output XML file will be written to disk. If not specified, the file will be written to `newman/` in the current working directory. |

Older command line options are supported, but are deprecated in favour of the newer v3 options and will soon be
discontinued. For documentation on the older command options, refer to [README.md for Newman v2.X](https://github.com/postmanlabs/newman/blob/release/2.x/README.md).
