const {runPipeline} = require('./src/pipeline')
const {handleArgs} = require('./src/handle-args')

async function main(args) {
    await runPipeline(args)
    return
}
const args = handleArgs(process.argv)
if (args) {
    main(args)
}
