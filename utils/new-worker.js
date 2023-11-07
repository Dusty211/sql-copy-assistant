const {parentPort} = require('worker_threads')
const fileFunctions = require('./file-functions')

;(function () {

    parentPort.on('message', ({index, string}) => {
        const newlineObject = JSON.parse(string)
        const result = {}
        for (const [fileName, fileFunction] of Object.entries(fileFunctions)) {
            result[fileName] = fileFunction(index, newlineObject)
        }
        parentPort.postMessage(result)
    })
})()
