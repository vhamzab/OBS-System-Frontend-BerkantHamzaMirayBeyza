import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be disabled when loading prop is true', () => {
    render(<Button loading>Click me</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });


  it('should have type submit when specified', () => {
    render(<Button type="submit">Submit</Button>);
    
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('should have type button by default', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('should render with primary variant styles', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render with ghost variant', () => {
    render(<Button variant="ghost">Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render with danger variant', () => {
    render(<Button variant="danger">Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should apply fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Click me</Button>);
    
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('should render children', () => {
    render(
      <Button>
        <span>Icon</span>
        Text
      </Button>
    );
    
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
