import React from 'react';
import { 
  X, ShoppingCart, Inbox, TrendingUp, Check, Trash2, 
  Eye, RefreshCw, Loader2, ChevronDown, ExternalLink,
  Settings, MessageSquare, Shield, Save, ShoppingBag,
  MessageCircle, Plus, LayoutDashboard
} from '../icons';
import { supabase } from '../lib/supabase';
import { Order, EnquiryData, User, BusinessConfig, FAQ } from '../types';
import { ADMIN_EMAILS } from '../constants';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface AdminDashboardProps {
  onClose: () => void;
  user: User | null;
  initialConfig: BusinessConfig;
  onConfigUpdate: (config: BusinessConfig) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, user, initialConfig, onConfigUpdate }) => {
  const [activeTab, setActiveTab] = React.useState<'orders' | 'enquiries' | 'analytics' | 'config' | 'faqs'>('orders');
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [enquiries, setEnquiries] = React.useState<EnquiryData[]>([]);
  const [faqs, setFaqs] = React.useState<FAQ[]>([]);
  const [config, setConfig] = React.useState<BusinessConfig>(initialConfig);
  const [loading, setLoading] = React.useState(true);
  const [analyticsRange, setAnalyticsRange] = React.useState(30);
  
  // Password Protection State
  const [password, setPassword] = React.useState('');
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setPasswordError('');
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        setIsAuthorized(true);
        sessionStorage.setItem('admin_authorized', 'true');
      } else {
        const data = await response.json();
        setPasswordError(data.error || "Incorrect password");
      }
    } catch (error) {
      setPasswordError("Verification failed. Check your connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  React.useEffect(() => {
    if (sessionStorage.getItem('admin_authorized') === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const isAdmin = true; // Temporarily enabled for testing

  // Dummy Data for Preview
  const DUMMY_ORDERS: Order[] = [
    {
      id: '1',
      user_id: null,
      customer_name: 'Eleanor Rigby',
      customer_email: 'eleanor@example.com',
      customer_phone: '07700 900123',
      items: [{
        id: 'item-1',
        selectedCakeType: 'Wedding Cake',
        selectedSize: '3-Tier (8", 10", 12")',
        cakeFlavor: 'Vanilla Bean',
        filling: 'Raspberry Jam & Buttercream',
        frosting: 'Swiss Meringue Buttercream',
        customMessage: 'Happy Wedding!',
        inspirationImage: null,
        inspirationMimeType: null,
        inspirationUrl: '',
        dietaryReqs: [],
        quantity: 1
      }],
      total_price: 450,
      status: 'pending',
      delivery_method: 'delivery',
      delivery_date: subDays(new Date(), -5).toISOString(),
      delivery_address: '123 Abbey Road, London',
      created_at: subDays(new Date(), 1).toISOString()
    },
    {
      id: '2',
      user_id: null,
      customer_name: 'Jude Harrison',
      customer_email: 'jude@example.com',
      customer_phone: '07700 900456',
      items: [{
        id: 'item-2',
        selectedCakeType: 'Birthday Cake',
        selectedSize: '8" Round',
        cakeFlavor: 'Double Chocolate',
        filling: 'Chocolate Ganache',
        frosting: 'Chocolate Buttercream',
        customMessage: 'Happy Birthday Jude!',
        inspirationImage: null,
        inspirationMimeType: null,
        inspirationUrl: '',
        dietaryReqs: [],
        quantity: 1
      }],
      total_price: 85,
      status: 'confirmed',
      delivery_method: 'pickup',
      delivery_date: subDays(new Date(), -2).toISOString(),
      delivery_address: '',
      created_at: subDays(new Date(), 3).toISOString()
    }
  ];

  const DUMMY_ENQUIRIES: EnquiryData[] = [
    {
      id: '1',
      name: 'Penny Lane',
      email: 'penny@example.com',
      phone: '07700 900789',
      subject: 'Custom Wedding Inquiry',
      message: 'Hi Sarah! I am looking for a 4-tier cake with edible gold leaf for my wedding in September. Do you have availability?',
      created_at: subDays(new Date(), 2).toISOString()
    },
    {
      id: '2',
      name: 'Maxwell Silver',
      email: 'max@example.com',
      phone: '07700 900012',
      subject: 'Birthday Cupcakes',
      message: 'Looking for 24 chocolate cupcakes for a 5th birthday party next Saturday. Can you do a dinosaur theme?',
      created_at: subDays(new Date(), 4).toISOString()
    }
  ];

  const DUMMY_FAQS: FAQ[] = [
    {
      id: '1',
      question: 'How far in advance should I order?',
      answer: 'We recommend ordering at least 2-4 weeks in advance for celebration cakes and 3-6 months for weddings.',
      category: 'ordering',
      order_index: 1
    },
    {
      id: '2',
      question: 'Do you offer delivery?',
      answer: 'Yes, we deliver within London and surrounding areas. Delivery fees depend on the distance.',
      category: 'delivery',
      order_index: 2
    }
  ];

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      if (supabase) {
        const [ordersRes, enquiriesRes, faqsRes] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
          supabase.from('faqs').select('*').order('order_index')
        ]);
        
        // If no real data, use dummy data for preview
        setOrders(ordersRes.data && ordersRes.data.length > 0 ? ordersRes.data : DUMMY_ORDERS);
        setEnquiries(enquiriesRes.data && enquiriesRes.data.length > 0 ? enquiriesRes.data : DUMMY_ENQUIRIES);
        setFaqs(faqsRes.data && faqsRes.data.length > 0 ? faqsRes.data : DUMMY_FAQS);
      }
    } catch (error) {
      console.error("Admin fetch error:", error);
      // Fallback to dummy data on error
      setOrders(DUMMY_ORDERS);
      setEnquiries(DUMMY_ENQUIRIES);
      setFaqs(DUMMY_FAQS);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      if (supabase) {
        await supabase.from('orders').update({ status }).eq('id', id);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      }
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      if (supabase) {
        await supabase.from('orders').delete().eq('id', id);
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    } catch (error) {
      console.error("Delete order error:", error);
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      if (supabase) {
        await supabase.from('enquiries').delete().eq('id', id);
        setEnquiries(prev => prev.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error("Delete enquiry error:", error);
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (supabase) {
        const { error } = await supabase.from('site_config').update({ config }).eq('id', 1);
        if (error) throw error;
        onConfigUpdate(config);
        alert("Configuration updated successfully!");
      }
    } catch (error) {
      console.error("Config update error:", error);
      alert("Failed to update configuration.");
    }
  };

  // Analytics Data Processing
  const getAnalyticsData = () => {
    const now = new Date();
    const startDate = subDays(startOfDay(now), analyticsRange);
    
    const dailyData: any[] = [];
    for (let i = 0; i <= analyticsRange; i++) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM dd');
      
      const dayOrders = orders.filter(o => {
        const orderDate = parseISO(o.created_at);
        return isWithinInterval(orderDate, {
          start: startOfDay(date),
          end: endOfDay(date)
        });
      });

      dailyData.unshift({
        name: dateStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.total_price, 0)
      });
    }
    return dailyData;
  };

  const getStatusData = () => {
    const statuses = ['pending', 'confirmed', 'baking', 'delivered', 'cancelled'];
    return statuses.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: orders.filter(o => o.status === status).length
    }));
  };

  const COLORS_CHART = ['#c8614a', '#d4956a', '#9c8878', '#2c1a0e', '#ede5dc'];

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[200] bg-bg flex items-center justify-center p-4">
        <div className="noise opacity-20" />
        <div className="bg-white dark:bg-surface w-full max-w-md rounded-[3rem] shadow-2xl relative overflow-hidden p-12 text-center space-y-8">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield size={32} />
            </div>
            <h2 className="text-3xl font-serif italic font-bold text-dark">Admin Access</h2>
            <p className="text-muted">Please enter your password to continue.</p>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold uppercase tracking-widest text-muted ml-4">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-2xl bg-bg border border-border focus:border-primary outline-none transition-all text-dark"
              />
              {passwordError && <p className="text-red-500 text-xs ml-4 mt-1">{passwordError}</p>}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-muted hover:bg-black/5 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isVerifying}
                type="submit"
                className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isVerifying ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    <span>Unlock</span>
                    <Check size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <p className="text-[10px] text-muted uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-bg flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="noise opacity-20" />
      
      {/* Header */}
      <header className="h-20 border-b border-border bg-white/80 backdrop-blur-md flex items-center justify-between px-8 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-serif italic font-bold text-dark">Admin Dashboard</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold">
              {isAdmin ? 'Authorized Administrator' : 'Guest View (Read-Only)'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => {
              sessionStorage.removeItem('admin_authorized');
              setIsAuthorized(false);
              setPassword('');
            }}
            className="p-3 rounded-full hover:bg-black/5 transition-colors text-muted"
            title="Lock Dashboard"
          >
            <Shield size={20} />
          </button>
          <button 
            onClick={onClose}
            className="p-3 rounded-full hover:bg-black/5 transition-colors text-dark"
          >
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-white/50 p-6 space-y-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-black/5 text-muted'}`}
          >
            <ShoppingCart size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">Orders</span>
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="ml-auto bg-white/20 text-[10px] px-2 py-0.5 rounded-full">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('enquiries')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'enquiries' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-black/5 text-muted'}`}
          >
            <Inbox size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">Enquiries</span>
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-black/5 text-muted'}`}
          >
            <TrendingUp size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'config' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-black/5 text-muted'}`}
          >
            <Settings size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">Settings</span>
          </button>
          <button 
            onClick={() => setActiveTab('faqs')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'faqs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-black/5 text-muted'}`}
          >
            <MessageCircle size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">FAQs</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-bg/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-xs uppercase tracking-widest text-muted font-bold">Synchronizing Data...</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8">
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif italic font-bold text-dark">Order Management</h2>
                    <button onClick={fetchData} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                      <RefreshCw size={18} className="text-muted" />
                    </button>
                  </div>
                  
                  <div className="grid gap-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-dark">{order.customer_name}</span>
                              <span className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted">{order.customer_email} • {order.customer_phone}</p>
                            <p className="text-[10px] text-muted uppercase tracking-wider">
                              {format(parseISO(order.created_at), 'PPP p')}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                              className="text-xs font-bold uppercase tracking-widest bg-bg border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="baking">Baking</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button 
                              onClick={() => deleteOrder(order.id)}
                              className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted">Order Details</h4>
                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center space-x-3 text-sm">
                                  <div className="w-8 h-8 bg-bg rounded-lg flex items-center justify-center text-xs font-bold">
                                    {item.quantity}x
                                  </div>
                                  <div>
                                    <p className="font-bold text-dark">{item.selectedCakeType} ({item.selectedSize})</p>
                                    <p className="text-[10px] text-muted">{item.cakeFlavor} • {item.filling}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted">Logistics</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-muted">Method:</span> <span className="font-bold capitalize">{order.delivery_method}</span></p>
                              <p><span className="text-muted">Date:</span> <span className="font-bold">{format(parseISO(order.delivery_date), 'PPP')}</span></p>
                              {order.delivery_address && (
                                <p><span className="text-muted">Address:</span> <span className="font-bold">{order.delivery_address}</span></p>
                              )}
                              <p className="pt-2 text-lg font-serif italic font-bold text-primary">
                                Total: £{order.total_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'enquiries' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif italic font-bold text-dark">Customer Enquiries</h2>
                    <button onClick={fetchData} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                      <RefreshCw size={18} className="text-muted" />
                    </button>
                  </div>
                  
                  <div className="grid gap-4">
                    {enquiries.map(enquiry => (
                      <div key={enquiry.id} className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-bold text-dark">{enquiry.subject}</h3>
                            <p className="text-xs text-muted">From: {enquiry.name} ({enquiry.email})</p>
                            <p className="text-[10px] text-muted uppercase tracking-wider">
                              {enquiry.created_at && format(parseISO(enquiry.created_at), 'PPP p')}
                            </p>
                          </div>
                          <button 
                            onClick={() => deleteEnquiry(enquiry.id!)}
                            className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="mt-4 p-4 bg-bg rounded-2xl text-sm text-dark/80 leading-relaxed italic">
                          "{enquiry.message}"
                        </div>
                        <div className="mt-4 flex justify-end">
                          <a 
                            href={`mailto:${enquiry.email}?subject=Re: ${enquiry.subject}`}
                            className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                          >
                            <span>Reply via Email</span>
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif italic font-bold text-dark">Business Insights</h2>
                    <select 
                      value={analyticsRange}
                      onChange={(e) => setAnalyticsRange(Number(e.target.value))}
                      className="text-xs font-bold uppercase tracking-widest bg-white border border-border rounded-xl px-4 py-2 outline-none"
                    >
                      <option value={7}>Last 7 Days</option>
                      <option value={30}>Last 30 Days</option>
                      <option value={90}>Last 90 Days</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted mb-1">Total Orders</p>
                      <p className="text-3xl font-serif italic font-bold text-dark">{orders.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted mb-1">Total Revenue</p>
                      <p className="text-3xl font-serif italic font-bold text-primary">£{orders.reduce((sum, o) => sum + o.total_price, 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted mb-1">Avg. Order Value</p>
                      <p className="text-3xl font-serif italic font-bold text-dark">
                        £{orders.length ? (orders.reduce((sum, o) => sum + o.total_price, 0) / orders.length).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-dark mb-8">Order Volume & Revenue</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getAnalyticsData()}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9c8878'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9c8878'}} />
                            <Tooltip 
                              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#c8614a" strokeWidth={3} dot={{r: 4, fill: '#c8614a'}} />
                            <Line type="monotone" dataKey="orders" stroke="#d4956a" strokeWidth={3} dot={{r: 4, fill: '#d4956a'}} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-dark mb-8">Order Status Distribution</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getStatusData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getStatusData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'config' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-serif italic font-bold text-dark">Business Configuration</h2>
                  
                  <form onSubmit={handleUpdateConfig} className="bg-white p-10 rounded-[3rem] border border-border shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-muted ml-4">Bakery Name</label>
                        <input 
                          type="text"
                          value={config.bakeryName}
                          onChange={(e) => setConfig({...config, bakeryName: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-bg border border-border focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-muted ml-4">Contact Email</label>
                        <input 
                          type="email"
                          value={config.contactEmail}
                          onChange={(e) => setConfig({...config, contactEmail: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-bg border border-border focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted ml-4">Announcement Banner</label>
                      <input 
                        type="text"
                        value={config.announcement}
                        onChange={(e) => setConfig({...config, announcement: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-bg border border-border focus:border-primary outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-muted ml-4">Opening Hours</label>
                        <input 
                          type="text"
                          value={config.openingHours}
                          onChange={(e) => setConfig({...config, openingHours: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-bg border border-border focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-muted ml-4">Delivery Zones</label>
                        <input 
                          type="text"
                          value={config.deliveryZones}
                          onChange={(e) => setConfig({...config, deliveryZones: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-bg border border-border focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted ml-4">AI Knowledge Base (Bakery Specialties & Rules)</label>
                      <textarea 
                        rows={6}
                        value={config.knowledgeBase}
                        onChange={(e) => setConfig({...config, knowledgeBase: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-bg border border-border focus:border-primary outline-none transition-all resize-none"
                        placeholder="Describe your bakery's rules, signature flavors, and ordering requirements for the AI agent..."
                      />
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="checkbox"
                          id="maintenance"
                          checked={config.isMaintenance}
                          onChange={(e) => setConfig({...config, isMaintenance: e.target.checked})}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="maintenance" className="text-sm font-bold text-dark">Enable Maintenance Mode</label>
                      </div>
                      
                      <button 
                        type="submit"
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center space-x-2"
                      >
                        <Save size={20} />
                        <span>Save Configuration</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {activeTab === 'faqs' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif italic font-bold text-dark">FAQ Management</h2>
                    <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center space-x-2">
                      <Plus size={18} />
                      <span>Add New FAQ</span>
                    </button>
                  </div>
                  
                  <div className="grid gap-4">
                    {faqs.map((faq, idx) => (
                      <div key={faq.id || idx} className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-[10px] font-mono text-muted bg-bg px-2 py-1 rounded">#{faq.order_index}</span>
                              <h3 className="font-bold text-dark">{faq.question}</h3>
                            </div>
                            <p className="text-sm text-muted leading-relaxed">{faq.answer}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button className="p-2 text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                              <Settings size={18} />
                            </button>
                            <button className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
