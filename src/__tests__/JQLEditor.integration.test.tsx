import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JQLEditor } from '@/components/JQLEditor'

describe('JQLEditor suggestions', () => {
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

  it('supports arrow navigation for operator suggestions', async () => {
    const user = userEvent.setup()

    render(<JQLEditor />)

    const input = screen.getByRole('textbox') as HTMLTextAreaElement

    await user.type(input, 'project ')

    expect(screen.getByText('IN')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}{Enter}')

    expect(input).toHaveValue('project !=')
    await waitFor(() => expect(input.selectionStart).toBe(10))
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
