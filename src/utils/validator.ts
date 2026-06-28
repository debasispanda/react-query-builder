import type { Token } from '@/types/jql'
import { getOperatorsForField, isValidField } from '@/utils/schema'

interface ValidationResult {
  isValid: boolean
  error?: string
}

type Expected = 'FIELD' | 'OPERATOR' | 'VALUE' | 'CONNECTOR_OR_END'

function matchesOperator(candidate: string, validOperators: string[]): boolean {
  const normalized = candidate.toUpperCase()

  return validOperators.some((operator) => operator.toUpperCase() === normalized)
}

export function validate(tokens: Token[]): ValidationResult {
  if (tokens.length === 0) {
    return { isValid: true }
  }

  let expected: Expected = 'FIELD'
  let currentField: string | null = null

  for (const token of tokens) {
    if (expected === 'FIELD') {
      if (token.type !== 'FIELD') {
        return {
          isValid: false,
          error: 'Incomplete query: expected FIELD after connector',
        }
      }

      if (!isValidField(token.value)) {
        return {
          isValid: false,
          error: `Invalid field name: ${token.value}`,
        }
      }

      currentField = token.value
      expected = 'OPERATOR'
      continue
    }

    if (expected === 'OPERATOR') {
      if (token.type !== 'OPERATOR') {
        return {
          isValid: false,
          error: 'Incomplete query: expected OPERATOR after field',
        }
      }

      const validOperators = getOperatorsForField(currentField ?? '')
      if (!matchesOperator(token.value, validOperators)) {
        return {
          isValid: false,
          error: `Invalid operator: ${token.value} for field ${currentField}`,
        }
      }

      expected = 'VALUE'
      continue
    }

    if (expected === 'VALUE') {
      if (token.type !== 'VALUE') {
        return {
          isValid: false,
          error: 'Incomplete query: expected VALUE after operator',
        }
      }

      expected = 'CONNECTOR_OR_END'
      continue
    }

    if (token.type === 'CONNECTOR') {
      expected = 'FIELD'
      continue
    }

    return {
      isValid: false,
      error: `Invalid connector: ${token.value}`,
    }
  }

  if (expected === 'OPERATOR') {
    return {
      isValid: false,
      error: 'Incomplete query: expected OPERATOR after field',
    }
  }

  if (expected === 'VALUE') {
    return {
      isValid: false,
      error: 'Incomplete query: expected VALUE after operator',
    }
  }

  if (expected === 'FIELD') {
    return {
      isValid: false,
      error: 'Incomplete query: expected FIELD after connector',
    }
  }

  return { isValid: true }
}
