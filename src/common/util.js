const sqlite3 = require('sqlite3').verbose()
const {open} = require('sqlite')
exports.createDBConnection = () => {
    return open({
        filename: "./db/tito.sqlite3",
        driver: sqlite3.Database
    })
}
