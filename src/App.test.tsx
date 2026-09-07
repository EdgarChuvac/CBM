import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('CBMD dashboard', () => {
  it('renders the dashboard and validates service entry', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /inventario de bodega/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /registro de servicios/i }))

    expect(screen.getByRole('heading', { name: /registro de servicios/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /guardar servicio completo/i }))

    expect(screen.getByText(/ingresa el número de servicio/i)).toBeInTheDocument()
  })
})
