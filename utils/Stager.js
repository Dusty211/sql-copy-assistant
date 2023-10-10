const { appendFile } = require('node:fs/promises')
const path = require('path')

function Stager(outputDir){
    this.outputDir = outputDir
    this.fileTimestamp = Date.now()
    this.tableData = {}
    this.dataMapFunctions = {}

    this.createTable = function(name, dataMapFunction){
        this.tableData[name] = ''
        this.dataMapFunctions[name] = async (rowInput, index) => {
            this.tableData[name] += await dataMapFunction(rowInput, index)
        }
        return this
    }

    this.writeDataFiles = async function(){
        const createFilePath = fileName => path.join(this.outputDir, `${this.fileTimestamp}-${fileName}`)
        const appendDataPromises = Object.keys(this.tableData).map(name => appendFile(createFilePath(name), this.tableData[name]))
        await Promise.all(appendDataPromises)
        this.clearData()
        return this
    }

    this.clearData = function(){
        for(const name of Object.keys(this.tableData)){
            this.tableData[name] = ''
        }
        return this
    }
}

module.exports = {Stager}