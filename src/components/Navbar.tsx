import React from 'react';
import { Navbar1 } from '@/components/ui/navbar-1';

interface NavbarProps {
  title?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl';
}

const Navbar: React.FC<NavbarProps> = (props) => {
  return <Navbar1 {...props} />;
};

export default Navbar;
