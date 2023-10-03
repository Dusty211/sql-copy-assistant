const {iterateFileLines} = require('./utils/iterate-file-lines')

async function main(){
    console.time('main() exec time')
    await iterateFileLines(4, line => {
        const parsed = JSON.parse(line)
        console.log('===========>> NEW THREAD:')
        // console.log(parsed.posts.map(post => post.entities))
        console.log(parsed.posts)
        return
    })
    console.timeEnd('main() exec time')
}

main()