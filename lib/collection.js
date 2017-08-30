module.exports.allRequestsUnder = allRequests;
module.exports.allFoldersUnder = allFolders;

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