[![Build Status][build-badge]][build-page]
[![version][version-badge]][package]

# react-html-attributes

A store of html attributes keyed by their respective tags. Global attributes
are under `'*'`. HTML tags that don't have any React-supported non-global
attributes won't have keys in the store.

Reference: https://facebook.github.io/react/docs/dom-elements.html

## Installation

npm:

```bash
npm install react-html-attributes
```

## Usage

```javascript
var htmlElementAttributes = require('html-element-attributes');
```

```javascript
htmlElementAttributes['*'];
```

Returns:

```javascript
[
  "className",
  "dangerouslySetInnerHTML",
  "dir",
  "draggable",
  "hidden",
  "htmlFor",
  "id",
  "is",
  "itemID",
  "itemProp",
  "itemRef",
  "itemScope",
  "itemType",
  "lang",
  "style",
  "suppressContentEditableWarning",
  "title"
]
```

## License

[MIT][license] © Jacky Ho

<!-- Definition -->
[license]: LICENSE
[build-page]: https://travis-ci.org/wooorm/html-element-attributes
[build-badge]: https://img.shields.io/travis/jackyho112/react-html-attributes.svg
[version-badge]: https://img.shields.io/npm/v/react-html-attributes.svg?style=flat-square
[package]: https://www.npmjs.com/package/react-html-attributes
