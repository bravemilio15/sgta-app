import React from 'react';
import './Button.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

const Button = ({ children, ...props }: ButtonProps) => (
  <button className="sgta-btn" {...props}>{children}</button>
);

export default Button;
