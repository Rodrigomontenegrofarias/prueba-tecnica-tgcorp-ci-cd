import { render, screen } from '@testing-library/react';
import App from './App';

test('renders portfolio hero content', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', {
      level: 2,
      name: /Construyendo el futuro con código y automatización/i,
    })
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Ver mis proyectos/i })).toBeInTheDocument();
});
