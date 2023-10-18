const fs = require('fs')
const path = require('path')
const readline = require('readline')

const {Batch} = require('./Batch')
const {sendBatchToWorkerThreads} = require('./send-batch-to-worker-threads')
const mapDataFunctions = require('./stage-table-functions')

const {sourceDir} = require('../paths.json')
const DATAFILE = path.join(__dirname, sourceDir)
const tableNames = Object.keys(mapDataFunctions)

async function iterateFileLines(max = null, batchMax = 5000){
    try{
        const handleData = workerThreadResults => new Promise((resolve) => {
            setTimeout(() => resolve('test timeout promise'), 800)
        })

        const rl = readline.createInterface({
            input: fs.createReadStream(DATAFILE),
            crlfDelay: Infinity
        })

        const batch = new Batch()
        const nextData = []
        let currentData = []
        let workerThreadPromises = []
        let workerThreadResults = []

        for await (const line of rl) {
            const dbIndex = batch.currentIndex + 1

            if(typeof max === 'number' && batch.currentIndex >= max){
                break
            }else{
                nextData.push([dbIndex, line])
                batch.increment()
                if(batch.count >= batchMax){
                    workerThreadResults = await workerThreadPromises
                    handleData(workerThreadResults) //will be an empty string on first batch.
                    workerThreadPromises = Promise.all(tableNames.map(tableName => {
                        return sendBatchToWorkerThreads(tableName, currentData)
                    }))
                    currentData = [...nextData]
                    nextData.length = 0
                    batch.reset()
                }
                batch.incrementCurrentIndex()
            }
        }
        //Handle data still coming back from last loop of for loop:
        workerThreadResults = await workerThreadPromises
        handleData(workerThreadResults)

        //Remaining unprocessed 'currentData':
        workerThreadPromises = Promise.all(tableNames.map(tableName => {
            return sendBatchToWorkerThreads(tableName, currentData)
        }))
        workerThreadResults = await workerThreadPromises
        handleData(workerThreadResults)

        //Remaining unprocessed 'nextData':
        workerThreadPromises = Promise.all(tableNames.map(tableName => {
            return sendBatchToWorkerThreads(tableName, nextData) //Promise.all
        }))
        workerThreadResults = await workerThreadPromises
        await handleData(workerThreadResults)

        batch.reset()
    }catch(e){
        console.error(e)
    }
}

module.exports = {
    iterateFileLines
}