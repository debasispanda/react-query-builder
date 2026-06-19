import type { Token, TokenType } from '@/types/jql'

const TOKEN_PATTERN = /"[^"]*"|[^\s]+/g
const CONNECTORS = new Set(['AND', 'OR', 'NOT'])

type ExpectedTokenType = 'FIELD' | 'OPERATOR' | 'VALUE' | 'AFTER_VALUE'

function normalizeTokenValue(rawToken: string): string {
  if (rawToken.startsWith('"') && rawToken.endsWith('"')) {
    return rawToken.slice(1, -1)
  }

  return rawToken
}

function getTokenType(rawToken: string, expected: ExpectedTokenType): TokenType {
  if (expected === 'AFTER_VALUE') {
    return CONNECTORS.has(rawToken.toUpperCase()) ? 'CONNECTOR' : 'UNKNOWN'
  }

  return expected
}

export function tokenize(input: string): Token[] {
  const rawTokens = input.match(TOKEN_PATTERN) ?? []
  const tokens: Token[] = []
  let expected: ExpectedTokenType = 'FIELD'

  for (const rawToken of rawTokens) {
    const type = getTokenType(rawToken, expected)

    tokens.push({
      value: normalizeTokenValue(rawToken),
      type,
    })

    if (type === 'FIELD') {
      expected = 'OPERATOR'
      continue
    }

    if (type === 'OPERATOR') {
      expected = 'VALUE'
      continue
    }

    if (type === 'VALUE') {
      expected = 'AFTER_VALUE'
      continue
    }

    if (type === 'CONNECTOR') {
      expected = 'FIELD'
    }
  }

  return tokens
}
