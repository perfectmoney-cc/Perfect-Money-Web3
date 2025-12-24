import { useState, useEffect } from 'react';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  voucherCode?: string;
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useOrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('pmStoreOrders');
    if (saved) {
      const parsed = JSON.parse(saved);
      setOrders(parsed.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt)
      })));
    }
  }, []);

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...order,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setOrders(prev => {
      const updated = [newOrder, ...prev].slice(0, 100);
      localStorage.setItem('pmStoreOrders', JSON.stringify(updated));
      return updated;
    });
    
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], txHash?: string) => {
    setOrders(prev => {
      const updated = prev.map(order => 
        order.id === orderId 
          ? { ...order, status, txHash: txHash || order.txHash, updatedAt: new Date() } 
          : order
      );
      localStorage.setItem('pmStoreOrders', JSON.stringify(updated));
      return updated;
    });
  };

  const getOrderByNumber = (orderNumber: string) => {
    return orders.find(order => order.orderNumber === orderNumber);
  };

  return {
    orders,
    addOrder,
    updateOrderStatus,
    getOrderByNumber
  };
};
