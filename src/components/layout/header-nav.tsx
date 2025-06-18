"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export function HeaderNav() {
  const navItems = [
    { label: 'Formulário', href: '#formulario' },
    { label: 'Dúvidas', href: '#duvidas' },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card shadow-md">
      <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-6">
        <Link href="#formulario" className="flex items-center text-foreground hover:opacity-80 transition-opacity" aria-label="Navegar para Formulário">
          <Image
            src="/icons/Logo-Empresa-RS-Transporte-Sem-Fundo.ico"
            alt="Logo RS Transporte"
            width={40}
            height={40}
            priority
            className="object-contain"
            data-ai-hint="company logo square"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-4 md:space-x-6">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-lg text-foreground hover:text-primary transition-colors"
                  aria-label={`Navegar para ${item.label}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-card p-0">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-6 border-b">
                   <Link href="#formulario" className="text-xl font-bold text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                     <Image
                        src="/icons/Logo-Empresa-RS-Transporte.ico"
                        alt="Logo RS Transporte"
                        width={30}
                        height={30}
                        className="object-contain"
                        data-ai-hint="company logo square"
                      />
                   </Link>
                   <SheetClose asChild>
                      <Button variant="ghost" size="icon" aria-label="Fechar menu">
                        <X className="h-6 w-6" />
                      </Button>
                    </SheetClose>
                </div>
                <nav className="flex-grow p-6">
                  <ul className="flex flex-col space-y-4">
                    {navItems.map((item) => (
                      <li key={item.label}>
                        <SheetClose asChild>
                          <Link
                            href={item.href}
                            className="block text-lg text-foreground hover:text-primary transition-colors py-2"
                            aria-label={`Navegar para ${item.label}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
