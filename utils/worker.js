const {workerData, parentPort} = require('worker_threads')
const mapDataFunctions = require('./stage-table-functions')

const encoder = new TextEncoder()

;(function ({tableName, currentData}) {
    const output = []
    for (const [id, text] of currentData) {
        const stringResult = mapDataFunctions[tableName](id, text)
        if (stringResult.length !== 0) {
            const uint = new Uint8Array(stringResult.length * 3) //optimization for encodeInto()
            const {written: bytesWritten} = encoder.encodeInto(stringResult, uint)
            output.push([bytesWritten, uint])
        }
    }

    let totalLength = 0
    output.forEach(([bytesWritten]) => {
        totalLength += bytesWritten
    })
    const uintResult = new Uint8Array(totalLength)

    let offset = 0
    output.forEach(([bytesWritten, uint]) => {
        uintResult.set(uint.slice(0, bytesWritten), offset)
        offset += bytesWritten
    })

    parentPort.postMessage(uintResult, [uintResult.buffer])
})(workerData)
