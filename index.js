const {runPipeline} = require('./utils/pipeline')
const {handleArgs} = require('./utils/handle-args')

async function main(args) {
    await runPipeline(args)
    return
}

console.time('\nCompleted:')
const args = handleArgs(process.argv)
if(args){
    main(args)
}
console.timeEnd('\nCompleted:')