const _ = require('lodash'),
    ext = require('../newman-ext.js');

ext.setTestMode(true);

let context = ext.run(_.concat(process.argv, ['run', 'sample.json', '--folder', 'F3', '--folder', 'Folder 2']));
console.log(context);