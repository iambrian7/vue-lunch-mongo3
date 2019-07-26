const http = require('http');
const app = require('./app');

console.log("nodemon.json (in working directory has config files")
console.log("PORT = "+ process.env.TEST_PORT)
console.log("DB_USED = "+ process.env.DB_USED)
console.log("TESTCODE = "+ process.env.TESTCODE)
const port = process.env.PORT || process.env.TEST_PORT //3029;

const server = http.createServer(app);
server.listen(port, () => console.log(`Listening on port ${port}`));