import React, { useState, useEffect, useRef } from 'react';
import { Product, Client, Sale, Category, SaleItem } from '../lib/types';
import { 
  TrendingUp, DollarSign, Users, ShoppingBag, Plus, Trash2, 
  CheckCircle, AlertCircle, MessageCircle, PlusCircle, 
  Calendar, Edit, Check, X, Info, Upload, ImageOff
} from 'lucide-react';

interface SellerDashboardProps {
  products: Product[];
  clients: Client[];
  sales: Sale[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onAddClient: (name: string, phone: string) => Client;
  onAddSale: (clientId: string, items: SaleItem[], status: 'pago' | 'fiado', date?: string) => void;
  onSettleSale: (saleId: string) => void;
  onSettleAllDebts: (clientId: string) => void;
  adminPin: string;
  onUpdatePin: (pin: string) => void;
}

type Tab = 'visao_geral' | 'registrar_venda' | 'fiados' | 'produtos';
type Period = '7_dias' | '1_mes' | '3_meses' | '6_meses' | '1_ano' | 'tudo';

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  products,
  clients,
  sales,
  onAddProduct,
  onUpdateProduct,
  onAddClient,
  onAddSale,
  onSettleSale,
  onSettleAllDebts,
  adminPin,
  onUpdatePin
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('visao_geral');
  const [tempPin, setTempPin] = useState(adminPin);
  const [chartPeriod, setChartPeriod] = useState<Period>('7_dias');

  // ----------------------------------------------------
  // CUSTOM NOTIFICATIONS & DIALOGS (TOAST & MODAL STATES)
  // ----------------------------------------------------
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  useEffect(() => {
    if (toast.isOpen) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, isOpen: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.isOpen]);

  // Client outstanding balance helper
  const getClientBalance = (clientId: string) => {
    return sales
      .filter(s => s.clientId === clientId && s.status === 'fiado')
      .reduce((sum, s) => sum + s.totalAmount, 0);
  };

  // ----------------------------------------------------
  // TAB 1: VISÃO GERAL (STATS & REPORTS) STATE & LOGIC
  // ----------------------------------------------------
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReceived = sales.filter(s => s.status === 'pago').reduce((sum, s) => sum + s.totalAmount, 0);
  const totalOutstanding = sales.filter(s => s.status === 'fiado').reduce((sum, s) => sum + s.totalAmount, 0);
  
  const activeDebtors = clients.filter(c => getClientBalance(c.id) > 0);

