# newman-ext
Extensions to newman
Mainly to support running multiple folders at the same time, with few more additions.

All newman command lines supported. Except --no-color due to limitations with commanderjs.

Extension parameters:
 --folder : Can be provided multiple times. All folders will be run as a single collection.
 --exclude : Folders to exclude. Can be provided multiple times.
 --group : Overrides --parallel. Create collections with each collection having these many folders and execute all groups in parallel.
 --p, --parallel : Create these many number of collections, each having equal(or less) number of folders. Execute all in parallel.
