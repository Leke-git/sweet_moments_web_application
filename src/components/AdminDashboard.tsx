import React from 'react';
import { 
  X, ShoppingCart, Inbox, TrendingUp, Check, Trash2, 
  Eye, RefreshCw, Loader2, ChevronDown, ExternalLink 
} from '../icons';
import { supabase } from '../lib/supabase';
import { Order, EnquiryData } from '../types';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'orders' | 'enquiries' | 'analytics'>('orders');
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [enquiries, setEnquiries] = React.useState<EnquiryData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [analyticsRange, setAnalyticsRange] = React.useState(30);

  const fetchData = React.useCallback(async () => {
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
              { id: 'analytics', icon: <TrendingUp size={16} />, label: 'Analytics' }
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
          </div>
        )}
      </div>
    </div>
  );
};
