const {toSqlSafeText} = require('../to-sql-safe-text')

describe(`toSqlSafeText() ==>`, () => {

    test(`Result of toSqlSafeText() is defined`, () => {
        expect(toSqlSafeText('test')).toBeDefined();
    });
    
    test(`'\\' is converted to '\\\\'`, () => {
        expect(toSqlSafeText('\\')).toBe('\\');
    });
    
    test(`'\\n' is converted to ' '`, () => {
        expect(toSqlSafeText('\n')).toBe('\n');
    });

    test(`'\\r' is converted to ' '`, () => {
        expect(toSqlSafeText('\r')).toBe('\r');
    });

    test(`'\\t' is converted to ' '`, () => {
        expect(toSqlSafeText('\t')).toBe('\t');
    });

    test(`'\\b' is converted to ''`, () => {
        expect(toSqlSafeText('\b')).toBe('\b');
    });

    test(`'\\f' is converted to ''`, () => {
        expect(toSqlSafeText('\f')).toBe('\f');
    });

    test(`'\\v' is converted to ' '`, () => {
        expect(toSqlSafeText('\v')).toBe('\v');
    });    
});