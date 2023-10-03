const {toSqlSafeText} = require('../to-sql-safe-text')

describe('toSqlSafeText() ==>', () => {

    test('Result of toSqlSafeText() is defined', () => {
        expect(toSqlSafeText('test')).toBeDefined();
    });    
});