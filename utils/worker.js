const {workerData, parentPort} = require('worker_threads')
const mapDataFunctions = require('./stage-table-functions')

const encoder = new TextEncoder();

(function({tableName, currentData}){
    const output = []
    for(const [id, text] of currentData){
        const stringResult = mapDataFunctions[tableName](id, text)
        const uint = encoder.encodeInto( stringResult, new Uint8Array(stringResult.length * 3) ) //optimization of allocation
        output.push(uint)
    }

    let totalLength = 0
    output.forEach( uint => {
        totalLength += uint.length
    })
    const uintResult = new Uint8Array(totalLength)

    let offset = 0
    output.forEach(uint => {
        uintResult.set(uint, offset)
        offset += uint.length
    })

    parentPort.postMessage(uintResult, [uintResult.buffer])
})(workerData)