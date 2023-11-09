const {pipeline} = require('node:stream/promises')
const fs = require('node:fs')
const {join} = require('path')
const readline = require('readline')
const {WorkerPool} = require('./WorkerPool')
const {PoolFiller} = require('./PoolFiller')
const {StreamBuilder} = require('./StreamBuilder')

async function runPipeline({maxLines = Infinity, outBatchSize = 5000, cpus, functionsFilePath, outputDirectoryPath, inputFilePath}) {
    let pool
    await pipeline(
        //Read the ReadStream line-by-line, and then pipe
        async function* () {
            const rl = readline.createInterface({
                input: fs.createReadStream(inputFilePath),
                crlfDelay: Infinity
            })
            for await (const line of rl) {
                yield line
            }
        },

        //Process each line using a thread pool, and then pipe
        async function* (source) {
            const workerPool = new WorkerPool(cpus, join(__dirname, './worker.js'), functionsFilePath)
            pool = new PoolFiller(workerPool)

            let index = 1
            for await (const string of source) {
                if (index > maxLines) {
                    break
                }

                await pool.fill({index, string})
                const messages = pool.getMessages()
                for (let i = 0; i < messages.length; i++) {
                    yield messages[i]
                }
                ++index
            }
            const messages = await pool.finish()
            for (let i = 0; i < messages.length; i++) {
                yield messages[i]
            }
        },

        // Write threadpool results to files
        async function* (source) {
            const streams = await new StreamBuilder(outputDirectoryPath, functionsFilePath).asyncInit()
            let batchCount = 0
            try{
                for await (const result of source) {
                    streams.push(result)
                    batchCount++
                    if (batchCount === outBatchSize) {
                        await streams.writeBatchToStreams()
                        batchCount = 0
                        yield `Pool in/out: ${pool.linesIn}/${pool.linesOut}. Sent to fileStream: ${streams.resultCount}.\r`
                    }
                }
            }finally{
                await streams.writeBatchToStreams({final: true})
                yield `Pool in/out: ${pool.linesIn}/${pool.linesOut}. Sent to fileStream: ${streams.resultCount}. Leftovers: ${JSON.stringify(streams.resultsLengths)}.\r`
            }
        },
        process.stdout
    ).catch(error => {
        process.stderr.write(`${error.stack}`)
    })
}

module.exports = {runPipeline}
