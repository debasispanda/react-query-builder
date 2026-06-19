export function tokenize(input: string) {
  return input.trim() ? input.trim().split(/\s+/) : []
}
