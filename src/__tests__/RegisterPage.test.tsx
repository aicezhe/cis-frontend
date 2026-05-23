import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';

describe('RegisterPage', () => {

  it('рендерит надпись Введи свой email', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const title = screen.getByText('Введи свой email.');
    expect(title).toBeInTheDocument();
  });

  it('рендерит плейсхолдер anna@mail.ru', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('anna@mail.ru');
    expect(emailInput).toBeInTheDocument();
  });

  it('кнопка ДАЛЕЕ disabled когда поле пустое', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const button = screen.getByText('ДАЛЕЕ');
    expect(button).toBeDisabled();
  });

  it('кнопка ДАЛЕЕ становится активной после ввода валидного email', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('anna@mail.ru');
    await user.type(input, 'anna@gmail.com');

    const button = screen.getByText('ДАЛЕЕ');
    expect(button).not.toBeDisabled();
  });

});