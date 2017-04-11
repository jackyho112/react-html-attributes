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
const hardCodedReactHTMLAttributes = {
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
}

const getAttributeList = (jQuery, listTitleSelector) => {
  const titleNode = jQuery(listTitleSelector)
  const attributeListNode = titleNode.nextAll(attributeListParentNodeSelector).first()

  return attributeListNode.text().replace(/\n/g, ' ').split(' ')
}

jsdom.env(
  reactDomElementDocUrl,
  [jQueryScriptUrl],
  (err, window) => {
    bail(err)

    const jQuery = window.$
    const reactSVGAttributes = getAttributeList(
      jQuery, svgAttributeListTitleSelector,
    )
    const reactHtmlAttributesPartial = getAttributeList(
      jQuery, htmlAttributeListTitleSelector,
    )

    const reactHtmlAttributesFull = _.flow([
      _.partialRight(
        _.mapValues,
        attributes => _.intersection(attributes, reactHtmlAttributesPartial),
      ),
      _.partialRight(
        _.mapValues,
        (attributes, tagName) => (
          _.uniq(attributes.concat(hardCodedReactHTMLAttributes[tagName] || []))
        ),
      ),
      _.partialRight(_.set, 'svg', reactSVGAttributes),
      _.partialRight(_.mapValues, _.sortBy),
    ])(HTMLElementAttributes)

    fs.writeFile(
      join(__dirname, 'src', attributeFileName),
      `${JSON.stringify(reactHtmlAttributesFull, 0, 2)}\n`,
      bail,
    )
  },
)
