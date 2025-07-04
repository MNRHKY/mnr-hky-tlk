import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { icon: Home, label: 'Home', href: '/', active: location.pathname === '/' },
    { icon: Search, label: 'Search', href: '/search', active: location.pathname === '/search' },
    { icon: Plus, label: 'Create', href: '/create', active: location.pathname === '/create' },
    { icon: User, label: user ? 'Profile' : 'Login', href: user ? '/profile' : '/login', active: location.pathname === (user ? '/profile' : '/login') },
    { icon: Menu, label: 'Menu', href: '#', active: false, isMenu: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 md:hidden">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center justify-center h-12 w-12 p-1 ${
              item.active 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            asChild={!item.isMenu}
          >
            {item.isMenu ? (
              <div>
                <item.icon className="h-5 w-5 mb-0.5" />
                <span className="text-xs">{item.label}</span>
              </div>
            ) : (
              <Link to={item.href}>
                <item.icon className="h-5 w-5 mb-0.5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )}
          </Button>
        ))}
      </div>
    </nav>
  );
};