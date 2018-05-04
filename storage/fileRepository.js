'use strict';

const Repository = require('./repository');
const fs = require('fs');
const path = require('path');
const { promisfy } = require('promisfy');
const readFileAsync = promisfy(fs.readFile);
const writeFileAsync = promisfy(fs.writeFile);
const unlinkAsync = promisfy(fs.unlink);

/**
 * A repository that saves/loads collections of objects to/from file
 */
class FileRepository extends Repository {
    constructor(dataPath, deserializer) {
        super();
        this.dataPath = dataPath;
        this.deserializer = deserializer;
        FileRepository._createDirectory(dataPath);
    }

    saveCollectionAsync(collectionId, serializedCollection) {
        return writeFileAsync(this._getFilename(collectionId), serializedCollection);
    }

    // collectionId is a filename without the extension
    loadCollectionAsync(collectionId) {
        console.info("FileRepository.loadCollectionAsync");
        let filename = this._getFilename(collectionId);        
        return readFileAsync(filename, 'utf8')        
            .then((text) => {
                return this.deserializer.convertToObjectsAsync(text, filename);
            })
            .then((objs) => {
                this.insert(objs);
            });
    }

    deleteCollection(collectionId) {
        let filename = this._getFilename(collectionId);
        if (fs.existsSync(filename)) {
            console.info("Delete: " + filename);
            fs.unlinkSync(filename);
        }
    }

    static _createDirectory(filePath) {
        let directoryNames = path.normalize(filePath).split(path.sep);
        let dataDirectory = "";
        for (let dirname of directoryNames) {
            dataDirectory = path.join(dataDirectory, dirname);
            if (!fs.existsSync(dataDirectory)) {
                fs.mkdirSync(dataDirectory);
            }
        }
      }

    _getFilename(id) {
        return path.join(this.dataPath, id) + "." + this.deserializer.fileType();
    }
}

module.exports = FileRepository;