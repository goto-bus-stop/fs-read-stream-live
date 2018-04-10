var test = require('tape')
var fs = require('fs')
// var concat = require('concat-stream')
var createLiveStream = require('../')

try { fs.mkdirSync('tmp') } catch (e) {}

test('read file', function (t) {
  t.plan(2)

  fs.writeFileSync('tmp/file.txt', 'abcdefghi')
  var s = createLiveStream('tmp/file.txt')
    .on('data', function (chunk) { t.equal(chunk.toString(), 'abcdefghi'); s.close() })
    .on('end', function () { t.pass('it ended') })
    .on('error', t.error)
})

test('receive updates', function (t) {
  t.plan(3)

  var contents = [
    'abcdefghi',
    'jklmnopqr'
  ]
  var expected = contents.slice()

  fs.writeFileSync('tmp/file.txt', contents[0])
  var s = createLiveStream('tmp/file.txt', { encoding: 'utf8' })
    .on('data', function (chunk) {
      t.equal(chunk, expected.shift())
      next()
    })
    .on('end', function () { t.pass('it ended') })
    .on('error', t.error)

  function next () {
    if (expected.length === 0) return s.close()
    setTimeout(function () {
      fs.appendFile('tmp/file.txt', contents[1], function () {})
    }, 20)
  }
})
