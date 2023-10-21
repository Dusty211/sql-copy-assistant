const fs = require('fs')
const path = require('path')

function OutputHelper(outputDir) {
    this.outputDir = outputDir
    this.fileTimestamp = Date.now()
    this.writeStreams = {}

    this.writeBuffersToFiles = async function (workerThreadResults, options = {}) {
        const appendDataPromises = workerThreadResults.flat(Infinity).flatMap((result) => {
            Object.entries(result).map(([tableName, uint8Array]) => {
                return new Promise((resolve, reject) => {
                    try {
                        const currentStream = this.writeStreams[tableName]
                        const cleanUp = () =>
                            currentStream.on('finish', () => {
                                currentStream.end(resolve)
                            })
                        if (!currentStream.write(uint8Array)) {
                            currentStream.once('drain', options.final ? cleanUp : resolve)
                        } else {
                            options.final ? cleanUp() : resolve()
                        }
                    } catch (error) {
                        reject(error)
                    }
                })
            })
        })
        await Promise.all(appendDataPromises)
        return this
    }

    this.initWriteStreams = async function (tableNames) {
        const createFilePath = (tableName) =>
            path.join(this.outputDir, `${this.fileTimestamp}-${tableName}`)

        const getCreatedFileStreamOnReady = (tableName) => {
            return new Promise((resolve, reject) => {
                try {
                    const stream = fs.createWriteStream(createFilePath(tableName), {
                        autoClose: false,
                        flags: 'a'
                    })
                    stream.once('ready', () => resolve({tableName, stream}))
                    stream.on('error', (e) => console.error(e))
                } catch (error) {
                    reject(error)
                }
            })
        }

        const streams = await Promise.all(
            tableNames.map((tableName) => getCreatedFileStreamOnReady(tableName))
        )

        for (const {tableName, stream} of streams) {
            this.writeStreams[tableName] = stream
        }
        return this
    }
}

module.exports = {OutputHelper}
