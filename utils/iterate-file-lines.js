const fs = require('fs')
const path = require('path')
const readline = require('readline')

const {sourceDir} = require('../paths.json')
const DATAFILE = path.join(__dirname, sourceDir)

async function iterateFileLines(max, cb){
    try{
        const rl = readline.createInterface({
            input: fs.createReadStream(DATAFILE),
            crlfDelay: Infinity
        })
        let currentLine = 1
        const batchCount = {value: 1}

        for await (const line of rl) {
            if(typeof max === 'number' && max < currentLine){
                break
            }else{
                cb(line, batchCount)
                ++currentLine
            }
        }
    }catch(e){
        console.error(e)
    }
}

module.exports = {
    iterateFileLines
}