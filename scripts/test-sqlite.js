const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const db = new Database(":memory:");
db.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT);");
const stmt = db.prepare("INSERT INTO test (name) VALUES (?)");
stmt.run("Denish Admin");
const row = db.prepare("SELECT * FROM test WHERE id = 1").get();

const hash = bcrypt.hashSync("Admin@123456", 10);
const match = bcrypt.compareSync("Admin@123456", hash);

console.log("SQLITE_TEST_SUCCESS:", row.name, "BCRYPT_MATCH:", match);
