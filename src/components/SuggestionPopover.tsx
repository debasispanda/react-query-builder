export interface SuggestionPopoverProps {
  open?: boolean
}

export function SuggestionPopover({ open = false }: SuggestionPopoverProps) {
  if (!open) return null

  return <div className="rounded-md border border-slate-200 bg-white p-2 text-sm">Suggestions</div>
}
