const {toSqlSafeText} = require('../to-sql-safe-text')

describe(`toSqlSafeText() ==>`, () => {

    test(`Result of toSqlSafeText() is defined`, () => {
        expect(toSqlSafeText('test')).toBeDefined();
    });

    //Literal '\' character is escaped    
    test(`'\\' is converted to '\\\\'`, () => {
        expect(toSqlSafeText('\\')).toBe('\\\\');
    });
    
    //Newline converted
    test(`'\\n' is converted to ' '`, () => {
        expect(toSqlSafeText('\n')).toBe(' ');
    });

    //Carriage return converted
    test(`'\\r' is converted to ' '`, () => {
        expect(toSqlSafeText('\r')).toBe(' ');
    });

    //Tab converted
    test(`'\\t' is converted to ' '`, () => {
        expect(toSqlSafeText('\t')).toBe(' ');
    });

    //Backspace converted
    test(`'\\b' is converted to ''`, () => {
        expect(toSqlSafeText('\b')).toBe('');
    });

    //Form feed converted
    test(`'\\f' is converted to ' '`, () => {
        expect(toSqlSafeText('\f')).toBe(' ');
    });

    //Vertical tab converted
    test(`'\\v' is converted to ' '`, () => {
        expect(toSqlSafeText('\v')).toBe(' ');
    });    
});