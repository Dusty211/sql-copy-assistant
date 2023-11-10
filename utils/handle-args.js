const {resolve} = require('path')
const version = require('../package.json').version
const os = require('os')
const _ = require('lodash')

const defaultOptionValues = {
    maxLines: Infinity,
    outBatchSize: 5000,
    inputFormat: 'text'
}

function throwErrorOnMissingValue(args, optionNameAt) {
    const argumentInPlaceOfValue =
        typeof args[optionNameAt + 1] === 'string' && args[optionNameAt + 1].slice(0, 2) === '--'
    const argumentMissingValue = !args[optionNameAt + 1]
    if (argumentInPlaceOfValue || argumentMissingValue) {
        throw new Error(
            `The ${args[optionNameAt]} argument exists without being followed by a required value.`
        )
    }
    return args[optionNameAt + 1]
}

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
        const optionValues = {...defaultOptionValues}
        for (const option of options) {
            const optionNameAt = args.findIndex((arg) => arg === option.name)
            if (optionNameAt !== -1) {
                const optionValue =
                    option.format === 'BOOLEAN'
                        ? true
                        : throwErrorOnMissingValue(args, optionNameAt)
                const camelName = _.camelCase(option.name.slice(2))
                switch (option.format) {
                    case 'BOOLEAN':
                        optionValues[camelName] = optionValue //set to true above
                        break
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
                if (option.required) {
                    throw new Error(`Missing required argument: '${option.name}'`)
                }
            }
        }
        optionValues.cpus = cpus
        return optionValues
    } catch (error) {
        console.error(
            `\nInvalid arguments. 'args': ${args.join(
                ' '
            )}. For help, run: 'stth --help'.\n\nError: ${error}`
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
        {name: '--out-batch-size', required: false, format: 'INTEGER'},
        {name: '--input-format', required: false, format: 'TEXT'}
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
    //     outputDirectoryPath: '/home/someone/symlink-to-bigdrive',
    //     functionsFilePath: '/home/someone/proj-folder/funcs.js',
    //     maxLines: 100000,
    //     outBatchSize: 5000,
    //     cpus: 16,
    //     inputFormat: 'json'
    // }
}

module.exports = {handleArgs}
