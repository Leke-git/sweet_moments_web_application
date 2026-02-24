import React from 'react';
import { 
  X, ShoppingCart, Inbox, TrendingUp, Check, Trash2, 
  Eye, RefreshCw, Loader2, ChevronDown, ExternalLink,
  Settings, MessageSquare, Shield, Save, ShoppingBag,
  MessageCircle, Plus
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
  const [activeTab, setActiveTab] = React.useState<'orders' | 'enquiries' | 'analytics' | 'config' | 'faqs' | 'support'>('orders');
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [enquiries, setEnquiries] = React.useState<EnquiryData[]>([]);
  const [faqs, setFaqs] = React.useState<FAQ[]>([]);
  const [config, setConfig] = React.useState<BusinessConfig>(initialConfig);
  const [loading, setLoading] = React.useState(true);
  const [analyticsRange, setAnalyticsRange] = React.useState(30);

  const [editingFaq, setEditingFaq] = React.useState<Partial<FAQ> | null>(null);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (supabase) {
        const { error } = await supabase.from('site_config').update({ config }).eq('id', 1);
        if (error) throw error;
        onConfigUpdate(config);
        alert("Site configuration updated successfully!");
      }
    } catch (error) {
      console.error("Config update error:", error);
      alert("Failed to update configuration.");
    }
  };

  const fetchData = React.useCallback(async () => {
    if (!isAdmin) {
      console.error("Unauthorized access attempt to Admin Dashboard");
      onClose();
      return;
    }
    setLoading(true);
    try {
      if (supabase) {
        const [ordersRes, enquiriesRes] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('enquiries').select('*').order('created_at', { ascending: false })
        ]);
        if (ordersRes.data) setOrders(ordersRes.data);
        if (enquiriesRes.data) setEnquiries(enquiriesRes.data);
      }
    } catch (error) {
      console.error("Admin fetch error:", error);
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
      console.error("Status update error:", error);
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

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq?.question || !editingFaq?.answer) return;

    try {
      if (supabase) {
        if (editingFaq.id) {
          await supabase.from('faqs').update(editingFaq).eq('id', editingFaq.id);
        } else {
          await supabase.from('faqs').insert([{ ...editingFaq, order_index: faqs.length }]);
        }
        
        const { data } = await supabase.from('faqs').select('*').order('order_index');
        if (data) setFaqs(data);
        setEditingFaq(null);
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      if (supabase) {
        await supabase.from('faqs').delete().eq('id', id);
        setFaqs(faqs.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  // Analytics Data Preparation
  const filteredOrders = orders.filter(o => {
    const date = parseISO(o.created_at);
    return isWithinInterval(date, {
      start: startOfDay(subDays(new Date(), analyticsRange)),
      end: endOfDay(new Date())
    });
  });

  const revenueData = React.useMemo(() => {
    const days = [...Array(analyticsRange)].map((_, i) => {
      const date = subDays(new Date(), analyticsRange - 1 - i);
      return {
        date: format(date, 'MMM dd'),
        revenue: 0
      };
    });

    filteredOrders.forEach(o => {
      const dayLabel = format(parseISO(o.created_at), 'MMM dd');
      const day = days.find(d => d.date === dayLabel);
      if (day) day.revenue += Number(o.total_price);
    });

    return days;
  }, [filteredOrders, analyticsRange]);

  const statusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const cakeTypeData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        counts[item.selectedCakeType] = (counts[item.selectedCakeType] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    baking: '#a855f7',
    delivered: '#10b981',
    cancelled: '#ef4444'
  };

  return (
    <div className="fixed inset-0 z-[120] bg-bg overflow-y-auto">
      <div className="noise" />
      
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="text-2xl font-serif italic font-bold text-primary">Admin Dashboard</span>
            <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Management Portal</span>
          </div>
          <div className="flex bg-bg dark:bg-black/20 p-1 rounded-xl border border-border">
            {[
              { id: 'orders', icon: <ShoppingCart size={16} />, label: 'Orders' },
              { id: 'enquiries', icon: <Inbox size={16} />, label: 'Enquiries' },
              { id: 'analytics', icon: <TrendingUp size={16} />, label: 'Analytics' },
              { id: 'faqs', icon: <MessageCircle size={16} />, label: 'FAQs' },
              { id: 'support', icon: <MessageSquare size={16} />, label: 'Support' },
              { id: 'config', icon: <Settings size={16} />, label: 'Site Editor' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id ? 'bg-white dark:bg-surface shadow-sm text-primary' : 'text-muted hover:text-dark'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === 'enquiries' && enquiries.filter(e => e.status === 'new').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchData}
            className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={onClose}
            className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 size={48} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-surface rounded-[2.5rem] border border-border shadow-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-bg dark:bg-black/20 border-b border-border">
                      <tr>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">Date</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">Customer</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">Items</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">Total</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">Status</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-bg/50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-6 text-sm text-muted">
                            {format(parseISO(order.created_at), 'MMM dd, HH:mm')}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-dark">{order.customer_name}</span>
                              <span className="text-xs text-muted">{order.customer_email}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-medium text-dark">
                            {order.items.length} {order.items.length === 1 ? 'Cake' : 'Cakes'}
                          </td>
                          <td className="px-8 py-6 font-bold text-primary">
                            £{Number(order.total_price).toFixed(2)}
                          </td>
                          <td className="px-8 py-6">
                            <div className="relative inline-block">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                className={`appearance-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border-0 cursor-pointer focus:ring-2 focus:ring-primary/50 transition-all pr-8`}
                                style={{ 
                                  backgroundColor: `${STATUS_COLORS[order.status]}20`,
                                  color: STATUS_COLORS[order.status]
                                }}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="baking">Baking</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => deleteOrder(order.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'enquiries' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-surface rounded-[2.5rem] border border-border shadow-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-bg dark:bg-black/20 border-b border-border">
                      <tr>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">Date</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">From</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">Subject</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">Status</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-muted font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {enquiries.map(enquiry => (
                        <tr key={enquiry.id} className="hover:bg-bg/50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-6 text-sm text-muted">
                            {enquiry.created_at ? format(parseISO(enquiry.created_at), 'MMM dd') : 'N/A'}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-dark">{enquiry.name}</span>
                              <span className="text-xs text-muted">{enquiry.email}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-medium text-dark">
                            {enquiry.subject}
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              enquiry.status === 'new' ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted'
                            }`}>
                              {enquiry.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                                <ExternalLink size={18} />
                              </button>
                              <button 
                                onClick={() => enquiry.id && deleteEnquiry(enquiry.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { label: 'Total Revenue', value: `£${totalRevenue.toFixed(2)}`, icon: <TrendingUp className="text-green-500" /> },
                    { label: 'Total Orders', value: filteredOrders.length, icon: <ShoppingCart className="text-blue-500" /> },
                    { label: 'Avg Order Value', value: `£${avgOrderValue.toFixed(2)}`, icon: <TrendingUp className="text-purple-500" /> },
                    { label: 'Pending Orders', value: filteredOrders.filter(o => o.status === 'pending').length, icon: <RefreshCw className="text-amber-500" /> }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-widest text-muted font-bold">{stat.label}</span>
                        {stat.icon}
                      </div>
                      <p className="text-3xl font-serif italic font-bold text-dark">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Revenue Chart */}
                  <div className="bg-white dark:bg-surface p-8 rounded-[2.5rem] border border-border shadow-xl space-y-8">
                    <h4 className="text-xl font-serif italic font-bold text-dark">Revenue Over Time</h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ede5dc" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9c8878' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9c8878' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                          />
                          <Line type="monotone" dataKey="revenue" stroke="#c8614a" strokeWidth={3} dot={{ fill: '#c8614a', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Status Pie Chart */}
                  <div className="bg-white dark:bg-surface p-8 rounded-[2.5rem] border border-border shadow-xl space-y-8">
                    <h4 className="text-xl font-serif italic font-bold text-dark">Orders by Status</h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#9c8878'} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Cake Type Bar Chart */}
                  <div className="bg-white dark:bg-surface p-8 rounded-[2.5rem] border border-border shadow-xl space-y-8 lg:col-span-2">
                    <h4 className="text-xl font-serif italic font-bold text-dark">Popular Cake Types</h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cakeTypeData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ede5dc" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9c8878' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9c8878' }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#d4956a" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'config' && (
              <div className="max-w-4xl space-y-12 animate-fade-in">
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif italic font-bold text-dark">Visual Site Editor</h3>
                  <p className="text-muted">Update your bakery's public information, branding, and status instantly.</p>
                </div>

                <form onSubmit={handleUpdateConfig} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted ml-2">Bakery Name</label>
                      <input
                        type="text"
                        value={config.bakeryName}
                        onChange={(e) => setConfig({ ...config, bakeryName: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-black/20 border border-border outline-none focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted ml-2">Contact Email</label>
                      <input
                        type="email"
                        value={config.contactEmail}
                        onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-black/20 border border-border outline-none focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted ml-2">Opening Hours</label>
                      <input
                        type="text"
                        placeholder="e.g. Mon-Fri: 9am-5pm"
                        value={config.openingHours || ''}
                        onChange={(e) => setConfig({ ...config, openingHours: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-black/20 border border-border outline-none focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted ml-2">Delivery Zones</label>
                      <input
                        type="text"
                        placeholder="e.g. Central London, SE Postcodes"
                        value={config.deliveryZones || ''}
                        onChange={(e) => setConfig({ ...config, deliveryZones: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-black/20 border border-border outline-none focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted ml-2">Announcement Banner</label>
                    <textarea
                      value={config.announcement}
                      onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
                      rows={2}
                      className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-black/20 border border-border outline-none focus:border-primary transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted">AI Knowledge Base</label>
                      <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded">PRO TIP: Add flavors, pricing, and allergen info here</span>
                    </div>
                    <textarea
                      value={config.knowledgeBase || ''}
                      onChange={(e) => setConfig({ ...config, knowledgeBase: e.target.value })}
                      rows={6}
                      placeholder="Describe your cakes, flavors, pricing tiers, and any other info the AI should know..."
                      className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-black/20 border border-border outline-none focus:border-primary transition-all shadow-sm font-mono text-sm"
                    />
                  </div>

                  <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/20 flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-dark">Maintenance Mode</h4>
                      <p className="text-sm text-muted">When enabled, customers will see a maintenance message and ordering will be disabled.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, isMaintenance: !config.isMaintenance })}
                      className={`w-16 h-9 rounded-full transition-all relative ${config.isMaintenance ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-all shadow-md ${config.isMaintenance ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-primary text-white px-12 py-5 rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center space-x-3"
                    >
                      <Save size={20} />
                      <span>Save Site Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'faqs' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-serif italic font-semibold text-dark">FAQ Manager</h3>
                  <button 
                    onClick={() => setEditingFaq({ category: 'general' })}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus size={20} />
                    <span>Add FAQ</span>
                  </button>
                </div>

                {editingFaq && (
                  <div className="bg-white dark:bg-surface p-8 rounded-[2rem] border border-primary/20 shadow-2xl">
                    <form onSubmit={handleSaveFaq} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted">Question</label>
                          <input 
                            type="text"
                            value={editingFaq.question || ''}
                            onChange={e => setEditingFaq({...editingFaq, question: e.target.value})}
                            className="w-full px-6 py-4 rounded-xl bg-bg border border-border outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted">Category</label>
                          <select 
                            value={editingFaq.category || 'general'}
                            onChange={e => setEditingFaq({...editingFaq, category: e.target.value as any})}
                            className="w-full px-6 py-4 rounded-xl bg-bg border border-border outline-none focus:border-primary"
                          >
                            <option value="general">General</option>
                            <option value="ordering">Ordering</option>
                            <option value="delivery">Delivery</option>
                            <option value="dietary">Dietary</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted">Answer</label>
                        <textarea 
                          value={editingFaq.answer || ''}
                          onChange={e => setEditingFaq({...editingFaq, answer: e.target.value})}
                          rows={4}
                          className="w-full px-6 py-4 rounded-xl bg-bg border border-border outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button 
                          type="button" 
                          onClick={() => setEditingFaq(null)}
                          className="px-6 py-3 rounded-xl font-bold text-muted hover:text-dark"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                        >
                          Save FAQ
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {faqs.map(faq => (
                    <div key={faq.id} className="bg-white dark:bg-surface p-6 rounded-2xl border border-border flex justify-between items-center group hover:border-primary/30 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {faq.category}
                          </span>
                          <h4 className="font-bold text-dark">{faq.question}</h4>
                        </div>
                        <p className="text-sm text-muted line-clamp-1">{faq.answer}</p>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setEditingFaq(faq)}
                          className="p-2 rounded-lg hover:bg-bg text-muted hover:text-primary"
                        >
                          <Settings size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="p-2 rounded-lg hover:bg-bg text-muted hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 opacity-50">
                <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center">
                  <MessageSquare size={40} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-dark">Support Tickets</h4>
                  <p className="text-muted max-w-xs">Escalated AI chats will appear here for your personal attention.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
