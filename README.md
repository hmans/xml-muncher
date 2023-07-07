# xml-muncher

`xml-muncher` processes potentially humongous XML documents and extracts the elements you're interested in without blowing up your memory usage. It builds on top of `node-expat` and provides a simple API to retrieve just the data you're interested in.

## Basic Usage

```js
import { XMLMuncher } from "xml-muncher";

const muncher = new XMLMuncher();

muncher.on("path://items/item", (item) => {
  console.log(item.title);
});

await muncher.munchFile("very_large_file.xml");
```

## TODO

- [ ] Flesh out documentation
- [ ] Allow the munching to be paused and resumed
- [ ] Provide an async iterator that yields extracted items

## License

```
Copyright (c) 2023 Hendrik Mans

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
