const {convertHtml} = require('./html-to-text')

async function iterateFileLinesCb(line, batchCount) {
    console.log(batchCount.value)
    const parsed = JSON.parse(line)
    console.log('===========>> NEW THREAD:')
    console.log(parsed.posts.map(post => {
        post.text = convertHtml(post.com)
        return post
    }))
    ++batchCount.value
    return
}

module.exports = {
    iterateFileLinesCb
}