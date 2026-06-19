export interface QueryInputProps {
  value?: string
}

export function QueryInput({ value = '' }: QueryInputProps) {
  return <textarea value={value} readOnly className="min-h-28 w-full rounded-md border border-slate-300 p-3" />
}
