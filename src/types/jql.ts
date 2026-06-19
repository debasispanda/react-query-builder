export type TokenType = 'FIELD' | 'OPERATOR' | 'VALUE' | 'CONNECTOR' | 'UNKNOWN'

export interface Token {
  value: string
  type: TokenType
}
