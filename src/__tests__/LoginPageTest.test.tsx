import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

describe('LoginPage', () => {

  it('рендерит заголовок Bentornati', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const title = screen.getByText('Bentornati!');
    expect(title).toBeInTheDocument();
  });

  it('рендерит поля email и пароль', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('anna@gmail.com');
    expect(emailInput).toBeInTheDocument();
  });

  it('кнопка ВОЙТИ disabled когда поля пустые', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const button = screen.getByText('ВОЙТИ');
    expect(button).toBeDisabled();
  });

  it('кнопка ВОЙТИ становится активной после ввода email и пароля', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('anna@gmail.com');
    await user.type(emailInput, 'test@test.ru');

    // находим поле пароля — у него нет placeholder, ищем по типу
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLElement, 'password123');

    const button = screen.getByText('ВОЙТИ');
    expect(button).not.toBeDisabled();
  });

});