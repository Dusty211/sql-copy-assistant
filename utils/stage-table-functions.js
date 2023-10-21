const {convertHtml} = require('./html-to-text')
const {toSqlSafeText} = require('./to-sql-safe-text')
const {checkRequiredValues} = require('./check-required-values')

// Imported by stage-tables.js
// Each of these will write text to an output file that you can use to do a SQL COPY.
// Implementation is up to you.
module.exports = {
    /** 
     * 
     * Example:
     * 
     * <name identifying table>: < () => Fn wich will process 
     * data for each ndjson line for that table>
     *     
     
    tableOne:  (rowInput, index) => {

        const messages = rowInput?.messages || []

        return messages.map(message => {
            checkRequiredValues([
                typeof message.id === 'number',
                typeof message.time === 'number'
            ], index)

            if(typeof message.text === 'string'){
                message.text = convertHtml(message.text)
                message.text = toSqlSafeText(message.text)
            }

            return [
                message.id,
                `${new Date(message.time * 1000).toISOString()}`,
                `${toSqlSafeText(message.text)}` || '\\N',
                index
            ].join('\t')

        }).join('\n') + '\n'
    }
    
    Other functions follow...
    */

    intentionalError: (rowInput, index) => {
        throw new Error(
            'Remove this function and implement your own functions in the pattern of the above example.'
        )
    }
}