  // Top Selling Products Calculation
  const productSalesMap: Record<string, { name: string; qty: number; total: number }> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.productName, qty: 0, total: 0 };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].total += item.priceAtSale * item.quantity;
    });
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Chart period helper
  const periodToDays: Record<Period, number | null> = {
    '7_dias': 7, '1_mes': 30, '3_meses': 90, '6_meses': 180, '1_ano': 365, 'tudo': null
  };
  const periodLabels: Record<Period, string> = {
    '7_dias': 'Últimos 7 dias', '1_mes': 'Último mês', '3_meses': 'Últimos 3 meses',
    '6_meses': 'Últimos 6 meses', '1_ano': 'Último ano', 'tudo': 'Todo o período'
  };

  const getDayMonthStr = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const getDailySales = () => {
    const days = periodToDays[chartPeriod];
    const now = new Date();
    const cutoff = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;

    const filteredSales = cutoff
      ? sales.filter(s => new Date(s.date) >= cutoff!)
      : sales;

    // How many buckets to show (max 30 for readability)
    const buckets = Math.min(days ?? 60, 30);
    const dailyMap: Record<string, number> = {};
    const dateKeys: string[] = [];

    for (let i = buckets - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = getDayMonthStr(d);
      dailyMap[str] = 0;
      dateKeys.push(str);
    }

    // If 'tudo' and no buckets, group by month instead
    if (!days) {
      const monthMap: Record<string, number> = {};
      filteredSales.forEach(sale => {
        const d = new Date(sale.date);
        const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        monthMap[key] = (monthMap[key] || 0) + sale.totalAmount;
      });
      const sortedMonths = Object.keys(monthMap).sort((a, b) => {
        const [ma, ya] = a.split('/').map(Number);
        const [mb, yb] = b.split('/').map(Number);
        return ya !== yb ? ya - yb : ma - mb;
      });
      return sortedMonths.map(key => ({ date: key, total: monthMap[key] }));
    }

    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const str = getDayMonthStr(saleDate);
      if (dailyMap[str] !== undefined) {
        dailyMap[str] += sale.totalAmount;
      }
    });

    return dateKeys.map(key => ({ date: key, total: dailyMap[key] }));
  };

  const dailySales = getDailySales();
  const maxDailySale = Math.max(...dailySales.map(d => d.total), 1);

  // ----------------------------------------------------
  // TAB 2: REGISTRAR VENDA STATE & LOGIC
  // ----------------------------------------------------
  const [saleClientId, setSaleClientId] = useState('');
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  
  const [saleItems, setSaleItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductQty, setSelectedProductQty] = useState(1);
  const [salePaymentStatus, setSalePaymentStatus] = useState<'pago' | 'fiado'>('pago');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  // Alphabetical sort for dropdown selectors
  const sortedClientsSelector = [...clients].sort((a, b) => a.name.localeCompare(b.name));
  const sortedProductsSelector = [...products]
    .filter(p => p.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));

  const addProductToSale = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    setSaleItems(prev => {
      const existing = prev.find(item => item.product.id === prod.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === prod.id 
            ? { ...item, quantity: item.quantity + selectedProductQty }
            : item
        );
      }
      return [...prev, { product: prod, quantity: selectedProductQty }];
    });

    setSelectedProductId('');
    setSelectedProductQty(1);
  };

  const removeProductFromSale = (productId: string) => {
    setSaleItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const saleTotalAmount = saleItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (saleItems.length === 0) {
      showToast('Adicione pelo menos um produto à venda!', 'error');
      return;
    }

    let finalClientId = saleClientId;

    if (isNewClientMode) {
      if (!newClientName.trim()) {
        showToast('Digite o nome do novo cliente!', 'error');
        return;
      }
      const cleanedPhone = newClientPhone.replace(/\D/g, '');
      const finalPhone = cleanedPhone ? (cleanedPhone.startsWith('55') ? cleanedPhone : `55${cleanedPhone}`) : '';
      const createdClient = onAddClient(newClientName, finalPhone);
      finalClientId = createdClient.id;
    } else if (!finalClientId) {
      showToast('Selecione um cliente!', 'error');
      return;
    }

    const itemsToSubmit: SaleItem[] = saleItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      priceAtSale: item.product.price,
      quantity: item.quantity
    }));

    onAddSale(finalClientId, itemsToSubmit, salePaymentStatus, new Date(saleDate + 'T12:00:00').toISOString());

    // Reset Form
    setSaleClientId('');
    setIsNewClientMode(false);
    setNewClientName('');
    setNewClientPhone('');
    setSaleItems([]);
    setSalePaymentStatus('pago');
    showToast('Venda registrada com sucesso!', 'success');
  };

  // ----------------------------------------------------
  // TAB 3: CONTROLE DE FIADO STATE & LOGIC
  // ----------------------------------------------------
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);

  const selectedDebtor = clients.find(c => c.id === selectedDebtorId);
  const debtorSales = selectedDebtorId 
    ? sales.filter(s => s.clientId === selectedDebtorId && s.status === 'fiado')
    : [];
  const debtorOutstandingTotal = getClientBalance(selectedDebtorId || '');

  // Sorted list of debtors alphabetically
  const sortedDebtors = [...activeDebtors].sort((a, b) => a.name.localeCompare(b.name));

  const sendWhatsAppReminder = (client: Client) => {
    const clientSales = sales.filter(s => s.clientId === client.id && s.status === 'fiado');
    if (clientSales.length === 0) return;

    let itemsText = '';
    clientSales.forEach(s => {
      const dateFormatted = new Date(s.date).toLocaleDateString('pt-BR');
      const itemsList = s.items.map(item => `${item.quantity}x ${item.productName}`).join(', ');
      itemsText += `• _${dateFormatted}_: ${itemsList} - *R$ ${s.totalAmount.toFixed(2)}*\n`;
    });

    const totalStr = getClientBalance(client.id).toFixed(2);

    let message = `Olá, *${client.name}*! Tudo bem? 🌸\n\n`;
    message += `Espero que sim! Passando para te enviar o resumo das compras recentes na *Vivisouza Confeitaria*:\n\n`;
    message += itemsText;
    message += `\n💰 *Total em aberto: R$ ${totalStr}*\n\n`;
    message += `Se estiver tudo certinho, você pode fazer o acerto via Pix.\n`;
    message += `🔑 Chave Pix (Celular): *18991179602*\n`;
    message += `Nome: Viviane Souza\n\n`;
    message += `Qualquer dúvida ou se quiser combinar outro dia, estou por aqui. Muito obrigada! 🥰`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${client.phone || '5518991179602'}&text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // ----------------------------------------------------
  // TAB 4: GERENCIAR PRODUTOS (MODAL & LOGIC)
  // ----------------------------------------------------
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Form values
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<Category>('Doces Artesanais');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodIsActive, setProdIsActive] = useState(true);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reads a device photo, downsizes it (max 800px) and re-encodes as JPEG
  // so it stays small enough to live safely inside localStorage.
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Selecione um arquivo de imagem válido!', 'error');
      e.target.value = '';
      return;
    }

    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIMENSION = 800;
        let { width, height } = img;

        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          showToast('Não foi possível processar a imagem.', 'error');
          setIsProcessingImage(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

        setProdImage(compressedDataUrl);
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        showToast('Não foi possível ler essa imagem.', 'error');
        setIsProcessingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      showToast('Erro ao carregar o arquivo.', 'error');
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);

    // Allow selecting the same file again later and trigger onChange
    e.target.value = '';
  };

  // Sort products alphabetically
  const sortedProductsList = [...products].sort((a, b) => a.name.localeCompare(b.name));

  const startCreateProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategory('Doces Artesanais');
    setProdDescription('');
    setProdPrice('');
    setProdImage('');
    setProdIsActive(true);
    setIsProductModalOpen(true);
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdDescription(prod.description);
    setProdPrice(prod.price.toString());
    setProdImage(prod.image);
    setProdIsActive(prod.isActive);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim()) {
      showToast('Nome e Preço são obrigatórios!', 'error');
      return;
    }

    const priceNum = parseFloat(prodPrice);
    if (isNaN(priceNum)) {
      showToast('Preço inválido!', 'error');
      return;
    }

    const imageFallback = prodImage.trim() || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';

    if (editingProductId) {
      onUpdateProduct({
        id: editingProductId,
        name: prodName,
        category: prodCategory,
        description: prodDescription,
        price: priceNum,
        image: imageFallback,
        isActive: prodIsActive
      });
      showToast('Produto atualizado com sucesso!', 'success');
    } else {
      onAddProduct({
        name: prodName,
        category: prodCategory,
        description: prodDescription,
        price: priceNum,
        image: imageFallback,
        isActive: prodIsActive
      });
      showToast('Produto cadastrado com sucesso!', 'success');
    }

    setIsProductModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      
      {/* Dashboard Subheader & Tab Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2545]">Painel do Vendedor</h1>
          <p className="text-sm text-neutral-500">Gerencie suas vendas, fiados e cardápio de produtos.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto w-full lg:w-auto bg-white p-1 rounded-xl border border-neutral-200 shadow-sm">
          <button
            onClick={() => setActiveTab('visao_geral')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'visao_geral' ? 'bg-[#0B2545] text-white' : 'text-neutral-600 hover:text-[#0B2545]'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('registrar_venda')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'registrar_venda' ? 'bg-[#0B2545] text-white' : 'text-neutral-600 hover:text-[#0B2545]'
            }`}
          >
            Registrar Venda
          </button>
          <button
            onClick={() => setActiveTab('fiados')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fiados' ? 'bg-[#0B2545] text-white' : 'text-neutral-600 hover:text-[#0B2545]'
            }`}
          >
            Controle de Fiado
            {activeDebtors.length > 0 && (
              <span className={`h-2 w-2 rounded-full ${activeTab === 'fiados' ? 'bg-[#F4D35E]' : 'bg-[#0B2545]'}`}></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('produtos')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'produtos' ? 'bg-[#0B2545] text-white' : 'text-neutral-600 hover:text-[#0B2545]'
            }`}
          >
            Produtos
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          TAB 1: VISÃO GERAL
          ---------------------------------------------------- */}
      {activeTab === 'visao_geral' && (
        <div className="space-y-6 animate-fade-in pb-16">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">Faturamento</p>
                <h3 className="text-lg sm:text-2xl font-extrabold text-neutral-800 mt-1">R$ {totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 text-[#0B2545] rounded-xl self-end sm:self-center">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">Recebido</p>
                <h3 className="text-lg sm:text-2xl font-extrabold text-green-600 mt-1">R$ {totalReceived.toFixed(2)}</h3>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 text-green-600 rounded-xl self-end sm:self-center">
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">A Receber</p>
                <h3 className="text-lg sm:text-2xl font-extrabold text-yellow-600 mt-1">R$ {totalOutstanding.toFixed(2)}</h3>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-50 text-yellow-600 rounded-xl self-end sm:self-center">
                <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">Devedores</p>
                <h3 className="text-lg sm:text-2xl font-extrabold text-neutral-800 mt-1">{activeDebtors.length}</h3>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 text-purple-600 rounded-xl self-end sm:self-center">
                <Users className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart (Highly Responsive Layout) */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 shadow-sm lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h3 className="text-sm sm:text-md font-bold text-neutral-800 flex items-center gap-2">
                  <DollarSign className="h-4.5 w-4.5 text-[#0B2545]" />
                  Vendas — {periodLabels[chartPeriod]}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(periodLabels) as Period[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                        chartPeriod === p
                          ? 'bg-[#0B2545] text-white border-[#0B2545]'
                          : 'bg-white text-neutral-500 border-neutral-200 hover:border-[#0B2545] hover:text-[#0B2545]'
                      }`}
                    >
                      {p === '7_dias' ? '7D' : p === '1_mes' ? '1M' : p === '3_meses' ? '3M' : p === '6_meses' ? '6M' : p === '1_ano' ? '1A' : 'Tudo'}
                    </button>
                  ))}
                </div>
              </div>

              {dailySales.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-16">Nenhuma venda neste período.</p>
              ) : (
                <div className="flex justify-between items-end h-44 sm:h-56 pt-4 border-b border-neutral-100 pb-2 overflow-x-auto gap-1">
                  {dailySales.map(d => {
                    const percentage = (d.total / maxDailySale) * 100;
                    return (
                      <div key={d.date} className="flex flex-col items-center flex-1 min-w-[28px] group h-full justify-end">
                        <div className="relative w-full flex justify-center items-end" style={{ height: `${Math.max(percentage, 4)}%` }}>
                          <span className="absolute bottom-full mb-2 scale-0 group-hover:scale-100 bg-[#0B2545] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md transition-all z-10 whitespace-nowrap">
                            R$ {d.total.toFixed(0)}
                          </span>
                          <div className="w-5 sm:w-8 bg-gradient-to-t from-[#0B2545] to-[#1e4a7d] rounded-t-md sm:rounded-t-lg h-full" />
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-bold text-neutral-400 mt-2 rotate-0">{d.date}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 shadow-sm">
              <h3 className="text-sm sm:text-md font-bold text-neutral-800 mb-6 flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-[#0B2545]" />
                Mais Vendidos
              </h3>
              
              {topSellingProducts.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-10">Nenhuma venda registrada ainda.</p>
              ) : (
                <div className="space-y-4">
                  {topSellingProducts.map((p, index) => (
                    <div key={p.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-5.5 w-5.5 rounded-full bg-neutral-100 text-neutral-600 font-bold text-[10px] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-neutral-800 line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-neutral-400">{p.qty} unidades</p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-[#0B2545]">R$ {p.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Sales List (Responsive Mobile Cards vs Desktop Table) */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="text-sm sm:text-md font-bold text-neutral-800">Histórico Recente</h3>
            </div>
            
            {sales.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-10">Nenhuma venda registrada.</p>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-400 font-bold text-xs uppercase border-b border-neutral-100">
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Itens</th>
                        <th className="px-6 py-4">Valor</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-sm">
                      {sales.slice(-8).reverse().map(sale => (
                        <tr key={sale.id} className="hover:bg-neutral-50/50">
                          <td className="px-6 py-4 font-bold text-neutral-800">{sale.clientName}</td>
                          <td className="px-6 py-4 text-neutral-500">
                            {new Date(sale.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 text-neutral-500 max-w-xs truncate">
                            {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                          </td>
                          <td className="px-6 py-4 font-bold text-neutral-800">R$ {sale.totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              sale.status === 'pago' 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}>
                              {sale.status === 'pago' ? 'Pago' : 'Fiado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="block md:hidden divide-y divide-neutral-100">
                  {sales.slice(-8).reverse().map(sale => (
                    <div key={sale.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-neutral-800">{sale.clientName}</p>
                          <p className="text-[10px] text-neutral-400">
                            {new Date(sale.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.status === 'pago' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {sale.status === 'pago' ? 'Pago' : 'Fiado'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-1">
                        {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-neutral-400">Total:</span>
                        <span className="font-bold text-neutral-800 text-sm">R$ {sale.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: REGISTRAR VENDA
          ---------------------------------------------------- */}
      {activeTab === 'registrar_venda' && (
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm animate-fade-in pb-12">
          <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] mb-6 flex items-center gap-2">
            <PlusCircle className="h-5.5 w-5.5" />
            Lançar Nova Venda
          </h2>

          <form onSubmit={handleRegisterSale} className="space-y-6">
            {/* Client Picker */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs sm:text-sm font-bold text-neutral-700">Cliente</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewClientMode(!isNewClientMode);
                    setSaleClientId('');
                  }}
                  className="text-xs font-bold text-[#0B2545] hover:underline"
                >
                  {isNewClientMode ? 'Selecionar cadastrado' : '+ Novo cliente'}
                </button>
              </div>

              {isNewClientMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50 p-3 sm:p-4 rounded-2xl border border-neutral-200">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      placeholder="Nome do cliente"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="block w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 mb-1">WhatsApp (DDD + Número)</label>
                    <input
                      type="text"
                      placeholder="Ex: 18991179602"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      className="block w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>
                </div>
              ) : (
                <select
                  value={saleClientId}
                  onChange={(e) => setSaleClientId(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0B2545] bg-white"
                >
                  <option value="">-- Selecione o Cliente --</option>
                  {/* Sorted Alphabetically */}
                  {sortedClientsSelector.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {getClientBalance(c.id) > 0 ? `(Dívida: R$ ${getClientBalance(c.id).toFixed(2)})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-2">Data da Venda</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="block w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0B2545] bg-white"
              />
            </div>

            {/* Product Item Selection */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-2">Adicionar Doces</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="block flex-1 px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0B2545] bg-white"
                >
                  <option value="">-- Escolha um Produto --</option>
                  {/* Sorted Alphabetically */}
                  {sortedProductsSelector.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - R$ {p.price.toFixed(2)} ({p.category})
                    </option>
                  ))}
                </select>
                
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-xs font-bold text-neutral-500 sm:hidden">Quantidade:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={selectedProductQty}
                      onChange={(e) => setSelectedProductQty(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-2 border border-neutral-200 rounded-xl text-sm text-center focus:outline-none bg-white font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addProductToSale}
                    className="bg-[#0B2545] hover:bg-[#16355c] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Incluir
                  </button>
                </div>
              </div>

              {/* Items List Table */}
              {saleItems.length > 0 && (
                <div className="mt-4 border-t border-neutral-200 pt-4 space-y-2">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Itens do Lançamento</p>
                  {saleItems.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center text-xs sm:text-sm py-1.5 border-b border-neutral-200/40">
                      <span className="text-neutral-700">
                        {item.quantity}x <span className="font-bold">{item.product.name}</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-neutral-800">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProductFromSale(item.product.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-neutral-200 mt-3 pt-3 flex justify-between font-extrabold text-[#0B2545] text-sm sm:text-base">
                    <span>Total da Venda:</span>
                    <span>R$ {saleTotalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Type Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-2">Forma de Registro</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-green-50/50 hover:bg-green-50 p-3 rounded-2xl border border-green-200 flex-1 transition-all">
                  <input
                    type="radio"
                    name="payment_status"
                    checked={salePaymentStatus === 'pago'}
                    onChange={() => setSalePaymentStatus('pago')}
                    className="text-[#0B2545] focus:ring-[#0B2545] h-4 w-4"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-green-700">Venda Paga</p>
                    <p className="text-[10px] text-neutral-400">Dinheiro ou Pix recebido</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-yellow-50/50 hover:bg-yellow-50 p-3 rounded-2xl border border-yellow-200 flex-1 transition-all">
                  <input
                    type="radio"
                    name="payment_status"
                    checked={salePaymentStatus === 'fiado'}
                    onChange={() => setSalePaymentStatus('fiado')}
                    className="text-[#0B2545] focus:ring-[#0B2545] h-4 w-4"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-yellow-700">Marcar no Fiado</p>
                    <p className="text-[10px] text-neutral-400">O valor será somado à dívida</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B2545] hover:bg-[#16355c] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] text-sm"
            >
              Registrar Transação
            </button>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: CONTROLE DE FIADO
          ---------------------------------------------------- */}
      {activeTab === 'fiados' && (
        <div className="space-y-6 animate-fade-in pb-16">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100">
              <h3 className="text-sm sm:text-md font-bold text-neutral-800">Clientes com Dívidas Ativas</h3>
            </div>
            
            {sortedDebtors.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-neutral-500 font-medium">Parabéns! Ninguém está devendo no fiado no momento.</p>
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-400 font-bold text-xs uppercase border-b border-neutral-100">
                        <th className="px-6 py-4">Nome do Cliente</th>
                        <th className="px-6 py-4">Telefone</th>
                        <th className="px-6 py-4">Total em Aberto</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-sm">
                      {sortedDebtors.map(client => (
                        <tr key={client.id} className="hover:bg-neutral-50/50">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedDebtorId(client.id)}
                              className="font-bold text-neutral-800 hover:text-[#0B2545] hover:underline text-left"
                            >
                              {client.name}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-neutral-500">{client.phone || 'Não informado'}</td>
                          <td className="px-6 py-4 font-black text-red-500">
                            R$ {getClientBalance(client.id).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => setSelectedDebtorId(client.id)}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold px-3 py-2 rounded-lg"
                            >
                              Ver Extrato
                            </button>
                            <button
                              onClick={() => sendWhatsAppReminder(client)}
                              className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow-sm"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Cobrar
                            </button>
                            <button
                              onClick={() => {
                                triggerConfirm(
                                  'Quitar Dívida Completa',
                                  `Dar baixa completa na dívida de R$ ${getClientBalance(client.id).toFixed(2)} do cliente ${client.name}?`,
                                  () => onSettleAllDebts(client.id)
                                );
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg"
                            >
                              Quitar Tudo
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="block md:hidden divide-y divide-neutral-100">
                  {sortedDebtors.map(client => {
                    const balance = getClientBalance(client.id);
                    return (
                      <div key={client.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <button
                              onClick={() => setSelectedDebtorId(client.id)}
                              className="font-extrabold text-sm text-neutral-800 hover:underline text-left"
                            >
                              {client.name}
                            </button>
                            <p className="text-[10px] text-neutral-400 mt-0.5">{client.phone || 'Sem telefone'}</p>
                          </div>
                          <span className="font-extrabold text-sm text-red-500">
                            R$ {balance.toFixed(2)}
                          </span>
                        </div>

                        {/* Mobile Actions Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-1.5">
                          <button
                            onClick={() => setSelectedDebtorId(client.id)}
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-bold py-2 rounded-lg text-center"
                          >
                            Ver Extrato
                          </button>
                          <button
                            onClick={() => sendWhatsAppReminder(client)}
                            className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 shadow-sm"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Cobrar
                          </button>
                          <button
                            onClick={() => {
                              triggerConfirm(
                                'Quitar Tudo',
                                `Confirmar baixa total de R$ ${balance.toFixed(2)} para ${client.name}?`,
                                () => onSettleAllDebts(client.id)
                              );
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-2 rounded-lg text-center"
                          >
                            Quitar Tudo
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Debtor Details Drawer Modal */}
          {selectedDebtor && (
            <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/40 backdrop-blur-sm transition-opacity">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
                  <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300">
                    <div className="flex h-full flex-col bg-white shadow-2xl rounded-l-3xl border-l border-neutral-100">
                      
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-neutral-800">
                            Extrato: {selectedDebtor.name}
                          </h2>
                          <p className="text-xs text-neutral-400 mt-0.5">Total a Pagar: R$ {debtorOutstandingTotal.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => setSelectedDebtorId(null)}
                          className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin">
                        {debtorSales.length === 0 ? (
                          <div className="text-center py-10 text-neutral-400">Nenhuma dívida ativa.</div>
                        ) : (
                          debtorSales.map(sale => (
                            <div 
                              key={sale.id}
                              className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 flex flex-col justify-between"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(sale.date).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-sm font-extrabold text-red-500">
                                  R$ {sale.totalAmount.toFixed(2)}
                                </span>
                              </div>
                              
                              <ul className="text-xs text-neutral-600 space-y-1.5 my-2 border-t border-b border-neutral-200/60 py-2.5">
                                {sale.items.map(item => (
                                  <li key={item.productId} className="flex justify-between">
                                    <span>{item.quantity}x {item.productName}</span>
                                    <span>R$ {(item.priceAtSale * item.quantity).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>

                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => {
                                    triggerConfirm(
                                      'Receber Compra',
                                      `Dar baixa individual nesta compra de R$ ${sale.totalAmount.toFixed(2)}?`,
                                      () => {
                                        onSettleSale(sale.id);
                                        // If this was the last sale, close details
                                        if (debtorSales.length <= 1) {
                                          setSelectedDebtorId(null);
                                        }
                                      }
                                    );
                                  }}
                                  className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg flex items-center gap-1"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Receber esta compra
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-neutral-100 px-6 py-6 bg-neutral-50 rounded-b-3xl flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => sendWhatsAppReminder(selectedDebtor)}
                          className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 rounded-xl shadow-sm text-center flex items-center justify-center gap-2 text-sm"
                        >
                          <MessageCircle className="h-5 w-5" />
                          Cobrar via WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            triggerConfirm(
                              'Quitar Tudo',
                              `Confirmar baixa total de R$ ${debtorOutstandingTotal.toFixed(2)} para ${selectedDebtor.name}?`,
                              () => {
                                onSettleAllDebts(selectedDebtor.id);
                                setSelectedDebtorId(null);
                              }
                            );
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm text-sm"
                        >
                          Quitar Tudo
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 4: GERENCIAR PRODUTOS (MOBILE LAYOUT CARDS)
          ---------------------------------------------------- */}
      {activeTab === 'produtos' && (
        <div className="space-y-6 animate-fade-in pb-16">
          
          {/* Header Controls for Catalog */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
            <h3 className="text-sm sm:text-md font-bold text-neutral-800">Catálogo de Produtos</h3>
            <button
              onClick={startCreateProduct}
              className="bg-[#0B2545] hover:bg-[#16355c] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              Novo Produto
            </button>
          </div>

          {/* Product Form Centered Modal Overlay */}
          {isProductModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-900/40 backdrop-blur-sm p-4 animate-fade-in">
              <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-100 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 bg-neutral-50">
                  <h3 className="text-base font-bold text-neutral-800">
                    {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                  </h3>
                  <button
                    onClick={() => setIsProductModalOpen(false)}
                    className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Nome do Produto</label>
                    <input
                      type="text"
                      placeholder="Ex: Bolo de Cenoura"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="block w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Categoria</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value as Category)}
                        className="block w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0B2545] bg-white"
                      >
                        <option value="Doces Artesanais">Doces Artesanais</option>
                        <option value="Bolos">Bolos</option>
                        <option value="Tortas">Tortas</option>
                        <option value="Geladinho">Geladinho</option>
                        <option value="Pipocas Gourmet">Pipocas Gourmet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Preço de Venda (R$)</label>
                      <input
                        type="text"
                        placeholder="Ex: 12.50"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        className="block w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Foto do Produto</label>
                    <div className="flex items-center gap-3">
                      {/* Live preview */}
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0 flex items-center justify-center">
                        {prodImage ? (
                          <img
                            src={prodImage}
                            alt="Pré-visualização"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageOff className="h-5 w-5 text-neutral-300" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessingImage}
                          className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-neutral-200 disabled:opacity-50"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {isProcessingImage ? 'Processando...' : 'Escolher foto do dispositivo'}
                        </button>
                        <input
                          type="text"
                          placeholder="ou cole o link de uma imagem"
                          value={prodImage.startsWith('data:') ? '' : prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                          className="block w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                        />
                        {prodImage.startsWith('data:') && (
                          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Foto carregada do dispositivo
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Descrição</label>
                    <textarea
                      placeholder="Escreva detalhes do produto, sabor, peso, etc..."
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0B2545] resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="prod_active"
                      checked={prodIsActive}
                      onChange={(e) => setProdIsActive(e.target.checked)}
                      className="text-[#0B2545] focus:ring-[#0B2545] rounded"
                    />
                    <label htmlFor="prod_active" className="text-xs sm:text-sm text-neutral-600 font-bold cursor-pointer">
                      Disponível para venda (Cardápio)
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2.5 rounded-xl text-xs sm:text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#0B2545] hover:bg-[#16355c] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm"
                    >
                      {editingProductId ? 'Salvar Alterações' : 'Salvar Novo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Catalog Products List Table vs Mobile Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Products listings panel */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden lg:col-span-2">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-400 font-bold text-xs uppercase border-b border-neutral-100">
                      <th className="px-6 py-4">Foto</th>
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4">Preço</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {/* Sorted Alphabetically */}
                    {sortedProductsList.map(prod => (
                      <tr key={prod.id} className="hover:bg-neutral-50/50">
                        <td className="px-6 py-4">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="h-10 w-10 rounded-lg object-cover bg-neutral-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-neutral-800">{prod.name}</div>
                          <div className="text-xs text-neutral-400 line-clamp-1">{prod.description}</div>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">{prod.category}</td>
                        <td className="px-6 py-4 font-bold text-neutral-800">R$ {prod.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            prod.isActive 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {prod.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => startEditProduct(prod)}
                            className="text-[#0B2545] hover:text-[#16355c] font-bold text-xs flex items-center gap-1 ml-auto"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden divide-y divide-neutral-100">
                {sortedProductsList.map(prod => (
                  <div key={prod.id} className="p-4 flex gap-3 items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="h-12 w-12 rounded-xl object-cover bg-neutral-100 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-neutral-800 line-clamp-1">{prod.name}</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{prod.category} • R$ {prod.price.toFixed(2)}</p>
                        <span className={`inline-flex items-center px-2 py-0.2 mt-1 rounded-full text-[9px] font-bold ${
                          prod.isActive 
                            ? 'bg-green-50 text-green-700 border border-green-150' 
                            : 'bg-red-50 text-red-700 border border-red-150'
                        }`}>
                          {prod.isActive ? 'Disponível' : 'Indisponível'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => startEditProduct(prod)}
                      className="text-[#0B2545] hover:text-[#16355c] bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Security PIN settings */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm h-fit">
              <h3 className="text-sm sm:text-md font-bold text-neutral-800 mb-4">
                Segurança do Painel
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1.5">
                    PIN de Acesso (4 dígitos)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={tempPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setTempPin(val);
                      }}
                      className="block w-20 px-2 py-2 border border-neutral-200 rounded-xl text-sm text-center font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-[#0B2545] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempPin.length !== 4) {
                          showToast('O PIN deve ter exatamente 4 dígitos numéricos!', 'error');
                          return;
                        }
                        onUpdatePin(tempPin);
                        showToast('PIN de acesso atualizado com sucesso!', 'success');
                      }}
                      className="bg-[#0B2545] hover:bg-[#16355c] text-white text-xs font-bold px-3 py-2 rounded-xl flex-1 active:scale-95 transition-all shadow-sm"
                    >
                      Salvar PIN
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          CUSTOM NOTIFICATIONS: TOAST NOTIFICATION OVERLAY
          ---------------------------------------------------- */}
      {toast.isOpen && (
        <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 z-50 animate-slide-up">
          <div className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 border ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          CUSTOM DIALOGS: STATE CONFIRMATION POPUP MODAL
          ---------------------------------------------------- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-neutral-100 shadow-2xl text-center space-y-4">
            <div className="inline-flex p-3 bg-neutral-50 text-[#0B2545] rounded-full border border-neutral-100">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-neutral-800">{confirmModal.title}</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2 rounded-xl text-xs"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="flex-1 bg-[#0B2545] hover:bg-[#16355c] text-white font-bold py-2 rounded-xl text-xs"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
