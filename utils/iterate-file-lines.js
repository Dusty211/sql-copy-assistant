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

        for await (const line of rl) {
            if(typeof max === 'number' && batch.currentIndex >= max){
                break
            }else{
                await cb(line, batch, batchMax)
                batch.incrementCurrentIndex()
            }
        }
    }catch(e){
        console.error(e)
    }
}

module.exports = {
    iterateFileLines
}