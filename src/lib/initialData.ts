import { Product, Client, Sale } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Beliscão de Goiabada',
    description: 'Doce tradicional feito com massa amanteigada super macia e recheio de goiabada cascão de alta qualidade.',
    price: 15.00,
    category: 'Doces Artesanais',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'p2',
    name: 'Pão de Mel Trufado',
    description: 'Massa fofinha com especiarias, recheada com doce de leite cremoso e banhada em chocolate meio amargo nobre.',
    price: 8.50,
    category: 'Doces Artesanais',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'p3',
    name: 'Cone Recheado de Brigadeiro',
    description: 'Casquinha de sorvete super crocante, blindada com chocolate por dentro e transbordando brigadeiro gourmet cremoso.',
    price: 9.00,
    category: 'Doces Artesanais',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'p4',
    name: 'Bolo de Pote Ninho com Morango',
    description: 'Camadas de bolo de chocolate super molhadinho intercaladas com brigadeiro de leite Ninho e morangos frescos picados.',
    price: 14.00,
    category: 'Bolos',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'p5',
    name: 'Bolo Caseiro de Cenoura com Chocolate',
    description: 'Bolo clássico de cenoura super fofinho com aquela cobertura vulcão generosa de brigadeiro gourmet.',
    price: 25.00,
    category: 'Bolos',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'p6',
    name: 'Torta de Limão Gourmet',
    description: 'Massa sablé crocante, creme de limão siciliano super aveludado e finalizado com merengue suíço dourado no maçarico.',
    price: 12.00,
    category: 'Tortas',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'p7',
    name: 'Torta Holandesa (Fatia)',
    description: 'Base de biscoito, creme holandês aerado com toque de baunilha, cobertura de ganache de chocolate e lateral decorada com biscoito Calipso.',
    price: 15.00,
    category: 'Tortas',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'p8',
    name: 'Geladinho Gourmet Ninho com Nutella',
    description: 'Extremamente cremoso, feito com leite condensado e leite Ninho, com uma generosa camada de Nutella pura por dentro.',
    price: 6.00,
    category: 'Geladinho',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'p9',
    name: 'Geladinho Gourmet Maracujá com Chocolate',
    description: 'Geladinho cremoso feito com a polpa natural do maracujá e casca interna trufada de chocolate ao leite.',
    price: 5.50,
    category: 'Geladinho',
    image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'p10',
    name: 'Pipoca Gourmet Leite Ninho',
    description: 'Pipoca super crocante caramelizada, banhada em chocolate branco de qualidade e envolta em muito leite Ninho em pó. Pacote 100g.',
    price: 12.00,
    category: 'Pipocas Gourmet',
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'p11',
    name: 'Pipoca Gourmet Ovomaltine',
    description: 'Pipoca super crocante banhada em chocolate ao leite nobre e coberta com flocos crocantes de Ovomaltine. Pacote 100g.',
    price: 12.00,
    category: 'Pipocas Gourmet',
    image: 'https://images.unsplash.com/photo-1585674484099-74c3b1d49257?w=500&auto=format&fit=crop&q=60',
    isActive: true
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Carlos Silva',
    phone: '5518991112233',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias atrás
  },
  {
    id: 'c2',
    name: 'Mariana Santos',
    phone: '5518992223344',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 dias atrás
  },
  {
    id: 'c3',
    name: 'Amanda Oliveira',
    phone: '5518993334455',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 dias atrás
  },
  {
    id: 'c4',
    name: 'Bruno Souza',
    phone: '5518994445566',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 dias atrás
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 's1',
    clientId: 'c1',
    clientName: 'Carlos Silva',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 dias atrás
    items: [
      {
        productId: 'p4',
        productName: 'Bolo de Pote Ninho com Morango',
        priceAtSale: 14.00,
        quantity: 2
      }
    ],
    totalAmount: 28.00,
    status: 'fiado'
  },
  {
    id: 's2',
    clientId: 'c2',
    clientName: 'Mariana Santos',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
    items: [
      {
        productId: 'p10',
        productName: 'Pipoca Gourmet Leite Ninho',
        priceAtSale: 12.00,
        quantity: 1
      },
      {
        productId: 'p8',
        productName: 'Geladinho Gourmet Ninho com Nutella',
        priceAtSale: 6.00,
        quantity: 2
      }
    ],
    totalAmount: 24.00,
    status: 'pago',
    paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 's3',
    clientId: 'c3',
    clientName: 'Amanda Oliveira',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
    items: [
      {
        productId: 'p1',
        productName: 'Beliscão de Goiabada',
        priceAtSale: 15.00,
        quantity: 1
      },
      {
        productId: 'p5',
        productName: 'Bolo Caseiro de Cenoura com Chocolate',
        priceAtSale: 25.00,
        quantity: 1
      }
    ],
    totalAmount: 40.00,
    status: 'fiado'
  },
  {
    id: 's4',
    clientId: 'c4',
    clientName: 'Bruno Souza',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    items: [
      {
        productId: 'p6',
        productName: 'Torta de Limão Gourmet',
        priceAtSale: 12.00,
        quantity: 1
      }
    ],
    totalAmount: 12.00,
    status: 'pago',
    paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];
