const {stager} = require('./stage-tables')

async function iterateFileLinesCb(line, batch, batchMax) {
    const parsed = JSON.parse(line)

    const dbIndex = batch.currentIndex + 1
    stager.dataMapFunctions.thread(parsed, dbIndex)
    stager.dataMapFunctions.post(parsed, dbIndex)

    batch.increment()
    console.log(`batch.count: ${batch.count}`)
    if(batch.count >= batchMax){
        await stager.writeDataFiles()
        batch.reset()
    }
    return
}

module.exports = {
    iterateFileLinesCb
}