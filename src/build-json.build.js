import _ from 'lodash'
import HTMLElementAttributes from 'html-element-attributes/index.json'
import jsdom from 'jsdom'
import bail from 'bail'
import fs from 'fs'
import { join } from 'path'

const htmlAttributeListTitleSelector = 'h3:contains("HTML Attributes")'
const svgAttributeListTitleSelector = 'h3:contains("SVG Attributes")'
const htmlElementTagListTitleSelector = 'h4:contains("HTML Elements")'
const svgElementTagListTitleSelector = 'h4:contains("SVG elements")'

const reactDomElementDocUrl = 'http://reactjs.cn/react/docs/tags-and-attributes.html'
const jQueryScriptUrl = 'http://code.jquery.com/jquery.js'
const attributeListParentNodeSelector = '.highlight'
const attributeFileName = 'react-html-attributes.json'
const crawledHTMLAttributesFileName = 'crawled-react-html-attributes.test.json'
const crawledSVGAttributesFileName = 'crawled-react-svg-attributes.test.json'
const crawledHTMLElementsFileName = 'crawled-react-html-elements.test.json'
const crawledSVGElementSFileName = 'crawled-react-svg-elements.test.json'

// attributes that cannot be crawled on the above website, copied from it
// also added some attributes missing from the above website but present on
// https://facebook.github.io/react/docs/dom-elements.html
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

const getList = (jQuery, listTitleSelector) => {
  const titleNode = jQuery(listTitleSelector)
  const listNode = titleNode.nextAll(attributeListParentNodeSelector).first()

  return listNode.text().replace(/\n/g, ' ').trim().split(' ')
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
    const reactHtmlElementTagsCrawled = getList(
      jQuery, htmlElementTagListTitleSelector,
    )
    const reactSvgElementTagsCrawled = getList(
      jQuery, svgElementTagListTitleSelector,
    )

    // the main constructor function for the attribute part of the json
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
      (reactHtmlAttributes) => {
        const reactSpecificAttributes = _.reduce(
          _.omit(reactHtmlAttributes, ['svg']),
          (result, value) => _.pull(result, ...value),
          [].concat(reactHtmlAttributesCrawled),
        )

        return _.set(
          reactHtmlAttributes,
          '*',
          reactHtmlAttributes['*'].concat(reactSpecificAttributes),
        )
      },
      _.partialRight(_.mapValues, _.sortBy),
      _.partialRight(_.pickBy, attributes => !_.isEmpty(attributes)),
    ])(HTMLElementAttributes)

    // the main contructor for the tag list
    const reactHtmlAttributesAndTags = _.flow([
      _.partialRight(_.set, 'elements', { html: [], svg: [] }),
      _.partialRight(_.set, 'elements.html', reactHtmlElementTagsCrawled),
      _.partialRight(_.set, 'elements.svg', reactSvgElementTagsCrawled),
    ])(reactHtmlAttributesFull)

    fs.writeFile(
      join(__dirname, 'src', attributeFileName),
      `${JSON.stringify(reactHtmlAttributesAndTags, 0, 2)}\n`,
      bail,
    )

    fs.writeFile(
      join(__dirname, 'src', crawledHTMLAttributesFileName),
      `${JSON.stringify(reactHtmlAttributesCrawled, 0, 2)}\n`,
      bail,
    )

    fs.writeFile(
      join(__dirname, 'src', crawledSVGAttributesFileName),
      `${JSON.stringify(reactSVGAttributesCrawled, 0, 2)}\n`,
      bail,
    )

    fs.writeFile(
      join(__dirname, 'src', crawledHTMLElementsFileName),
      `${JSON.stringify(reactHtmlElementTagsCrawled, 0, 2)}\n`,
      bail,
    )

    fs.writeFile(
      join(__dirname, 'src', crawledSVGElementSFileName),
      `${JSON.stringify(reactSvgElementTagsCrawled, 0, 2)}\n`,
      bail,
    )
  },
)
