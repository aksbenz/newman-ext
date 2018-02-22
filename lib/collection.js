let Collection = require('postman-collection').Collection;
let ItemGroup = require('postman-collection').ItemGroup;
let _ = require('lodash');
let fs = require('fs');
let uuid = require('uuid/v4');

module.exports.allRequestsUnder = allRequests;
module.exports.allFoldersUnder = allFolders;
module.exports.filter = filter;
module.exports.merge = merge;
module.exports.split = split;
module.exports.filter_v2 = filter_v2;
module.exports.merge_v2 = merge_v2;
module.exports.split_v2 = split_v2;
module.exports.tagFilter = tagFilter;

let logLevel = 'INFO|ERROR|FATAL';

function allRequests(fld) {
    let reqs = [];
    fld.forEachItem(item => {
        reqs.push(item);
    })
    return reqs;
}

function allFolders(fld) {
    let flds = [];
    fld.forEachItemGroup(item => {
        flds.push(item);
    })
    return flds;
}

//Merge a list of collections and return a single json collection
function merge(paths) {
    let merged = new Collection({ info: { 'name': 'merged' } });
    let name = '';
    _.each(paths, (collPath) => {
        let coll = new Collection(JSON.parse(fs.readFileSync(collPath).toString()));
        let collAsFolder = new ItemGroup({ "name": coll.name });
        name += '_' + coll.name;
        coll.items.each((item) => {
            collAsFolder.items.add(item);
        });
        merged.items.add(collAsFolder);
    });

    merged.name = name.slice(1);
    return merged;
}

// Splits single collection into number of multiple collections each having <count> number of folders
// Splits based on FOLDERS at the 1st level under the collection
function split(collection, count, isParallel = false) {
    count = _.parseInt(count);
    let collections = [];
    let totalFolders = collection.items.count();
    if (isParallel)
        count = Math.ceil(totalFolders / count);
    if (count >= totalFolders)
        collections.push(collection);
    else {
        for (var i = 0; i < totalFolders; i += count) {
            let partCollection = new Collection(collection.toJSON());
            for (var j = totalFolders - 1; j >= 0; j--) // Remove all other folders from this collection
                if (!(j >= i && j < (i + count)))
                    partCollection.items.remove(partCollection.items.idx(j).id);
            collections.push(partCollection);
        }
    }
    return collections;
}


// Keeps all requests and folders below the Matching Folders
// Maintains tree structure of matching folder
// Deletes any requests in parent folders
function filter(folder, parent, includeFolders, l = '|__') {
    log('DEBUG', l + 'START:' + folder.name);
    // Skip the Folder if Name is part of include list
    if (!includeFolders.includes(folder.name)) {
        // Check if it has any sub-folders
        if (!isLeaf(folder)) {
            for (var i = folder.items.count() - 1; i >= 0; i--) {
                let item = folder.items.idx(i);
                log('DEBUG', l + 'ITEM:' + item.name);
                // If a folder then recurse
                if (item.items)
                    filter(item, folder, includeFolders, l + '|__');
                // If a request then remove it
                else {
                    log('DEBUG', l + 'REMOVE1:' + item.name);
                    folder.items.remove(item.id);
                }
            }
            // If all sub-folders are removed then remove the parent
            if (isLeaf(folder)) {
                log('DEBUG', l + 'REMOVE2:' + folder.name);
                parent.items.remove(folder.id);
            }
        }
        // Remove if there are no sub-folders
        else {
            log('DEBUG', l + 'REMOVE3:' + folder.name);
            parent.items.remove(folder.id);
        }
    }
    log('DEBUG', l + 'END:' + folder.name);
    return folder;
}

// NOT USING POSTMAN-COLLECTION SDK
// Splits single collection into number of multiple collections each having <count> number of folders
// Splits based on FOLDERS at the 1st level under the collection
function split_v2(collection, count, isParallel = false) {
    count = _.parseInt(count);
    let collections = [];
    let totalFolders = collection.item.length;
    if (isParallel)
        count = Math.ceil(totalFolders / count);
    if (count >= totalFolders)
        collections.push(collection);
    else {
        for (var i = 0; i < totalFolders; i += count) {
            let partCollection = { info: { 'name': _.get(collection, 'info.name') + '_' + (i + 1), 'description': _.get(collection, 'info.description') }, item: [] };
            for (var j = 0; j < count && (j + i) < totalFolders; j++)
                partCollection.item.push(collection.item[i + j]);
            collections.push(partCollection);
        }
    }
    return collections;
}

