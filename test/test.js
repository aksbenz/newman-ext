const _ = require('lodash'),
    ext = require('../newman-ext.js');

let context = ext.run(_.concat(process.argv, ['run', 'sample.postman_collection.json', '-p', 's', '--reporters', 'cli,html', '--demo']));

// 
// console.log(JSON.stringify(context, '', 2));