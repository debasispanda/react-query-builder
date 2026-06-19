import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { QueryInput } from '@/components/QueryInput'

describe('QueryInput', () => {
  it('renders an editable textarea and reports context while typing', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const handleContextChange = vi.fn()

    render(
      <QueryInput
        onChange={handleChange}
        onContextChange={handleContextChange}
      />,
    )

    const input = screen.getByRole('textbox')

    await user.type(input, 'project')

    expect(input).toHaveValue('project')
    expect(handleChange).toHaveBeenLastCalledWith('project')
    expect(handleContextChange).toHaveBeenLastCalledWith('OPERATOR')
  })

  it('shows error styling and message when invalid', () => {
    render(<QueryInput value="project" isError errorMessage="Expected operator" />)

    const input = screen.getByRole('textbox')

    expect(input).toHaveClass('jql-input--error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Expected operator')).toBeInTheDocument()
  })

  it('clears context on blur', async () => {
    const user = userEvent.setup()
    const handleContextChange = vi.fn()

    render(<QueryInput value="project" onContextChange={handleContextChange} />)

    await user.click(screen.getByRole('textbox'))
    await user.tab()

    expect(handleContextChange).toHaveBeenLastCalledWith(null)
  })
})
