# Testing Guide

This directory contains tests for the Tucker Trips application.

## Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

## Test Structure

```
__tests__/
├── components/       # React component tests
│   └── TripCard.test.jsx
└── lib/             # Utility function tests
    └── utils.test.ts
```

## Writing Tests

### Component Tests

Component tests use React Testing Library:

```jsx
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent foo="bar" />)
    expect(screen.getByText('bar')).toBeInTheDocument()
  })
})
```

### Utility Tests

Utility functions are tested directly:

```ts
import { myFunction } from '@/lib/utils'

describe('myFunction', () => {
  it('returns expected result', () => {
    expect(myFunction('input')).toBe('output')
  })
})
```

## Best Practices

1. **Test user behavior, not implementation details**
   - Test what the user sees and interacts with
   - Avoid testing internal state or methods

2. **Use descriptive test names**
   - `it('shows error message when form is invalid')` ✅
   - `it('handles form submit')` ❌

3. **Mock external dependencies**
   - Supabase client is mocked in `jest.setup.js`
   - Use `jest.mock()` for other external modules

4. **Keep tests simple and focused**
   - Each test should verify one thing
   - Use `describe` blocks to group related tests

## TODO

Add tests for:
- [ ] TripCreationForm components
- [ ] DashboardNew component
- [ ] API route handlers
- [ ] Authentication flows
- [ ] Form validation
