function updateTty(string) {
    if (process.stdout.isTTY) {
        process.stdout.moveCursor(0, -1)
        process.stdout.cursorTo(0)
        process.stdout.write(string)
        process.stdout.moveCursor(0, 1)
        process.stdout.cursorTo(0)
    }
}

module.exports = {updateTty}
