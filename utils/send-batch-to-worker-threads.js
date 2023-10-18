const { Worker } = require('worker_threads')

function getWorkerPromise(tableName, currentDataSpliced){
    return new Promise((resolve, reject) => {

        const worker = new Worker('./utils/worker.js', {
            workerData: {
                tableName,
                currentData: currentDataSpliced
            }
        })

        worker.on("message", result => {
            resolve(result);
        })

          worker.on("error", msg => {
            reject(`An error ocurred: ${msg}`);
        })
    })
}

function resultsMap(tableName, results){
    return results.map(result => {
        return {[tableName]: result}
    })
}

async function sendBatchToWorkerThreads(tableName, currentData){

    const len = currentData.length
    if(len <= 4){
        const resolved = await Promise.all(currentData.map(newline => {
            return getWorkerPromise(tableName, [newline])
        }))
        return resultsMap(tableName, resolved)
    }else{
        const promises = []
        const quarterLength = Math.floor(len/4)
        for(let i = 0; i < 3; i++){
            promises.push(
                getWorkerPromise(
                    tableName, 
                    [...currentData.splice(0, quarterLength)]
                )
            )
        }
        promises.push(
            getWorkerPromise(
                tableName, 
                currentData
            )
        ) // last quarter + remainder
        const resolved = await Promise.all(promises)
        return resultsMap(tableName, resolved)
    }
}

module.exports = {
    sendBatchToWorkerThreads
}