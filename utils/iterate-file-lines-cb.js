const {convertHtml} = require('./html-to-text')
const {toSqlSafeText} = require('./to-sql-safe-text')

async function iterateFileLinesCb(line, batchCount) {
    console.log(batchCount.value)
    const parsed = JSON.parse(line)
    console.log('===========>> NEW THREAD:')
    console.log(parsed.posts.map(post => {
        const text = convertHtml(post.com)
        post.com = toSqlSafeText(text)
        return post
    }))
    ++batchCount.value
    return
}

module.exports = {
    iterateFileLinesCb
}