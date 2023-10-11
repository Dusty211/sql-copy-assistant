//The solutions to break this regex into mupliple lines were not worth the tradeoffs.
const SqlSafeTextRegex = 
    /(?<dataNewline>\\\n)|(?<dataCarriageReturn>\\\r)|(?<literalBackslash>\\)|(?<newline>\n)|(?<tab>\t)|(?<carriageReturn>\r)|(?<backspace>[\b])|(?<formFeed>\f)|(?<verticalTab>\v)/g

function SqlSafeTextCb(match, ...args){        
    const groups = args.at(-1) //groups existing at -1 depends on regex containing named groups.

    const needsEscapedBackslash = (
        groups.literalBackslash
    ) ? true : false

    const needsRemoval = (
        groups.backspace
    ) ? true : false

    const needsSpace = (
        groups.dataNewline || 
        groups.dataCarriageReturn || 
        groups.newline || 
        groups.tab || 
        groups.carriageReturn || 
        groups.formFeed || 
        groups.verticalTab
    ) ? true : false

    if(needsEscapedBackslash){
        return '\\\\'
    }
    
    if(needsRemoval){
        return ''
    }

    if(needsSpace){
        return ' '
    }

    //Should never reach here unless someone adds to the regex and does not update the named group conditionals:
    throw new Error(`Unexpected: toSqlSafeText() had an unexpected named group match within replaceCb().`)
}

function toSqlSafeText(string){    
    return typeof string === 'string' && string.length > 0 ? string.replace(SqlSafeTextRegex, SqlSafeTextCb) : ''
}

module.exports = {toSqlSafeText}