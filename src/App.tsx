import { useState, useEffect } from 'react';
import { Product, Client, Sale, SaleItem } from './lib/types';
import { INITIAL_PRODUCTS, INITIAL_CLIENTS, INITIAL_SALES } from './lib/initialData';
import { CustomerCatalog } from './components/CustomerCatalog';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminLogin } from './components/AdminLogin';
import { ChefHat, LogOut } from 'lucide-react';
import { db, isFirebaseConfigured } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

export default function App() {
  // Core application state
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [adminPin, setAdminPin] = useState<string>('1234');

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

  // Firebase Real-time Synchronization or LocalStorage Fallback
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      // 1. Sync Products
      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Product);
        });

        if (snapshot.empty) {
          // Seed initial products to Firestore
          INITIAL_PRODUCTS.forEach(p => {
            setDoc(doc(db, 'products', p.id), p);
          });
        } else {
          // Sort alphabetically by default for catalog/selections
          setProducts(list.sort((a, b) => a.name.localeCompare(b.name)));
        }
      });

      // 2. Sync Clients
      const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
        const list: Client[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Client);
        });

        if (snapshot.empty) {
          // Seed initial clients to Firestore
          INITIAL_CLIENTS.forEach(c => {
            setDoc(doc(db, 'clients', c.id), c);
          });
        } else {
          setClients(list.sort((a, b) => a.name.localeCompare(b.name)));
        }
      });

      // 3. Sync Sales
      const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
        const list: Sale[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Sale);
        });

        if (snapshot.empty) {
          // Seed initial sales to Firestore
          INITIAL_SALES.forEach(s => {
            setDoc(doc(db, 'sales', s.id), s);
          });
        } else {
          setSales(list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      });

      // 4. Sync Admin PIN
      const unsubPin = onSnapshot(doc(db, 'settings', 'admin_pin'), (docSnap) => {
        if (docSnap.exists()) {
          setAdminPin(docSnap.data().pin);
        } else {
          setDoc(doc(db, 'settings', 'admin_pin'), { pin: '1234' });
        }
      });

      return () => {
        unsubProducts();
        unsubClients();
        unsubSales();
        unsubPin();
      };
    } else {
      // LocalStorage fallback loading
      const localProducts = localStorage.getItem('vivisouza_products');
      setProducts(localProducts ? JSON.parse(localProducts) : INITIAL_PRODUCTS);

      const localClients = localStorage.getItem('vivisouza_clients');
      setClients(localClients ? JSON.parse(localClients) : INITIAL_CLIENTS);

      const localSales = localStorage.getItem('vivisouza_sales');
      setSales(localSales ? JSON.parse(localSales) : INITIAL_SALES);

      const localPin = localStorage.getItem('vivisouza_admin_pin');
      setAdminPin(localPin ? localPin : '1234');
    }
  }, []);

  // Sync to LocalStorage (Only active when Firebase is NOT configured)
  useEffect(() => {
    if (!isFirebaseConfigured) {
      localStorage.setItem('vivisouza_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      localStorage.setItem('vivisouza_clients', JSON.stringify(clients));
    }
  }, [clients]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      localStorage.setItem('vivisouza_sales', JSON.stringify(sales));
    }
  }, [sales]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      localStorage.setItem('vivisouza_admin_pin', adminPin);
    }
  }, [adminPin]);

  // Product actions
  const handleAddProduct = async (newProd: Omit<Product, 'id'>) => {
    const id = `p_${Date.now()}`;
    const product: Product = { ...newProd, id };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'products', id), product);
      } catch (err) {
        console.error('Error writing product:', err);
      }
    } else {
      setProducts(prev => [product, ...prev]);
    }
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'products', updatedProd.id), updatedProd);
      } catch (err) {
        console.error('Error updating product:', err);
      }
    } else {
      setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    }
  };

  // Client actions
  const handleAddClient = (name: string, phone: string): Client => {
    const id = `c_${Date.now()}`;
    const client: Client = {
      id,
      name,
      phone,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'clients', id), client);
      } catch (err) {
        console.error('Error writing client:', err);
      }
    } else {
      setClients(prev => [...prev, client]);
    }
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
    const id = `s_${Date.now()}`;

    const sale: Sale = {
      id,
      clientId,
      clientName: client ? client.name : 'Cliente Avulso',
      date: date || new Date().toISOString(),
      items,
      totalAmount: saleTotal,
      status,
      paidAt: status === 'pago' ? new Date().toISOString() : undefined
    };

    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'sales', id), sale);
      } catch (err) {
        console.error('Error writing sale:', err);
      }
    } else {
      setSales(prev => [...prev, sale]);
    }
  };

  // Settle a specific sale
  const handleSettleSale = (saleId: string) => {
    if (isFirebaseConfigured && db) {
      try {
        updateDoc(doc(db, 'sales', saleId), {
          status: 'pago',
          paidAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error settling sale:', err);
      }
    } else {
      setSales(prev => prev.map(sale => 
        sale.id === saleId 
          ? { ...sale, status: 'pago' as const, paidAt: new Date().toISOString() } 
          : sale
      ));
    }
  };

  // Settle all outstanding debts for a client
  const handleSettleAllDebts = async (clientId: string) => {
    if (isFirebaseConfigured && db) {
      try {
        const toSettle = sales.filter(s => s.clientId === clientId && s.status === 'fiado');
        for (const s of toSettle) {
          await updateDoc(doc(db, 'sales', s.id), {
            status: 'pago',
            paidAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error settling all debts:', err);
      }
    } else {
      setSales(prev => prev.map(sale => 
        sale.clientId === clientId && sale.status === 'fiado'
          ? { ...sale, status: 'pago' as const, paidAt: new Date().toISOString() }
          : sale
      ));
    }
  };

  // Admin PIN updating
  const handleUpdatePin = (newPin: string) => {
    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'settings', 'admin_pin'), { pin: newPin });
      } catch (err) {
        console.error('Error updating pin:', err);
      }
    } else {
      setAdminPin(newPin);
    }
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
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                  isFirebaseConfigured
                    ? 'bg-green-500/10 text-green-400 border-green-500/25'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                }`}>
                  {isFirebaseConfigured ? 'Nuvem Ativa' : 'Modo Local'}
                </span>
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
              adminPin={adminPin}
              onUpdatePin={handleUpdatePin}
              isFirebase={isFirebaseConfigured}
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
