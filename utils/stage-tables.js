const {OutputHelper} = require('./OutputHelper')
const {outputDir} = require('../paths.json')

const outputHelper = new OutputHelper(outputDir)

module.exports = {
    outputHelper
}