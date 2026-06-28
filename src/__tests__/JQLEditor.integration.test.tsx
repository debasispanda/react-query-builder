import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { JQLEditor } from '@/components/JQLEditor'
import type { QueryOutput } from '@/types/jql'

function getLastOutput(mockFn: ReturnType<typeof vi.fn>): QueryOutput {
  const output = mockFn.mock.calls.at(-1)?.[0] as QueryOutput | undefined

  if (!output) {
    throw new Error('Expected at least one output callback call')
  }

  return output
}

describe('JQLEditor integration', () => {
  it('emits valid output for a complete single query', async () => {
    const user = userEvent.setup()
    const onOutputChange = vi.fn()
    const onValidChange = vi.fn()

    render(<JQLEditor onOutputChange={onOutputChange} onValidChange={onValidChange} />)

    const input = screen.getByRole('textbox')

    await user.type(input, 'project = "Marketing"')

    await waitFor(() => {
      const output = getLastOutput(onOutputChange)
      expect(output.isValid).toBe(true)
      expect(output.normalized).toBe('project = "Marketing"')
      expect(output.tokens).toHaveLength(3)
    })

    expect(onValidChange).toHaveBeenCalledWith(true)
  })

  it('shows an error for an incomplete query', async () => {
    const user = userEvent.setup()

    render(<JQLEditor />)

    const input = screen.getByRole('textbox')

    await user.type(input, 'project =')

    expect(
      screen.getByText('Incomplete query: expected VALUE after operator'),
    ).toBeInTheDocument()
  })

  it('clears the error when the query becomes complete again', async () => {
    const user = userEvent.setup()

    render(<JQLEditor />)

    const input = screen.getByRole('textbox')

    await user.type(input, 'project =')

    expect(
      screen.getByText('Incomplete query: expected VALUE after operator'),
    ).toBeInTheDocument()

    await user.type(input, ' "Marketing"')

    await waitFor(() => {
      expect(
        screen.queryByText('Incomplete query: expected VALUE after operator'),
      ).not.toBeInTheDocument()
    })
  })

  it('shows field suggestions and inserts the selected field with Enter', async () => {
    const user = userEvent.setup()

    render(<JQLEditor />)

    const input = screen.getByRole('textbox') as HTMLTextAreaElement

    await user.type(input, 'pro')

    expect(screen.getByRole('option', { name: 'project' })).toBeInTheDocument()

    await user.keyboard('{Enter}')

    expect(input).toHaveValue('project')
    await waitFor(() => expect(input.selectionStart).toBe(7))
  })

  it('supports keyboard navigation for operator suggestions', async () => {
    const user = userEvent.setup()

    render(<JQLEditor />)

    const input = screen.getByRole('textbox') as HTMLTextAreaElement

    await user.type(input, 'project ')

    expect(screen.getByText('IN')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}{Enter}')

    expect(input).toHaveValue('project !=')
    await waitFor(() => expect(input.selectionStart).toBe(10))
  })

  it('emits correct tokens for a chained AND query', async () => {
    const user = userEvent.setup()
    const onOutputChange = vi.fn()

    render(<JQLEditor onOutputChange={onOutputChange} />)

    const input = screen.getByRole('textbox')

    await user.type(input, 'project = "Design" AND status = "ToDo"')

    await waitFor(() => {
      const output = getLastOutput(onOutputChange)
      expect(output.isValid).toBe(true)
      expect(output.tokens).toHaveLength(7)
      expect(output.tokens.map((token) => token.type)).toEqual([
        'FIELD',
        'OPERATOR',
        'VALUE',
        'CONNECTOR',
        'FIELD',
        'OPERATOR',
        'VALUE',
      ])
    })
  })

  it('shows an invalid field error', async () => {
    const user = userEvent.setup()

    render(<JQLEditor />)

    const input = screen.getByRole('textbox')

    await user.type(input, 'invalid_field = "value"')

    expect(screen.getByText('Invalid field name: invalid_field')).toBeInTheDocument()
  })

  it('shows an invalid operator error', async () => {
    const user = userEvent.setup()

    render(<JQLEditor />)

    const input = screen.getByRole('textbox')

    await user.type(input, 'project ~ "value"')

    expect(screen.getByText('Invalid operator: ~ for field project')).toBeInTheDocument()
  })

  it('supports selecting a suggestion with the mouse and closing with Escape', async () => {
    const user = userEvent.setup()

    render(<JQLEditor />)

    const input = screen.getByRole('textbox') as HTMLTextAreaElement

    await user.type(input, 'pro')
    await user.keyboard('{Escape}')

    expect(screen.queryByText('project')).not.toBeInTheDocument()

    await user.type(input, 'j')
    await user.click(screen.getByRole('option', { name: 'project' }))

    expect(input).toHaveValue('project')
  })
})
