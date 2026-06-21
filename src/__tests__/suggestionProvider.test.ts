import { getSuggestions } from '@/utils/suggestionProvider'

describe('getSuggestions', () => {
  it('filters field suggestions by partial match', () => {
    expect(getSuggestions('FIELD', 'pro')).toEqual(['project'])
  })

  it('filters operators for the current field', () => {
    expect(getSuggestions('OPERATOR', 'i', 'project')).toEqual(['IN'])
  })

  it('returns no suggestions for values in the MVP', () => {
    expect(getSuggestions('VALUE', 'act', 'status')).toEqual([])
  })
})