// NOT USING POSTMAN-COLLECTION SDK
//Merge a list of collections and return a single json collection
function merge_v2(paths) {
    let merged = { info: { 'name': '', 'description': '' }, item: [] };

    _.each(paths, (collPath) => {
        let coll = JSON.parse(fs.readFileSync(collPath).toString());
        coll.name = _.get(coll, 'info.name');
        coll.description = _.get(coll, 'info.description');
        _.unset(coll, 'info');
        _.unset(coll, 'variables');
        merged.item.push(coll);
        merged.info.name += '_' + coll.name;
    });

    merged.info.name = merged.info.name.slice(1);
    return merged;
}


// Iterate through all non-folder requests in the Collection
// If description has any of the tags in tagIncludetest, then include else remove the request
// If description has any of the tags in tagExcludetest, then remove the request else keep it
function tagFilter(folder, parent, tags, l = '|__') {
    // console.log(_.get(tags, 'tagIncludetest.length'));
    if (_.get(tags, 'tagIncludeTest.length') === 0 && _.get(tags, 'tagExcludeTest.length') === 0)
        return folder;

    let folderName = folder.name || folder.info.name;
    folder.id = uuid();
    log('DEBUG', l + 'START: ' + folderName);
    if (folder.item) {
        for (var i = folder.item.length - 1; i >= 0; i--) {
            let item = folder.item[i];
            log('DEBUG', l + 'TYPE: ' + (item.item ? 'FOLDER' : 'REQUEST') + ' - NAME: ' + _.get(item, 'name'));
            // If a folder then recurse
            if (item.item)
                tagFilter(item, folder, tags, l + '|__');
            // If a request then remove it
            else {
                log('DEBUG', l + 'DESCRIPTION:' + _.get(item, 'request.description'));
                let words = _.split(_.get(item, 'request.description'), ' '); // Split description by space

                // If none of the tags are present in description then remove that item
                if (_.difference(tags.tagIncludetest, words).length === _.get(tags.tagIncludetest, 'length')) {
                    log('DEBUG', l + 'REMOVE1:' + _.get(item, 'name'));
                    _.pullAt(folder.item, i);
                }
            }
        }
        // If all sub-folders are removed and no requests are present under this folder, then remove this folder
        if (!folder.item || _.get(folder, 'item.length') === 0) {
            log('DEBUG', l + 'REMOVE2:' + folderName);
            _.remove(parent.item, (fld) => { return _.get(fld, 'id') === folder.id; });
        }
    }
    // Remove this folder if it is empty
    else {
        log('DEBUG', l + 'REMOVE3:' + folderName);
        _.remove(parent.item, (fld) => { return _.get(fld, 'id') === folder.id; });
    }
    log('DEBUG', l + 'END:' + folderName);
    _.unset(folder, 'id');
    return folder;
}

// NOT USING POSTMAN-COLLECTION SDK
// Keeps all requests and folders below the Matching Folders
// Maintains tree structure of matching folder
// Deletes any requests in parent folders
function filter_v2(folder, parent, includeFolders, tags, l = '|__') {
    let folderName = folder.name || folder.info.name;
    folder.id = uuid();
    log('DEBUG', l + 'START:' + folderName);
    // Skip the Folder if Name is part of include list
    if (!includeFolders.includes(folderName)) {
        // Check if it has any sub-folders
        if (!isLeaf_v2(folder)) {
            for (var i = folder.item.length - 1; i >= 0; i--) {
                let item = folder.item[i];
                log('DEBUG', l + 'ITEM:' + _.get(item, 'name'));
                // If a folder then recurse
                if (item.item)
                    filter_v2(item, folder, includeFolders, tags, l + '|__');
                // If a request then remove it
                else {
                    log('DEBUG', l + 'REMOVE1:' + _.get(item, 'name'));
                    _.pullAt(folder.item, i);
                }
            }
            // If all sub-folders are removed then remove the parent
            if (isLeaf_v2(folder)) {
                log('DEBUG', l + 'REMOVE2:' + folderName);
                _.remove(parent.item, (fld) => { return _.get(fld, 'id') === folder.id; });
            }
        }
        // Remove if there are no sub-folders
        else {
            log('DEBUG', l + 'REMOVE3:' + folderName);
            _.remove(parent.item, (fld) => { return _.get(fld, 'id') === folder.id; });
        }
    }
    log('DEBUG', l + 'END:' + folderName);
    _.unset(folder, 'id');
    return folder;
}

function isLeaf_v2(fld) {
    return !_.some(fld.item, (i) => {
        return _.has(i, 'item');
    });
}

function isLeaf(fld) {
    return !fld.items.all().some(item => {
        return item.items;
    });
}

function log(lvl, msg) {
    logLevel.includes(lvl) ? console.log(msg) : '';
}