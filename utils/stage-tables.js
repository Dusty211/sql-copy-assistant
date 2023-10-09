const {Stager} = require('./Stager')
const {outputDir} = require('../paths.json')
const tableFunctions = require('./stage-table-functions')

const stager = new Stager(outputDir)

for (const [tableName, dataProcessingFn] of Object.entries(tableFunctions)) {
    stager.createTable(tableName, dataProcessingFn)
}

module.exports = {
    stager
}