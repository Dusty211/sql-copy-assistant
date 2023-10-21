const fs = require('fs')
const path = require('path')
const readline = require('readline')

const {Batch} = require('./Batch')
const {sendBatchToWorkerThreads} = require('./send-batch-to-worker-threads')
const {OutputHelper} = require('./OutputHelper')
const mapDataFunctions = require('./stage-table-functions')
const tableNames = Object.keys(mapDataFunctions)

const {sourceDir, outputDir} = require('../paths.json')
const DATAFILE = path.join(__dirname, sourceDir)
const outputHelper = new OutputHelper(outputDir)

async function iterateFileLines(max = null, batchMax = 5000) {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(DATAFILE),
            crlfDelay: Infinity
        })

        await outputHelper.initWriteStreams(tableNames)

        const batch = new Batch()
        const nextData = []
        let currentData = []
        let workerThreadPromises = []
        let workerThreadResults = []

        for await (const line of rl) {
            const dbIndex = batch.currentIndex + 1

            if (typeof max === 'number' && batch.currentIndex >= max) {
                break
            } else {
                nextData.push([dbIndex, line])
                batch.increment()
                if (batch.count >= batchMax) {
                    workerThreadResults = await workerThreadPromises
                    await outputHelper.writeBuffersToFiles(workerThreadResults) //will be an empty string on first batch.
                    workerThreadPromises = Promise.all(
                        tableNames.map((tableName) => {
                            return sendBatchToWorkerThreads(tableName, currentData)
                        })
                    )
                    currentData = [...nextData]
                    nextData.length = 0
                    batch.reset()
                }
                batch.incrementCurrentIndex()
            }
        }
        //Handle data still coming back from last loop of for loop:
        workerThreadResults = await workerThreadPromises
        await outputHelper.writeBuffersToFiles(workerThreadResults)

        //Remaining unprocessed 'currentData':
        workerThreadPromises = Promise.all(
            tableNames.map((tableName) => {
                return sendBatchToWorkerThreads(tableName, currentData)
            })
        )
        workerThreadResults = await workerThreadPromises
        await outputHelper.writeBuffersToFiles(workerThreadResults)

        //Remaining unprocessed 'nextData':
        workerThreadPromises = Promise.all(
            tableNames.map((tableName) => {
                return sendBatchToWorkerThreads(tableName, nextData) //Promise.all
            })
        )
        workerThreadResults = await workerThreadPromises
        await outputHelper.writeBuffersToFiles(workerThreadResults, {final: true})

        batch.reset()
    } catch (e) {
        console.error(e)
    }
}

module.exports = {
    iterateFileLines
}
