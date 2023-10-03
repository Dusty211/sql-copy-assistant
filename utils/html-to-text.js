const {compile} = require('html-to-text');

const compiledConvert = compile({
    wordwrap: false,
    selectors: [
        { selector: 'br', format: 'skip' },
        { selector: 'a', format: 'skip' }
      ]
})

function convertHtml(html) {
    return compiledConvert(html)
}

module.exports = {
    convertHtml
}