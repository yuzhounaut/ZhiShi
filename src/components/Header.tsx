import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Leaf, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  interface NavigationItem {
    name: string;
    path: string;
    icon: string;
    subItems?: { name: string; path: string }[];
  }

  const navigationItems: NavigationItem[] = [
    { name: '科特征知识库', path: '/encyclopedia/families', icon: '📖' },
    { name: '形态名词图鉴', path: '/encyclopedia/atlas', icon: '🖼️' },
    { name: '互动问答', path: '/quiz', icon: '📚' },
    { name: '智能鉴定', path: '/identify', icon: '🔍' },
  ];

  const isActive = (item: NavigationItem) => {
    if (item.subItems) {
      return item.subItems.some((sub) => location.pathname.startsWith(sub.path));
    }
    return location.pathname === item.path || (item.path === '/quiz' && location.pathname === '/');
  };

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
              item.subItems ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isActive(item) ? "default" : "ghost"}
                      className={`px-4 py-2 ${
                        isActive(item)
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {item.subItems.map((sub) => (
                      <DropdownMenuItem key={sub.path} asChild>
                        <Link to={sub.path} className="w-full cursor-pointer">
                          {sub.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item) ? "default" : "ghost"}
                    className={`px-4 py-2 ${
                      isActive(item)
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Button>
                </Link>
              )
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
                  <div key={item.name} className="flex flex-col space-y-1">
                    {item.subItems ? (
                      <>
                        <div className="flex items-center px-4 py-2 text-gray-500 text-sm font-medium">
                          <span className="mr-3 text-lg">{item.icon}</span>
                          {item.name}
                        </div>
                        {item.subItems.map((sub) => (
                          <Link key={sub.path} to={sub.path} onClick={() => setIsOpen(false)}>
                            <Button
                              variant={location.pathname.startsWith(sub.path) ? "default" : "ghost"}
                              className={`w-full justify-start pl-12 pr-4 py-3 ${
                                location.pathname.startsWith(sub.path)
                                  ? "bg-green-100 text-green-800"
                                  : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                              }`}
                            >
                              {sub.name}
                            </Button>
                          </Link>
                        ))}
                      </>
                    ) : (
                      <Link to={item.path} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive(item) ? "default" : "ghost"}
                          className={`w-full justify-start px-4 py-3 ${
                            isActive(item)
                              ? "bg-green-100 text-green-800"
                              : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                          }`}
                        >
                          <span className="mr-3 text-lg">{item.icon}</span>
                          {item.name}
                        </Button>
                      </Link>
                    )}
                  </div>
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