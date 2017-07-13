import fp from 'lodash/fp'
import HTMLElementAttributes from 'html-element-attributes/index.json'
import jsdom from 'jsdom'
import bail from 'bail'
import fs from 'fs'
import { join } from 'path'
import svgTags from 'svg-tags'
import htmlTags from 'html-tags'

const htmlAttributeListTitleSelector = 'h2:contains("All Supported HTML Attributes")'
const svgAttributeListTitleSelector = 'h2:contains("All Supported SVG Attributes")'

const reactDomElementDocUrl = 'https://facebook.github.io/react/docs/dom-elements.html'
const jQueryScriptUrl = 'http://code.jquery.com/jquery.js'
const attributeListParentNodeSelector = '.highlight'
const attributeFileName = 'react-html-attributes.json'
const crawledHTMLAttributesFileName = 'crawled-react-html-attributes.test.json'
const crawledSVGAttributesFileName = 'crawled-react-svg-attributes.test.json'
const HTMLElementsFileName = 'crawled-react-html-elements.test.json'
const SVGElementSFileName = 'crawled-react-svg-elements.test.json'

// These are attributes that are not crawled from the above website and copied
// directly from that site.
const reactHtmlAttributesCopied = {
  '*': [
    'dangerouslySetInnerHTML',
    'suppressContentEditableWarning',
    'itemProp',
    'itemScope',
    'itemType',
    'itemRef',
    'itemID',
    'security',
    'unselectable',
    'about',
    'datatype',
    'inlist',
    'prefix',
    'property',
    'resource',
    'typeof',
    'vocab',
  ],
  input: [
    'onChange',
    'defaultValue',
    'defaultChecked',
    'autoCapitalize',
    'autoCorrect',
    'results',
    'autoSave',
  ],
  textarea: [
    'value',
    'onChange',
    'defaultValue',
    'autoCapitalize',
    'autoCorrect',
  ],
  select: [
    'value',
    'onChange',
    'defaultValue',
  ],
  link: [
    'color',
  ],
  svg: [
    'color',
    'height',
    'width',
  ],
}

function getList(jQuery, listTitleSelector) {
  const titleNode = jQuery(listTitleSelector)
  const listNode = titleNode.nextAll(attributeListParentNodeSelector).first()

  return listNode.text().replace(/\n/g, ' ').trim().split(' ')
}

function writeJSONToFile(fileName, object) {
  fs.writeFile(
    join(__dirname, 'src', fileName),
    `${JSON.stringify(object, 0, 2)}\n`,
    bail,
  )
}

jsdom.env(
  reactDomElementDocUrl,
  [jQueryScriptUrl],
  (err, pageWindow) => {
    bail(err)

    const jQuery = pageWindow.$
    const reactSVGAttributesCrawled = getList(
      jQuery, svgAttributeListTitleSelector,
    )
    const reactHtmlAttributesCrawled = getList(
      jQuery, htmlAttributeListTitleSelector,
    )

    const reactHtmlAttributesFull = fp.pipe([
      // Get rid of normal HTML attributes that React doesn't support
      fp.mapValues(attributes => fp.intersection(reactHtmlAttributesCrawled)(attributes)),

      fp.set('svg', reactSVGAttributesCrawled),

      // Add supported attributes copied from the site
      fp.mapValues.convert({ cap: false })((attributes, tagName) => (
        fp.uniq(attributes.concat(reactHtmlAttributesCopied[tagName] || []))
      )),

      // Pull all the included crawled attributes and put the rest labelled
      // as being React specific into the global attributes
      (reactHtmlAttributes) => {
        const reactSpecificAttributes = fp.reduce(
          (result, value) => fp.pullAll(value)(result),
          [].concat(reactHtmlAttributesCrawled),
        )(fp.omit(['svg'])(reactHtmlAttributes))

        return fp.set(
          '*',
          reactHtmlAttributes['*'].concat(reactSpecificAttributes),
        )(reactHtmlAttributes)
      },

      fp.mapValues(fp.sortBy(fp.identity)),
      fp.pickBy(attributes => !fp.isEmpty(attributes)),
    ])(HTMLElementAttributes)

    const reactHtmlAttributesAndTags = fp.pipe([
      fp.set('elements', { html: [], svg: [] }),
      fp.set('elements.html', htmlTags),
      fp.set('elements.svg', svgTags),
    ])(reactHtmlAttributesFull)

    const jsonFilesToWrite = {
      [attributeFileName]: reactHtmlAttributesAndTags,
      [crawledHTMLAttributesFileName]: reactHtmlAttributesCrawled,
      [crawledSVGAttributesFileName]: reactSVGAttributesCrawled,
      [HTMLElementsFileName]: htmlTags,
      [SVGElementSFileName]: svgTags,
    }

    Object.keys(jsonFilesToWrite).forEach((fileName) => {
      writeJSONToFile(fileName, jsonFilesToWrite[fileName])
    })
  },
)
