const {iterateFileLines} = require('./utils/iterate-file-lines')
const {iterateFileLinesCb} = require('./utils/iterate-file-lines-cb')

async function main(){
    console.time('main() exec time')
    await iterateFileLines(4, iterateFileLinesCb)
    console.timeEnd('main() exec time')
}

main()