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

describe('react-html-attributes', () => {
  const attributeLists = _.values(reactHtmlAttributes)

  it('should have a list of all available names', () => {
    expect(_.flatten(attributeLists)).to.satisfy(isArrayOfStrings)
  })

  it('should have a list of all unique names', () => {
    expect(attributeLists).to.satisfy(areArraysUnique)
  })

  it('should have a list of apathetically sorted names', () => {
    expect(attributeLists).to.satisfy(areArraysApatheticallySorted)
  })
})
