const {stager} = require('./stage-tables')

async function iterateFileLinesCb(line, dbIndex) {
    const parsed = JSON.parse(line)
    const mapAllTableData = Object.keys(
        stager.dataMapFunctions
    ).map(table => stager.dataMapFunctions[table](parsed, dbIndex))
    await Promise.all(mapAllTableData)
    return async () => await stager.writeDataFiles()
}

module.exports = {
    iterateFileLinesCb
}