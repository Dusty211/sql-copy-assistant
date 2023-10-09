function Stager(){
    this.tableData = {}
    this.dataMapFunctions = {}

    this.createTable = function(name, dataMapFunction){
            this.tableData[name] = ''
            this.dataMapFunctions[name] = (rowInput, index) => {
                this.tableData[name] += dataMapFunction(rowInput, index)
            }
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