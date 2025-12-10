import { render, screen, fireEvent } from '@testing-library/react';
import Select from '../Select';

describe('Select Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('should render select with label', () => {
    render(<Select label="Choose" name="select" options={options} />);
    expect(screen.getByLabelText('Choose')).toBeInTheDocument();
  });

  it('should render select without label', () => {
    render(<Select name="select" options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should display required indicator', () => {
    render(<Select label="Choose" name="select" required options={options} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<Select name="select" onChange={handleChange} options={options} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option1' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should display error message when error and touched are true', () => {
    render(<Select name="select" error="Required field" touched options={options} />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('should not display error when not touched', () => {
    render(<Select name="select" error="Required field" touched={false} options={options} />);
    expect(screen.queryByText('Required field')).not.toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Select name="select" disabled options={options} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('should render all options', () => {
    render(<Select name="select" options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should display placeholder', () => {
    render(<Select name="select" placeholder="Select an option" options={options} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should apply error styling when has error', () => {
    const { container } = render(<Select name="select" error="Error" touched options={options} />);
    const select = container.querySelector('select');
    expect(select).toHaveClass('input-error');
  });

  it('should call onBlur when select loses focus', () => {
    const handleBlur = jest.fn();
    render(<Select name="select" onBlur={handleBlur} options={options} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.blur(select);
    
    expect(handleBlur).toHaveBeenCalled();
  });

  it('should display selected value with onChange handler', () => {
    const handleChange = jest.fn();
    render(<Select name="select" value="option2" onChange={handleChange} options={options} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('option2');
  });

  it('should use defaultValue for uncontrolled component', () => {
    render(<Select name="select" defaultValue="option3" options={options} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('option3');
  });

  it('should render with custom className', () => {
    const { container } = render(<Select name="select" className="custom-class" options={options} />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
