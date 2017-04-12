/* global
  describe, it
*/

import { expect } from 'chai'
import _ from 'lodash'
import reactHtmlAttributes from './react-html-attributes.json'

function isArrayOfStrings(array) {
  return array.every(item => typeof item === 'string')
}

function areArraysUnique(array) {
  return array.every(items => items.length === _.uniq(items).length)
}

function areArraysApatheticallySorted(array) {
  return array.every(items => /^[a-z-]+$/.test(...items.map(item => item[0])))
}

function areArraysNotEmpty(array) {
  return array.every(items => items.length !== 0)
}

describe('react-html-attributes', () => {
  const attributeLists = _.values(reactHtmlAttributes)

  it('should have a store of all string attributes', () => {
    expect(_.flatten(attributeLists)).to.satisfy(isArrayOfStrings)
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
})
