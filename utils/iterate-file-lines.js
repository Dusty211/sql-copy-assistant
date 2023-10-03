const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { once } = require('node:events');

const {sourceDir} = require('../paths.json')
const DATAFILE = path.join(__dirname, sourceDir)

async function iterateFileLines(max = 'none', cb){
    try{
        const rl = readline.createInterface({
            input: fs.createReadStream(DATAFILE),
            crlfDelay: Infinity
        })
        let currentLine = 1

        for await (const line of rl) {
            if(typeof max === 'number' && max < currentLine){
                break
            }else{
                cb(line)
                ++currentLine
            }
        }

        // rl.on('line', (line) => {
        //     if(typeof max === 'number' && max < currentLine){
        //         rl.close()
        //         rl.removeAllListeners()
        //     }else{
        //         cb(line)
        //         ++currentLine
        //     }
        // })
        // await once(rl, 'close')
    }catch(e){
        console.error(e)
    }
}

module.exports = {
    iterateFileLines
}