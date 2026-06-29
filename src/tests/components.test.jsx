import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import RoleBadge from '../components/admin/RoleBadge';
import CategorySelector from '../components/expenses/CategorySelector';
import BuildInfoCard from '../components/admin/BuildInfoCard';
import SystemHealthCard from '../components/admin/SystemHealthCard';
import ExpenseForm from '../components/expenses/ExpenseForm';


// Mock Zustand stores
vi.mock('../../store/authStore', () => {
  return {
    useAuthStore: vi.fn().mockImplementation((selector) => {
      const state = { user: { id: 'u1', name: 'John Doe' } };
      return selector ? selector(state) : state;
    })
  };
});

vi.mock('../../store/currencyStore', () => {
  return {
    useCurrencyStore: vi.fn().mockImplementation((selector) => {
      const state = {
        supportedCurrencies: ['INR', 'USD'],
        getCurrencySymbol: (c) => (c === 'INR' ? '₹' : '$'),
        initialize: vi.fn()
      };
      return selector ? selector(state) : state;
    })
  };
});

vi.mock('../../services/offlineQueue', () => {
  return {
    getDraft: vi.fn().mockResolvedValue(null),
    saveDraft: vi.fn().mockResolvedValue(true),
    deleteDraft: vi.fn().mockResolvedValue(true)
  };
});

describe('React Components and Accessibility', () => {
  // 1. Role Badge
  describe('RoleBadge Component', () => {
    test('renders RoleBadge with correct text and accessibility', async () => {
      const { container } = render(<RoleBadge role="OWNER" />);
      
      expect(screen.getByText('OWNER')).toBeInTheDocument();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('renders Banned role badge styling', async () => {
      render(<RoleBadge role="MEMBER" isBanned={true} />);
      expect(screen.getByText('BANNED')).toBeInTheDocument();
    });
  });

  // 2. Category Selector
  describe('CategorySelector Component', () => {
    test('renders all categories and executes callback on change', async () => {
      const handleChange = vi.fn();
      const { container } = render(
        <CategorySelector value="FOOD" onChange={handleChange} />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select.value).toBe('FOOD');

      fireEvent.change(select, { target: { value: 'TRAVEL' } });
      expect(handleChange).toHaveBeenCalledWith('TRAVEL');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // 3. Build Info Card
  describe('BuildInfoCard Component', () => {
    test('renders build information details and accessibility', async () => {
      const version = {
        appVersion: '1.2.3',
        nodeVersion: 'v22.0.0',
        environment: 'production',
        gitCommit: 'abc1234',
        buildTimestamp: new Date().toISOString()
      };

      const { container } = render(<BuildInfoCard version={version} />);
      
      expect(screen.getByText('1.2.3')).toBeInTheDocument();
      expect(screen.getByText('production')).toBeInTheDocument();
      expect(screen.getByText('abc1234')).toBeInTheDocument();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // 4. System Health Card
  describe('SystemHealthCard Component', () => {
    test('renders UP status correctly and checks accessibility', async () => {
      const health = { success: true, status: 'UP' };
      const ready = { success: true, components: { database: 'UP', redis: 'UP' } };

      const { container } = render(<SystemHealthCard health={health} ready={ready} />);
      
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getAllByText('UP')).toHaveLength(3); // Overall, DB, Redis

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // 5. Expense Form rendering
  describe('ExpenseForm Component', () => {
    test('renders form elements correctly and checks accessibility', async () => {
      const mockMembers = [
        { id: 'm1', userId: 'u1', role: 'OWNER', user: { name: 'John Doe' } },
        { id: 'm2', userId: 'u2', role: 'MEMBER', user: { name: 'Jane Smith' } }
      ];
      
      const { container } = render(
        <ExpenseForm
          members={mockMembers}
          onSubmit={vi.fn()}
          isLoading={false}
        />
      );

      // Verify input boxes are rendered
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
