const {parentPort, workerData} = require('worker_threads')

;(function (functionsFilePath) {
    const fileFunctions = require(functionsFilePath)
    parentPort.on('message', ({index, string}) => {
        const newlineObject = JSON.parse(string)
        const result = {}
        for (const [fileName, fileFunction] of Object.entries(fileFunctions)) {
            result[fileName] = fileFunction(index, newlineObject)
        }
        parentPort.postMessage(result)
    })
})(workerData)
