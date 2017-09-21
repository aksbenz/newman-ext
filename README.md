# newman-ext
Extensions to newman
Mainly to support running multiple folders at the same time, with few more additions.

All newman command lines supported. Except --no-color due to limitations with commanderjs.

Extension parameters:
 run : Can be given multiple times to merge and execute multiple collections, as a single collection.
 --folder : Can be provided multiple times. Collection will be filtered to keep only these folders.
 --exclude : Folders to exclude. Can be provided multiple times.
 --group : Overrides --parallel. Splits into multiple collections, with each collection having these many folders and execute all groups in parallel.
 --p, --parallel : Create these many number of collections, each having equal(or less) number of folders. Execute all in parallel.

Details:

run <PathToCollection1> run <PathToCollection2>
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


--group [num]
    This is applied after "run, --folder and --exclude".
    Takes preference over --parallel.
    This will split main collection into multiple collections.
    Each collection will have upto <num> direct folders.
    All collections will be run in parallel.
    Example: Collection with 8 direct child folders (any number of sub-folders)
    --group 2
        Coll1 - 2 folders
        Coll2 - 2 folders
        Coll3 - 2 folders
        Coll4 - 2 folders
    --group 3
        Coll1 - 3 folders
        Coll2 - 3 folders
        Coll3 - 2 folders
    --group 4
        Coll1 - 4 folders
        Coll2 - 4 folders    
    
--parallel [num]
    This is applied after "run, --folder and --exclude"
    This will split main collection into: upto [num] number of collections.
    Total number of direct child folders of main collection is equally divided and added to each collection.
    All collections will be run in parallel.
    Example: Collection with 8 direct child folders (any number of sub-folders)
    --parallel 2
        Coll1 - 4 folders
        Coll2 - 4 folders
    --parallel 3
        Coll1 - 3 folders
        Coll2 - 3 folders
        Coll3 - 2 folders
    --parallel 4
        Coll1 - 2 folders
        Coll2 - 2 folders
        Coll3 - 2 folders
        Coll4 - 2 folders