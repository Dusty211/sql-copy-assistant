const fs = require('node:fs')
const {join} = require('path')

class StreamBuilder {
    constructor(outputDirectoryPath, functionsFilePath) {
        this.outputDirectoryPath = outputDirectoryPath
        this.functionsFilePath = functionsFilePath
        this.fileNames = []
        this.streams = {}
        this.workerResults = {}
        this.resultsPushed = 0
    }

    async asyncInit() {
        const fileFunctions = require(this.functionsFilePath)
        this.fileNames = Object.keys(fileFunctions)

        for (const fileName of this.fileNames) {
            this.workerResults[fileName] = []
        }
        await this.#createdFileStreamsOnReady()
        return this
    }

    push(workerResult) {
        for (const fileName in workerResult) {
            this.workerResults[fileName].push(workerResult[fileName])
        }
        this.resultsPushed++
        return this
    }

    async writeBatchToStreams(options) {
        if (options?.final) {
            for (const fileName in this.streams) {
                for (let i = this.workerResults[fileName].length; i > 0; i--) {
                    if (i === 1) {
                        await this.#writeToStream(
                            this.workerResults[fileName].shift(),
                            fileName,
                            options
                        )
                        //overriding final because we only want it on the last iteration.
                    } else {
                        await this.#writeToStream(this.workerResults[fileName].shift(), fileName, {
                            ...options,
                            final: false
                        })
                    }
                }
            }
        } else {
            for (const fileName in this.streams) {
                for (let i = this.workerResults[fileName].length; i > 0; i--) {
                    await this.#writeToStream(
                        this.workerResults[fileName].shift(),
                        fileName,
                        options
                    )
                }
            }
        }
        return this
    }

    get resultsLengths() {
        const result = {}
        for (const fileName in this.workerResults) {
            result[fileName] = this.workerResults[fileName].length
        }
        return result
    }

    #createdFileStreamsOnReady() {
        return Promise.all(
            this.fileNames.map((fileName) => {
                return new Promise((resolve, reject) => {
                    try {
                        this.streams[fileName] = fs.createWriteStream(
                            join(this.outputDirectoryPath, `${Date.now()}-${fileName}`),
                            {
                                autoClose: false,
                                flags: 'a'
                            }
                        )
                        this.streams[fileName].once('ready', () => resolve())
                        this.streams[fileName].on('error', (e) => console.error(e))
                    } catch (error) {
                        reject(error)
                    }
                })
            })
        )
    }

    #writeToStream(data, fileName, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const cleanUp = () => {
                    this.streams[fileName].end(resolve)
                }
                if (!this.streams[fileName].write(data)) {
                    this.streams[fileName].once('drain', options.final ? cleanUp : resolve)
                } else {
                    options.final ? cleanUp() : resolve()
                }
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = {StreamBuilder}
