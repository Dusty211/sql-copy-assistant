//This code came from an example snippet here: https://nodejs.org/api/async_context.html#class-asyncresource
// With the following additions:
//     - 'taskQueueDrained' event functionality added
//     - [allWorkersFree] event functionality added
//     - change this.close() to async
//     - add options object to this.close(options) with options.force <boolean>
//     - When awaiting this.close(), await #allWorkersFree event unless options.force === true
//     - Add [...transferList] functionality.
//     - Add 'messageFromPool' event.

const {AsyncResource} = require('node:async_hooks')
const {EventEmitter} = require('node:events')
const {Worker} = require('node:worker_threads')
const kTaskInfo = Symbol('kTaskInfo')
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent')
const allWorkersFree = Symbol('allWorkersFree')

class WorkerPoolTaskInfo extends AsyncResource {
    constructor(callback) {
        super('WorkerPoolTaskInfo')
        this.callback = callback
    }

    done(err, result) {
        this.runInAsyncScope(this.callback ? this.callback : () => {}, null, err, result)
        this.emitDestroy() // `TaskInfo`s are used only once.
    }
}

class WorkerPool extends EventEmitter {
    constructor(numThreads, filePath, functionsFilePath) {
        super()
        this.filePath = filePath
        this.functionsFilePath = functionsFilePath
        this.numThreads = numThreads
        this.workers = []
        this.freeWorkers = []
        this.taskQueue = []

        //Only set this when constructor runs:
        this.taskQueueLimit = (() => {
            switch(this.numThreads) {
                case 1:
                    return 1
                case 2:
                    return 1
                case 3:
                    return 2
                default:
                    return Math.floor(Math.sqrt(this.numThreads))
            }
        })()

        for (let i = 0; i < numThreads; i++) this.addNewWorker()

        // Any time the kWorkerFreedEvent is emitted, dispatch
        // the next task pending in the queue, if any.
        this.on(kWorkerFreedEvent, () => {
            if (this.taskQueue.length > 0) {
                const {task, transferList, callback} = this.taskQueue.shift()
                if (this.taskQueue.length === 0) this.emit('taskQueueDrained')
                this.runTask(task, transferList, callback)
            }
            if (this.freeWorkers.length === this.numThreads) {
                this.emit(allWorkersFree)
            }
        })
    }

    get taskQueueFull() {
        return this.taskQueue.length >= this.taskQueueLimit
    }

    #allWorkersFree() {
        return new Promise((resolve, reject) => {
            try {
                this.on(allWorkersFree, () => resolve())
            } catch (error) {
                reject(error)
            }
        })
    }

    addNewWorker() {
        const worker = new Worker(this.filePath, {workerData: this.functionsFilePath})
        worker.on('message', (result) => {
            // In case of success: Call the callback that was passed to `runTask`,
            // remove the `TaskInfo` associated with the Worker, and mark it as free
            // again.
            this.emit('messageFromPool', result)
            worker[kTaskInfo].done(null, result)
            worker[kTaskInfo] = null
            this.freeWorkers.push(worker)
            this.emit(kWorkerFreedEvent)
        })
        worker.on('error', (err) => {
            // In case of an uncaught exception: Call the callback that was passed to
            // `runTask` with the error.
            if (worker[kTaskInfo]) worker[kTaskInfo].done(err, null)
            else this.emit('error', err)
            // Remove the worker from the list and start a new Worker to replace the
            // current one.
            this.workers.splice(this.workers.indexOf(worker), 1)
            this.addNewWorker()
        })
        this.workers.push(worker)
        this.freeWorkers.push(worker)
        this.emit(kWorkerFreedEvent)
    }

    runTask(task, transferList = [], callback) {
        if (this.freeWorkers.length === 0) {
            // No free threads, wait until a worker thread becomes free.
            this.taskQueue.push({task, transferList, callback})
            return
        }

        const worker = this.freeWorkers.pop()
        worker[kTaskInfo] = new WorkerPoolTaskInfo(callback)
        worker.postMessage(task, transferList)
    }

    async close(options = {}) {
        if (!options.force && !(this.freeWorkers.length === this.numThreads)) {
            await this.#allWorkersFree()
        }
        for (const worker of this.workers) worker.terminate()
    }
}

module.exports = {WorkerPool}
