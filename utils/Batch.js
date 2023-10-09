function Batch(){
    this.count = 0
    this.currentIndex = 0
    this.batchStartIndex = 0

    this.increment = function(){
        ++this.count
    }

    this.reset = function(){
        this.count = 0
    }

    this.incrementCurrentIndex = function(){
        ++this.currentIndex
    }
}

module.exports = {Batch}