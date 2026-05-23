import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WelcomePage from '../pages/WelcomePage';

describe('WelcomePage', () => {
  it('рендерит обе кнопки — ВОЙТИ и РЕГИСТРАЦИЯ', () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    const loginButton = screen.getByText('ВОЙТИ');
    const registerButton = screen.getByText('РЕГИСТРАЦИЯ');

    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
  });
});