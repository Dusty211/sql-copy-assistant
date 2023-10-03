async function iterateFileLinesCb(line, batchCount) {
    console.log(batchCount.value)
    const parsed = JSON.parse(line)
    console.log('===========>> NEW THREAD:')
    console.log(parsed.posts)
    ++batchCount.value
    return
}

module.exports = {
    iterateFileLinesCb
}