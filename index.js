const {iterateFileLines} = require('./utils/iterate-file-lines')
const {iterateFileLinesCb} = require('./utils/iterate-file-lines-cb')

async function main(){
    console.time('main() exec time')
    await iterateFileLines(iterateFileLinesCb, null, 5000)
    console.timeEnd('main() exec time')
    return
}

main()