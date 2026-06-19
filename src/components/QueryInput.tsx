import { useEffect, useId, useState, type ChangeEvent, type SyntheticEvent } from 'react'

import type { QueryInputContext } from '@/types/jql'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { detectContext } from '@/utils/contextDetector'
import { tokenize } from '@/utils/tokenizer'

export interface QueryInputProps {
  value?: string
  onChange?: (value: string) => void
  onContextChange?: (context: QueryInputContext | null) => void
  isError?: boolean
  errorMessage?: string
}

function getCursorTokenIndex(value: string, cursorPos: number): number {
  return tokenize(value.slice(0, cursorPos)).length
}

export function QueryInput({
  value = '',
  onChange,
  onContextChange,
  isError = false,
  errorMessage,
}: QueryInputProps) {
  const [queryText, setQueryText] = useState(value)
  const [cursorPos, setCursorPos] = useState(value.length)
  const errorId = useId()

  useEffect(() => {
    setQueryText(value)
  }, [value])

  useEffect(() => {
    const safeCursorPos = Math.min(cursorPos, queryText.length)
    const context = detectContext(
      tokenize(queryText),
      getCursorTokenIndex(queryText, safeCursorPos),
    )

    onContextChange?.(context)
  }, [cursorPos, onContextChange, queryText])

  function updateCursorPosition(event: SyntheticEvent<HTMLTextAreaElement>) {
    setCursorPos(event.currentTarget.selectionStart)
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextValue = event.currentTarget.value

    setQueryText(nextValue)
    setCursorPos(event.currentTarget.selectionStart)
    onChange?.(nextValue)
  }

  function handleBlur() {
    onContextChange?.(null)
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={queryText}
        onChange={handleChange}
        onClick={updateCursorPosition}
        onKeyUp={updateCursorPosition}
        onSelect={updateCursorPosition}
        onBlur={handleBlur}
        aria-invalid={isError || undefined}
        aria-describedby={errorMessage ? errorId : undefined}
        className={cn(isError && 'jql-input--error border-red-500 focus:border-red-500 focus:ring-red-100')}
      />
      {errorMessage ? (
        <p id={errorId} className="text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
