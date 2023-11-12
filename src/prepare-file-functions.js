const {convertHtml} = require('./helpers/html-to-text')
const {toSqlSafeText} = require('./helpers/to-sql-safe-text')
const {checkRequiredValues} = require('./helpers/check-required-values')

function prepareFileFunctions(functionsFilePath) {
    const fileFunctions = require(functionsFilePath)
    const enhancements = {
        convertHtml,
        toSqlSafeText,
        checkRequiredValues
    }

    const preparedFunctions = {}
    for (const [fileName, fileFunction] of Object.entries(fileFunctions)) {
        const isAsync = fileFunction.constructor.name === 'AsyncFunction'
        const enhanced = isAsync
            ? async (index, rowInput) => {
                  return await fileFunction(index, rowInput, enhancements)
              }
            : (index, rowInput) => {
                  return fileFunction(index, rowInput, enhancements)
              }
        preparedFunctions[fileName] = enhanced
    }
    return preparedFunctions
}

module.exports = {prepareFileFunctions}
