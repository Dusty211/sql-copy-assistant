const fs = require('fs')
const path = require('path')
const readline = require('readline')

const {Batch} = require('./Batch')

const {sourceDir} = require('../paths.json')
const DATAFILE = path.join(__dirname, sourceDir)

async function iterateFileLines(cb, max = null, batchMax = 5000){

    try{
        const rl = readline.createInterface({
            input: fs.createReadStream(DATAFILE),
            crlfDelay: Infinity
        })

        const batch = new Batch()
        let appendDataToFileFn

        for await (const line of rl) {
            const dbIndex = batch.currentIndex + 1

            if(typeof max === 'number' && batch.currentIndex >= max){
                break
            }else{
                appendDataToFileFn = await cb(line, dbIndex)
                batch.increment()
                if(batch.count >= batchMax){
                    await appendDataToFileFn()
                    batch.reset()
                }
                batch.incrementCurrentIndex()
            }
        }
        await appendDataToFileFn()
        batch.reset()
    }catch(e){
        console.error(e)
    }
}

module.exports = {
    iterateFileLines
}