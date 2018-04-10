var readStreamLive = require('./')
var fs = require('fs')
try { fs.accessSync('./chat.txt') } catch (err) { fs.writeFileSync('./chat.txt', 'initial text\n') }

readStreamLive('./chat.txt').pipe(process.stdout)

setInterval(function () {
  fs.appendFile('./chat.txt', 'hello world\n', function () {})
}, 500)
