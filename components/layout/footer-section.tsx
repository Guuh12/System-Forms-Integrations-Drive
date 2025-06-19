export function FooterSection() {
  return (
    <footer className="py-8 bg-muted text-muted-foreground">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="flex flex-col items-center justify-center mb-2">
          <img src="/icons/Logo Empres RS Transporte Sem Fundo-2.png" alt="Logo RS Transporte" className="mx-auto mb-1" style={{ maxWidth: 120, height: 'auto' }} />
          <span className="block text-sm font-semibold">Cnpj: 30.735.162/0001-39</span>
        </div>
        <p className="text-sm">
          Site developed by GIGA Enterprises
        </p>
      </div>
    </footer>
  );
}
