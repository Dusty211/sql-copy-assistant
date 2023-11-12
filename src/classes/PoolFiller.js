class PoolFiller {
    constructor(workerPoolInstance) {
        this.tasksSent = 0
        this.tasksComplete = 0
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
        this.tasksSent++
    }

    getMessages() {
        const messages = [...this.messages.splice(0, this.messages.length)]
        this.tasksComplete += messages.length
        return messages
    }

    async finish() {
        await this.pool.close()
        return this.getMessages()
    }
}

module.exports = {PoolFiller}
