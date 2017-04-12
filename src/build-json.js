import _ from 'lodash'
import HTMLElementAttributes from 'html-element-attributes/index.json'
import jsdom from 'jsdom'
import bail from 'bail'
import fs from 'fs'
import { join } from 'path'

const htmlAttributeListTitleSelector = 'h2:contains("All Supported HTML Attributes")'
const svgAttributeListTitleSelector = 'h2:contains("All Supported SVG Attributes")'
const reactDomElementDocUrl = 'https://facebook.github.io/react/docs/dom-elements.html'
const jQueryScriptUrl = 'http://code.jquery.com/jquery.js'
const attributeListParentNodeSelector = '.highlight'
const attributeFileName = 'react-html-attributes.json'

// attributes that cannot be crawled on the above website, copied from that site
const reactHtmlAttributesCopied = {
  '*': [
    'className',
    'dangerouslySetInnerHTML',
    'htmlFor',
    'style',
    'suppressContentEditableWarning',
    'itemProp',
    'itemScope',
    'itemType',
    'itemRef',
    'itemID',
  ],
  input: [
    'checked',
    'value',
    'onChange',
    'defaultValue',
    'defaultChecked',
    'autoCapitalize',
    'autoCorrect',
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
  option: [
    'selected',
    'value',
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

const getAttributeList = (jQuery, listTitleSelector) => {
  const titleNode = jQuery(listTitleSelector)
  const attributeListNode = titleNode.nextAll(attributeListParentNodeSelector).first()

  return attributeListNode.text().replace(/\n/g, ' ').split(' ')
}

jsdom.env(
  reactDomElementDocUrl,
  [jQueryScriptUrl],
  (err, pageWindow) => {
    bail(err)

    const jQuery = pageWindow.$
    const reactSVGAttributesCrawled = getAttributeList(
      jQuery, svgAttributeListTitleSelector,
    )
    const reactHtmlAttributesCrawled = getAttributeList(
      jQuery, htmlAttributeListTitleSelector,
    )

    // constru
    const reactHtmlAttributesFull = _.flow([
      _.partialRight(
        _.mapValues,
        attributes => _.intersection(attributes, reactHtmlAttributesCrawled),
      ),
      _.partialRight(_.set, 'svg', reactSVGAttributesCrawled),
      _.partialRight(
        _.mapValues,
        (attributes, tagName) => (
          _.uniq(attributes.concat(reactHtmlAttributesCopied[tagName] || []))
        ),
      ),
      _.partialRight(_.mapValues, _.sortBy),
      _.partialRight(_.pickBy, attributes => !_.isEmpty(attributes)),
    ])(HTMLElementAttributes)

    fs.writeFile(
      join(__dirname, 'src', attributeFileName),
      `${JSON.stringify(reactHtmlAttributesFull, 0, 2)}\n`,
      bail,
    )
  },
)
