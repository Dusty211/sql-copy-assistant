const {parentPort} = require('worker_threads')
const tableFunctions = require('./stage-table-functions')

;(function () {

    parentPort.on('message', ({index, string}) => {
        const newlineObject = JSON.parse(string)
        const result = {}
        for (const [tableName, tableFunction] of Object.entries(tableFunctions)) {
            result[tableName] = tableFunction(index, newlineObject)
        }
        parentPort.postMessage(result)
    })
})()
