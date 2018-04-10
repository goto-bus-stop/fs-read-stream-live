# fs-read-stream-live

`fs.createReadStream` but it waits for new writes instead of ending

When it reaches the end of the file, it kicks off an `fs.watch`er and starts reading again where it left off when it updates.
This works for appending data. Note that it does _not_ work if data is removed from the file. Use this for logs and the like!

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/fs-read-stream-live.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/fs-read-stream-live
[travis-image]: https://img.shields.io/travis/goto-bus-stop/fs-read-stream-live.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/fs-read-stream-live
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install fs-read-stream-live
```

## Usage

```js
var createLiveReadStream = require('fs-read-stream-live')

createLiveReadStream('./chat.txt').pipe(process.stdout)

setInterval(function () {
  fs.appendFile('./chat.txt', 'hello world', function(){})
}, 500)
```

## API

### `s = createLiveReadStream(path, opts={})`

Create a `ReadStream` for the file at `path`. First it streams the full file contents,
then it starts watching for changes and streaming appended content.

 - `opts.encoding` - when set, convert read bytes to strings using this encoding; else stream Buffers.

### `s.close()`

Close the file and stop watching for changes. You have to do this manually, else the stream will never end.

### `s.path`

The file path; value of the `path` argument to `createLiveReadStream`.

### `s.bytesRead`

Number of bytes that have been streamed so far.

## License

[Apache-2.0](LICENSE.md)
