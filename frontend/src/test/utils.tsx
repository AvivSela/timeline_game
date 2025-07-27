import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { route = '/', ...renderOptions } = options;
  
  // Set up route if provided
  if (route !== '/') {
    window.history.pushState({}, 'Test page', route);
  }
  
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
  };
};

// User interaction helpers
export const userInteractions = {
  click: async (element: Element) => {
    const user = userEvent.setup();
    await user.click(element);
  },
  
  type: async (element: Element, text: string) => {
    const user = userEvent.setup();
    await user.type(element, text);
  },
  
  clear: async (element: Element) => {
    const user = userEvent.setup();
    await user.clear(element);
  },
  
  tab: async () => {
    const user = userEvent.setup();
    await user.tab();
  },
  
  keyboard: async (key: string) => {
    const user = userEvent.setup();
    await user.keyboard(key);
  },
  
  submitForm: async (form: Element) => {
    const user = userEvent.setup();
    await user.click(form.querySelector('button[type="submit"]') || form);
  },
};

// Accessibility testing utilities
export const accessibilityHelpers = {
  hasRole: (element: Element, role: string) => {
    return element.getAttribute('role') === role;
  },
  
  hasAriaLabel: (element: Element, label: string) => {
    return element.getAttribute('aria-label') === label;
  },
  
  isFocusable: (element: Element) => {
    return element instanceof HTMLElement && element.tabIndex >= 0;
  },
  
  isDisabled: (element: Element) => {
    return element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
  },
};

// Test helpers for common user workflows
export const workflowHelpers = {
  createGame: async (screen: any) => {
    const user = userEvent.setup();
    
    // Navigate to create game page
    await user.click(screen.getByRole('button', { name: /create game/i }));
    
    // Fill out form
    const slider = screen.getByRole('slider');
    await user.click(slider);
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create game/i }));
    
    return { user };
  },
  
  joinGame: async (screen: any, roomCode: string = 'TEST123', playerName: string = 'TestPlayer') => {
    const user = userEvent.setup();
    
    // Navigate to join game page
    await user.click(screen.getByRole('button', { name: /join game/i }));
    
    // Fill out form
    await user.type(screen.getByLabelText(/room code/i), roomCode);
    await user.type(screen.getByLabelText(/player name/i), playerName);
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /join game/i }));
    
    return { user };
  },
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render }; 