import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Leaf } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: '互动问答', path: '/quiz', icon: '📚' },
    { name: '植物鉴定', path: '/identify', icon: '🔍' },
    { name: '植物图鉴', path: '/encyclopedia', icon: '📱' },
  ];

  const isActive = (path: string) => location.pathname === path || (path === '/quiz' && location.pathname === '/');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-green-700">
            <Leaf className="h-6 w-6" />
            <span>植识</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`px-4 py-2 ${
                    isActive(item.path) 
                      ? "bg-green-100 text-green-800 hover:bg-green-200" 
                      : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                <div className="flex items-center space-x-2 font-bold text-xl text-green-700 mb-6">
                  <Leaf className="h-6 w-6" />
                  <span>植识</span>
                </div>
                {navigationItems.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`w-full justify-start px-4 py-3 ${
                        isActive(item.path) 
                          ? "bg-green-100 text-green-800" 
                          : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                      }`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;