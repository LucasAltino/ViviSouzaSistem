import React, { useState } from 'react';
import { Product, CartItem, Category } from '../lib/types';
import { Search, ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

interface CustomerCatalogProps {
  products: Product[];
}

const CATEGORIES: (Category | 'Todos')[] = [
  'Todos',
  'Doces Artesanais',
  'Bolos',
  'Tortas',
  'Geladinho',
  'Pipocas Gourmet'
];

const VIVI_PHONE = '5518991179602';

export const CustomerCatalog: React.FC<CustomerCatalogProps> = ({ products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleSendOrder = () => {
    if (cart.length === 0) return;

    let message = `🍫 *Novo Pedido - Vivisouza* 🍫\n\n`;
    message += `Olá, Vivi! Gostaria de fazer o seguinte pedido:\n\n`;
    message += `*Itens:*\n`;
    
    cart.forEach(item => {
      const itemSubtotal = item.product.price * item.quantity;
      message += `• ${item.quantity}x ${item.product.name} (R$ ${item.product.price.toFixed(2)} cada) - *R$ ${itemSubtotal.toFixed(2)}*\n`;
    });

    message += `\n💰 *Total do Pedido: R$ ${cartTotal.toFixed(2)}*\n\n`;
    message += `Por favor, me confirme a disponibilidade e o prazo de entrega. Muito obrigado(a)!`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${VIVI_PHONE}&text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24">
      {/* Brand Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0B2545] text-[#F4D35E] font-bold text-3xl shadow-md border-4 border-[#F4D35E] mb-4">
          VS
        </div>
        <h1 className="text-3xl font-extrabold text-[#0B2545] tracking-tight sm:text-4xl">
          Vivisouza Confeitaria
        </h1>
        <p className="mt-2 text-md text-neutral-500 max-w-md mx-auto">
          Doces artesanais, bolos, tortas, geladinhos e pipocas gourmet preparados com muito carinho.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </span>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-transparent text-sm transition-all"
          />
        </div>

        {/* Category Chips Scrollable */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none no-scrollbar">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                selectedCategory === category
                  ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-sm'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100 shadow-sm">
          <p className="text-neutral-400 text-lg">Nenhum produto disponível nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="premium-card flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm relative"
            >
              {/* Product Image */}
              <div className="h-52 w-full overflow-hidden bg-neutral-100 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    // Fallback in case of broken image URL
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';
                  }}
                />
                <span className="absolute top-3 right-3 bg-[#0B2545] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {product.category}
                </span>
              </div>

              {/* Product Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 leading-snug">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xl font-extrabold text-[#0B2545]">
                    R$ {product.price.toFixed(2)}
                  </span>
                  
                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-1.5 bg-[#0B2545] text-white hover:bg-[#16355c] active:scale-95 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm border border-[#0B2545]"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Shopping Cart Toggle Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#0B2545] text-white p-4 rounded-full shadow-xl hover:bg-[#16355c] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-[#F4D35E]"
        >
          <div className="relative">
            <ShoppingBag className="h-6 w-6 text-white" />
            <span className="absolute -top-2 -right-2 bg-[#F4D35E] text-[#0B2545] font-black text-xs h-5 w-5 rounded-full flex items-center justify-center animate-bounce">
              {cartItemCount}
            </span>
          </div>
          <span className="font-bold text-sm pr-1 hidden sm:inline">Ver Pedido</span>
        </button>
      )}

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/40 backdrop-blur-sm transition-opacity">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300">
                <div className="flex h-full flex-col bg-white shadow-2xl rounded-l-3xl border-l border-neutral-100">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
                    <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-[#0B2545]" />
                      Seu Pedido
                    </h2>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <ShoppingBag className="h-16 w-16 text-neutral-200 mb-4" />
                        <p className="text-neutral-500 font-medium">Seu carrinho está vazio.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div
                            key={item.product.id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-100"
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="h-14 w-14 rounded-xl object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';
                              }}
                            />
                            <div className="ml-3 flex-1">
                              <h4 className="text-sm font-bold text-neutral-800 line-clamp-1">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-neutral-400">
                                R$ {item.product.price.toFixed(2)} cada
                              </p>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2.5 mt-2">
                                <button
                                  onClick={() => updateQuantity(item.product.id, -1)}
                                  className="p-1 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 active:scale-90"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-sm font-bold text-neutral-700 min-w-[12px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, 1)}
                                  className="p-1 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 active:scale-90"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end justify-between h-full py-1">
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-neutral-400 hover:text-red-500 p-1 rounded-full transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <span className="text-sm font-bold text-neutral-800 mt-3 block">
                                R$ {(item.product.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Drawer Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-neutral-100 px-6 py-6 bg-neutral-50 rounded-b-3xl">
                      <div className="flex justify-between text-base font-bold text-neutral-800 mb-4">
                        <span>Total:</span>
                        <span className="text-xl font-extrabold text-[#0B2545]">
                          R$ {cartTotal.toFixed(2)}
                        </span>
                      </div>
                      
                      <button
                        onClick={handleSendOrder}
                        className="w-full flex items-center justify-center gap-2 bg-[#0B2545] hover:bg-[#16355c] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] border border-[#0B2545]"
                      >
                        Enviar Pedido via WhatsApp
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <p className="mt-2.5 text-center text-xs text-neutral-400">
                        O pedido será enviado formatado para o WhatsApp da Vivi Souza.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
