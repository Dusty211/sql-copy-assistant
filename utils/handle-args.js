const {resolve} = require('path')
const version = require('../package.json').version
const os = require('os')
const _ = require('lodash')

function getAbsoluteFilePath(path) {
    return resolve(process.cwd(), path)
}

function countCpus() {
    return os.cpus().length
}

function makeVersionMessage(version, cpus) {
    return `string-threads v${version} - Using ${cpus} available CPUs\n`
}

// https://developers.google.com/style/code-syntax
function makeHelpMessageOptions(options) {
    return options
        .map((option) => {
            return option.required
                ? `${option.name} ${option.format || 'VALUE'} `
                : `[${option.name} ${option.format || 'VALUE'}] `
        })
        .join('')
}

function makeHelpMessage(versionMessage, options) {
    const result =
        versionMessage +
        `\n\nUSAGE:\n\n` +
        `stth { ${makeHelpMessageOptions(options)} | --version | --help }\n`
    return result
}

function getOptionValues(args, options, cpus) {
    try {
        const optionValues = {}
        for (const option of options) {
            const optionNameAt = args.findIndex((arg) => arg === option.name)
            if (optionNameAt !== -1) {
                const optionValue = args[optionNameAt + 1]
                if (optionValue) {
                    const camelName = _.camelCase(option.name.slice(2))
                    switch (option.format) {
                        case 'PATH':
                            optionValues[camelName] = getAbsoluteFilePath(optionValue)
                            break
                        case 'INTEGER':
                            optionValues[camelName] = parseInt(optionValue)
                            break
                        default:
                            optionValues[camelName] = optionValue
                    }
                } else {
                    throw new Error(`No value following '${args[optionNameAt]}'`)
                }
            } else {
                if (option.required) {
                    throw new Error(`Missing required argument: '${option.name}'`)
                }
            }
        }
        optionValues.cpus = cpus
        return optionValues
    } catch (error) {
        console.error(
            `\nInvalid arguments. 'args': ${args}. For help, run: 'stth --help'.\nError: ${error}`
        )
        return
    }
}

function handleArgs(argv) {
    const cpus = countCpus()
    const args = argv.slice(2)
    const firstArg = args[0] || '--help'
    const options = [
        {name: '--input-file-path', required: true, format: 'PATH'},
        {name: '--output-directory-path', required: true, format: 'PATH'},
        {name: '--functions-file-path', required: true, format: 'PATH'},
        {name: '--max-lines', required: false, format: 'INTEGER'},
        {name: '--out-batch-size', required: false, format: 'INTEGER'}
    ]

    if (firstArg === '--version') {
        const message = makeVersionMessage(version, cpus)
        process.stdout.write(message)
        return
    }

    if (firstArg === '--help') {
        const versionMessage = makeVersionMessage(version, cpus)
        const message = makeHelpMessage(versionMessage, options)
        process.stdout.write(message)
        return
    }

    const optionValues = getOptionValues(args, options, cpus)
    if (!optionValues) {
        return
    }

    return optionValues

    // Example return value:
    // {
    //     inputFilePath: '/home/someguy/proj-folder/big.ndjson',
    //     outputDirectoryPath: '/home/someguy/bigdrive',
    //     functionsFilePath: '/home/someguy/proj-folder/funcs.js',
    //     maxLines: 100000,
    //     outBatchSize: 5000,
    //     cpus: 16
    // }
}

module.exports = {handleArgs}
