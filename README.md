# react-html-attributes

A store of html attributes keyed by their respective tags. Global attributes
are under `'*'`.

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
