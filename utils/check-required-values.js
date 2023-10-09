function checkRequiredValues(validations, index){
    validations.forEach(valid => {
        if(!valid){
            throw new Error(`createTable(): Required value(s) not found. Index: ${index} Validations: ${validations}`)
        }
    })
}

module.exports = {
    checkRequiredValues
}