import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: mainForums } = useCategories(null, 1);
  
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
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <div className="flex flex-col items-center">
                    <item.icon className="h-5 w-5 mb-0.5" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {/* Main Forums */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Main Forums</h3>
                      <div className="space-y-2">
                        {mainForums?.map((forum) => (
                          <Link
                            key={forum.id}
                            to={`/category/${forum.slug}`}
                            className="flex items-center p-3 rounded-md hover:bg-accent"
                            onClick={() => setMenuOpen(false)}
                          >
                            <div 
                              className="w-3 h-3 rounded-sm mr-3"
                              style={{ backgroundColor: forum.color }}
                            />
                            <div>
                              <div className="font-medium text-sm">{forum.name}</div>
                              {forum.description && (
                                <div className="text-xs text-muted-foreground">{forum.description}</div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* User Actions */}
                    <div className="border-t pt-4">
                      {user ? (
                        <div className="space-y-2">
                          <div className="px-3 py-2 text-sm font-medium">{user.username}</div>
                          <Link
                            to="/profile"
                            className="flex items-center p-3 rounded-md hover:bg-accent"
                            onClick={() => setMenuOpen(false)}
                          >
                            Profile
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center p-3 rounded-md hover:bg-accent"
                            onClick={() => setMenuOpen(false)}
                          >
                            Settings
                          </Link>
                          <Button
                            variant="ghost"
                            className="w-full justify-start p-3 h-auto"
                            onClick={() => {
                              signOut();
                              setMenuOpen(false);
                            }}
                          >
                            Sign Out
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Link
                            to="/login"
                            className="flex items-center p-3 rounded-md hover:bg-accent"
                            onClick={() => setMenuOpen(false)}
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/register"
                            className="flex items-center p-3 rounded-md hover:bg-accent"
                            onClick={() => setMenuOpen(false)}
                          >
                            Register
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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