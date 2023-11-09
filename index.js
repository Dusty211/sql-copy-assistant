const {runPipeline} = require('./utils/pipeline')
const {handleArgs} = require('./utils/handle-args')

async function main(args) {
    await runPipeline(args)
    return
}
const args = handleArgs(process.argv)
if (args) {
    main(args)
}
