import { useState, useEffect } from 'react';
import { Product, Client, Sale, SaleItem } from './lib/types';
import { INITIAL_PRODUCTS, INITIAL_CLIENTS, INITIAL_SALES } from './lib/initialData';
import { CustomerCatalog } from './components/CustomerCatalog';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminLogin } from './components/AdminLogin';
import { ChefHat, LogOut } from 'lucide-react';

export default function App() {
  // Load initial state from localStorage or use defaults
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vivisouza_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('vivisouza_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('vivisouza_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  // Admin PIN setup (Default '1234')
  const [adminPin, setAdminPin] = useState<string>(() => {
    const saved = localStorage.getItem('vivisouza_admin_pin');
    return saved ? saved : '1234';
  });

  // Authentication state (Session-only, resets on browser close)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('vivisouza_admin_auth');
    return saved === 'true';
  });

  // Hash-based Routing State
  const [currentRoute, setCurrentRoute] = useState<'/' | '/admin'>(() => {
    const hash = window.location.hash;
    return (hash.startsWith('#/admin') || hash.startsWith('#/vendedor')) ? '/admin' : '/';
  });

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentRoute((hash.startsWith('#/admin') || hash.startsWith('#/vendedor')) ? '/admin' : '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync state with localStorage on changes
  useEffect(() => {
    localStorage.setItem('vivisouza_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vivisouza_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('vivisouza_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('vivisouza_admin_pin', adminPin);
  }, [adminPin]);

  // Product actions
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProd,
      id: `p_${Date.now()}`
    };
    setProducts(prev => [product, ...prev]);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  // Client actions
  const handleAddClient = (name: string, phone: string): Client => {
    const client: Client = {
      id: `c_${Date.now()}`,
      name,
      phone,
      createdAt: new Date().toISOString()
    };
    setClients(prev => [...prev, client]);
    return client;
  };

  // Sale actions
  const handleAddSale = (
    clientId: string,
    items: SaleItem[],
    status: 'pago' | 'fiado',
    date?: string
  ) => {
    const client = clients.find(c => c.id === clientId);
    const saleTotal = items.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
    
    const sale: Sale = {
      id: `s_${Date.now()}`,
      clientId,
      clientName: client ? client.name : 'Cliente Avulso',
      date: date || new Date().toISOString(),
      items,
      totalAmount: saleTotal,
      status,
      paidAt: status === 'pago' ? new Date().toISOString() : undefined
    };
    
    setSales(prev => [...prev, sale]);
  };

  // Settle a specific sale
  const handleSettleSale = (saleId: string) => {
    setSales(prev => prev.map(sale => 
      sale.id === saleId 
        ? { ...sale, status: 'pago' as const, paidAt: new Date().toISOString() } 
        : sale
    ));
  };

  // Settle all outstanding debts for a client
  const handleSettleAllDebts = (clientId: string) => {
    setSales(prev => prev.map(sale => 
      sale.clientId === clientId && sale.status === 'fiado'
        ? { ...sale, status: 'pago' as const, paidAt: new Date().toISOString() }
        : sale
    ));
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('vivisouza_admin_auth');
    window.location.hash = '#/'; // Go back to customer catalog
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('vivisouza_admin_auth', 'true');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[#0B2545] border-b border-[#F4D35E]/20 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand Name */}
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-[#F4D35E]" />
              <span className="font-extrabold text-lg tracking-wider text-white">
                VIVISOUZA <span className="text-[#F4D35E]">CONFEITARIA</span>
              </span>
            </div>

            {/* Admin Header Elements */}
            {currentRoute === '/admin' && isAdminAuthenticated && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[#F4D35E] tracking-widest uppercase bg-[#071b33] px-3 py-1.5 rounded-lg border border-neutral-700">
                  Painel Administrativo
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            )}
            
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-neutral-50">
        {currentRoute === '/admin' ? (
          !isAdminAuthenticated ? (
            <AdminLogin 
              correctPin={adminPin} 
              onSuccess={handleAdminLoginSuccess} 
            />
          ) : (
            <SellerDashboard
              products={products}
              clients={clients}
              sales={sales}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onAddClient={handleAddClient}
              onAddSale={handleAddSale}
              onSettleSale={handleSettleSale}
              onSettleAllDebts={handleSettleAllDebts}
              // Pass down PIN changing state methods
              adminPin={adminPin}
              onUpdatePin={setAdminPin}
            />
          )
        ) : (
          <CustomerCatalog products={products} />
        )}
      </main>

      {/* Page Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 text-center text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Vivisouza Confeitaria. Desenvolvido com carinho para impulsionar suas vendas.</p>
        </div>
      </footer>
    </div>
  );
}
