const {iterateFileLines} = require('./utils/iterate-file-lines')

async function main(){
    console.time('main() exec time')
    await iterateFileLines(null, 5000)
    console.timeEnd('main() exec time')
    return
}

main()