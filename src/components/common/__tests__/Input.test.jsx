import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input Component', () => {
  it('should render input', () => {
    render(<Input name="test" />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Input name="test" label="Test Label" />);
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('should render required indicator', () => {
    render(<Input name="test" label="Test" required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<Input name="test" onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('should call onBlur when input loses focus', () => {
    const handleBlur = jest.fn();
    render(<Input name="test" onBlur={handleBlur} />);
    
    fireEvent.blur(screen.getByRole('textbox'));
    expect(handleBlur).toHaveBeenCalled();
  });

  it('should display error message when error and touched', () => {
    render(<Input name="test" error="Error message" touched />);
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should not display error when not touched', () => {
    render(<Input name="test" error="Error message" touched={false} />);
    
    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input name="test" disabled />);
    
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should have placeholder', () => {
    render(<Input name="test" placeholder="Enter text" />);
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should show error styling when error and touched', () => {
    render(<Input name="test" error="Error" touched />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should render with value', () => {
    render(<Input name="test" value="test value" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('test value');
  });
});
