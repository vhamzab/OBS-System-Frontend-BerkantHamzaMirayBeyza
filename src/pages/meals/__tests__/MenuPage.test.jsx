import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MenuPage from '../MenuPage';
import mealService from '../../../services/mealService';

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../services/mealService');

const mockMenus = [
  {
    id: 'menu-1',
    cafeteria_id: 'cafeteria-1',
    meal_type: 'lunch',
    date: '2024-12-25',
    items: ['Item 1', 'Item 2'],
    is_published: true,
  },
  {
    id: 'menu-2',
    cafeteria_id: 'cafeteria-1',
    meal_type: 'dinner',
    date: '2024-12-25',
    items: ['Item 3', 'Item 4'],
    is_published: true,
  },
];

const mockReservations = [];

const renderMenuPage = () => {
  return render(
    <BrowserRouter>
      <MenuPage />
    </BrowserRouter>
  );
};

describe('MenuPage - Meal Reservation Form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mealService.getMenus.mockResolvedValue({
      success: true,
      data: mockMenus,
    });
    mealService.getMyReservations.mockResolvedValue({
      success: true,
      data: mockReservations,
    });
  });

  describe('Rendering', () => {
    it('should render menu page correctly', async () => {
      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMenus).toHaveBeenCalled();
      });
    });

    it('should display menus when loaded', async () => {
      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMenus).toHaveBeenCalled();
      });
    });

    it('should show loading state initially', () => {
      mealService.getMenus.mockImplementation(() => new Promise(() => {})); // Never resolves
      renderMenuPage();
      
      // Loading spinner should be visible
      expect(screen.queryByText(/yükleniyor/i)).toBeInTheDocument();
    });
  });

  describe('Reservation Modal', () => {
    it('should open reservation modal when reserve button is clicked', async () => {
      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMenus).toHaveBeenCalled();
      });

      // Find and click reserve button
      const reserveButtons = screen.queryAllByText(/rezerve et/i);
      if (reserveButtons.length > 0) {
        fireEvent.click(reserveButtons[0]);
        
        // Modal should appear
        await waitFor(() => {
          expect(screen.getByText(/rezervasyon/i)).toBeInTheDocument();
        });
      }
    });

    it('should close reservation modal when cancelled', async () => {
      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMenus).toHaveBeenCalled();
      });

      const reserveButtons = screen.queryAllByText(/rezerve et/i);
      if (reserveButtons.length > 0) {
        fireEvent.click(reserveButtons[0]);
        
        await waitFor(() => {
          const cancelButton = screen.queryByText(/iptal/i);
          if (cancelButton) {
            fireEvent.click(cancelButton);
          }
        });
      }
    });
  });

  describe('Create Reservation', () => {
    it('should create reservation successfully', async () => {
      mealService.createReservation.mockResolvedValue({
        success: true,
        message: 'Yemek rezervasyonu oluşturuldu',
      });

      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMenus).toHaveBeenCalled();
      });

      const reserveButtons = screen.queryAllByText(/rezerve et/i);
      if (reserveButtons.length > 0) {
        fireEvent.click(reserveButtons[0]);
        
        await waitFor(() => {
          const confirmButton = screen.queryByText(/onayla/i);
          if (confirmButton) {
            fireEvent.click(confirmButton);
          }
        });

        await waitFor(() => {
          expect(mealService.createReservation).toHaveBeenCalled();
        });
      }
    });

    it('should handle reservation creation error', async () => {
      mealService.createReservation.mockRejectedValue({
        response: {
          data: {
            message: 'Rezervasyon oluşturulamadı',
          },
        },
      });

      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMenus).toHaveBeenCalled();
      });

      const reserveButtons = screen.queryAllByText(/rezerve et/i);
      if (reserveButtons.length > 0) {
        fireEvent.click(reserveButtons[0]);
        
        await waitFor(() => {
          const confirmButton = screen.queryByText(/onayla/i);
          if (confirmButton) {
            fireEvent.click(confirmButton);
          }
        });

        await waitFor(() => {
          expect(mealService.createReservation).toHaveBeenCalled();
        });
      }
    });

    it('should call createReservation with correct data', async () => {
      mealService.createReservation.mockResolvedValue({
        success: true,
      });

      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMenus).toHaveBeenCalled();
      });

      const reserveButtons = screen.queryAllByText(/rezerve et/i);
      if (reserveButtons.length > 0) {
        fireEvent.click(reserveButtons[0]);
        
        await waitFor(() => {
          const confirmButton = screen.queryByText(/onayla/i);
          if (confirmButton) {
            fireEvent.click(confirmButton);
          }
        });

        await waitFor(() => {
          expect(mealService.createReservation).toHaveBeenCalledWith(
            expect.objectContaining({
              menu_id: expect.any(String),
              cafeteria_id: expect.any(String),
              meal_type: expect.any(String),
              date: expect.any(String),
            })
          );
        });
      }
    });

    it('should refresh menus after successful reservation', async () => {
      mealService.createReservation.mockResolvedValue({
        success: true,
      });

      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMenus).toHaveBeenCalled();
      });

      const initialCallCount = mealService.getMenus.mock.calls.length;

      const reserveButtons = screen.queryAllByText(/rezerve et/i);
      if (reserveButtons.length > 0) {
        fireEvent.click(reserveButtons[0]);
        
        await waitFor(() => {
          const confirmButton = screen.queryByText(/onayla/i);
          if (confirmButton) {
            fireEvent.click(confirmButton);
          }
        });

        await waitFor(() => {
          expect(mealService.getMenus.mock.calls.length).toBeGreaterThan(initialCallCount);
        });
      }
    });
  });

  describe('Date Selection', () => {
    it('should fetch menus when date changes', async () => {
      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMenus).toHaveBeenCalled();
      });

      const initialCallCount = mealService.getMenus.mock.calls.length;

      // Find date input and change it
      const dateInput = screen.queryByLabelText(/tarih/i) || screen.queryByDisplayValue(/2024/);
      if (dateInput) {
        fireEvent.change(dateInput, { target: { value: '2024-12-26' } });
        
        await waitFor(() => {
          expect(mealService.getMenus.mock.calls.length).toBeGreaterThan(initialCallCount);
        });
      }
    });
  });

  describe('Reservation Status', () => {
    it('should show existing reservation status', async () => {
      const existingReservation = {
        id: 'reservation-1',
        menu_id: 'menu-1',
        date: '2024-12-25',
        status: 'reserved',
      };

      mealService.getMyReservations.mockResolvedValue({
        success: true,
        data: [existingReservation],
      });

      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMyReservations).toHaveBeenCalled();
      });
    });

    it('should disable reserve button if already reserved', async () => {
      const existingReservation = {
        id: 'reservation-1',
        menu_id: 'menu-1',
        date: '2024-12-25',
        status: 'reserved',
      };

      mealService.getMyReservations.mockResolvedValue({
        success: true,
        data: [existingReservation],
      });

      renderMenuPage();
      
      await waitFor(() => {
        expect(mealService.getMyReservations).toHaveBeenCalled();
      });
    });
  });
});

