var Readable = require('stream').Readable
var fs = require('fs')

var kReady = '_ready'
var kUpdate = '_update'

class LiveReadStream extends Readable {
  constructor (path, opts) {
    opts = opts || {}
    super({ highWaterMark: opts.highWaterMark, encoding: opts.encoding })

    this.fd = null
    this.path = path
    this.options = opts
    this.bytesRead = 0
    this._watcher = null
    this._closed = false
  }

  _open () {
    var self = this
    fs.open(this.path, 'r', this.options.mode || 0o666, function (err, fd) {
      if (err) return self.emit('error', err)
      self.fd = fd
      self.emit('open', self.fd)
      self.emit(kReady)
    })
  }

  // wait for file open and then cb()
  _ready (cb) {
    if (this.fd) cb()
    else {
      this.once(kReady, cb)
      this._open()
    }
  }

  _read (size) {
    var self = this
    if (this._closed) return
    this._ready(function () {
      var buf = Buffer.allocUnsafe(size)
      fs.read(self.fd, buf, 0, size, self.bytesRead, function (err, bytesRead) {
        if (err) {
          self.emit('error', err)
          return
        }

        if (bytesRead === 0) { // at end of file
          self._wait(self._read.bind(self, size))
          return
        }

        self.bytesRead += bytesRead
        if (bytesRead < size) {
          buf = buf.slice(0, bytesRead) // only push the part that was filled
        }
        self.push(buf)
      })
    })
  }

  // wait for update to the file, then cb()
  _wait (cb) {
    var self = this
    this._watcher = this._watcher || fs.watch(self.path, function () {
      self.emit(kUpdate)
    })

    self.once(kUpdate, cb)
  }

  _destroy (err, cb) {
    this._closed = true
    if (err) return this.emit('error', err)
    if (this._watcher) this._watcher.close()
    if (this.fd) fs.close(this.fd, cb)
    else cb()
  }

  // public api: close file & stop streaming updates
  close () {
    var self = this
    this._destroy(null, function () {
      self.push(null)
    })
  }
}

module.exports = function createReadStream (path, opts) {
  return new LiveReadStream(path, opts)
}
module.exports.ReadStream = LiveReadStream
