const {runPipeline} = require('./utils/pipeline')

async function main() {
    console.time('main() exec time')
    await runPipeline()
    console.timeEnd('main() exec time')
    return
}

main()
