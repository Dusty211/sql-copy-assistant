const fs = require('node:fs')
const path = require('path')
const tableFunctions = require('./stage-table-functions')
const {outputDir} = require('../paths.json')

class StreamBuilder {
    constructor() {
        this.tableNames = Object.keys(tableFunctions)
        this.streams = {}
        this.results = {}
        this.resultCount = 0
    }

    async asyncInit() {
        for (const tableName of this.tableNames) {
            this.results[tableName] = []
        }
        await this.#createdFileStreamsOnReady()
        return this
    }

    push(result){
        for (const tableName in result) {
            this.results[tableName].push(result[tableName])
        }
        this.resultCount++
        return this
    }

    async writeBatchToStreams(options) {
        if(options?.final){
            for (const tableName in this.streams) {
                for (let i = this.results[tableName].length; i > 0; i--) {
                    if(i === 1){
                        await this.#writeToStream(this.results[tableName].shift(), tableName, options)
                    }else{
                        await this.#writeToStream(this.results[tableName].shift(), tableName, {...options, final: false})
                    }
                }
            }
        }else{
            for (const tableName in this.streams) {
                for (let i = this.results[tableName].length; i > 0; i--) {
                    await this.#writeToStream(this.results[tableName].shift(), tableName, options)
                }
            }
        }
        return this
    }

    get resultsLengths() {
        const result = {}
        for(const tableName in this.results) {
            result[tableName] = this.results[tableName].length
        }
        return result
    }

    #createdFileStreamsOnReady() {
        return Promise.all(
            this.tableNames.map((tableName) => {
                return new Promise((resolve, reject) => {
                    try {
                        this.streams[tableName] = fs.createWriteStream(
                            path.join(outputDir, `${Date.now()}-${tableName}`),
                            {
                                autoClose: false,
                                flags: 'a'
                            }
                        )
                        this.streams[tableName].once('ready', () => resolve())
                        this.streams[tableName].on('error', (e) => console.error(e))
                    } catch (error) {
                        reject(error)
                    }
                })
            })
        )
    }

    #writeToStream(data, tableName, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const cleanUp = () => {
                    this.streams[tableName].end(resolve)
                }
                if (!this.streams[tableName].write(data)) {
                    this.streams[tableName].once('drain', options.final ? cleanUp : resolve)
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
