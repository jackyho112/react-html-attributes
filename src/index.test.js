/* global
  describe, it
*/

import { expect } from 'chai'
import _ from 'lodash'
import reactHtmlAttributes from './react-html-attributes.json'
import crawledReactHtmlAttributes from './crawled-react-html-attributes.test.json'
import crawledReactSVGAttributes from './crawled-react-svg-attributes.test.json'

function isArrayOfStrings(array) {
  return array.every(item => typeof item === 'string')
}

function isArrayOfNonEmptyStrings(array) {
  return array.every(item => item !== '')
}

function isArrayOfTrimmedStrings(array) {
  return array.every(item => item === item.trim())
}

function areArraysUnique(array) {
  return array.every(items => items.length === _.uniq(items).length)
}

function areArraysApatheticallySorted(array) {
  return array.every(items => items.join(' ') === _.sortBy(items).join(' '))
}

function areArraysNotEmpty(array) {
  return array.every(items => items.length !== 0)
}

function isArrayIncluded(array, arrayToVerify) {
  return _.includes(array, ...arrayToVerify)
}

describe('react-html-attributes', () => {
  const attributeLists = _.values(reactHtmlAttributes)

  it('should have a store of all string attributes', () => {
    expect(_.flatten(attributeLists)).to.satisfy(isArrayOfStrings)
  })

  it('should have a store of non-empty-string attributes', () => {
    expect(_.flatten(attributeLists)).to.satisfy(isArrayOfNonEmptyStrings)
  })

  it('should have a store of attributes with no trailing spaces', () => {
    expect(_.flatten(attributeLists)).to.satisfy(isArrayOfTrimmedStrings)
  })

  it('should have a store of all unique attributes', () => {
    expect(attributeLists).to.satisfy(areArraysUnique)
  })

  it('should have a store of apathetically sorted attributes', () => {
    expect(attributeLists).to.satisfy(areArraysApatheticallySorted)
  })

  it('should have a store of non-empty attributes', () => {
    expect(attributeLists).to.satisfy(areArraysNotEmpty)
  })

  it('should include all crawled html attributes supported by react', () => {
    expect(
      isArrayIncluded(_.flatten(attributeLists), crawledReactHtmlAttributes),
    ).to.equal(true)
  })

  it('should include all crawled SVG attributes supported by react', () => {
    expect(
      isArrayIncluded(_.flatten(attributeLists), crawledReactSVGAttributes),
    ).to.equal(true)
  })
})
