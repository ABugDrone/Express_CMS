import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from '../Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders a single item (Home only)', () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText('Home')).toBeDefined();
  });

  it('renders category and article breadcrumbs', () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={[
          { label: 'Politics', to: '/category/politics' },
          { label: 'My Article Title' },
        ]} />
      </MemoryRouter>
    );
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Politics')).toBeDefined();
    expect(screen.getByText('My Article Title')).toBeDefined();
  });
});
