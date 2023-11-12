class PoolFiller {
    constructor(workerPoolInstance) {
        this.linesIn = 0
        this.linesOut = 0
        this.pool = workerPoolInstance
        this.messages = []
        this.pool.on('messageFromPool', (values) => {
            this.messages = this.messages.concat(values)
        })
    }

    #waitForPool() {
        return new Promise((resolve, reject) => {
            try {
                if (this.pool.taskQueueFull) {
                    this.pool.once('taskQueueDrained', () => {
                        resolve()
                    })
                } else {
                    resolve()
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    async fill(obj) {
        await this.#waitForPool()
        this.pool.runTask(obj)
        this.linesIn++
    }

    getMessages() {
        const messages = [...this.messages.splice(0, this.messages.length)]
        this.linesOut += messages.length
        return messages
    }

    async finish() {
        await this.pool.close()
        return this.getMessages()
    }
}

module.exports = {PoolFiller}
