import React from 'react';
import { 
  X, ChevronLeft, ChevronRight, Check, Loader2, Sparkles, 
  ImageIcon, Info, Plus, Minus, Calendar, MapPin, ShoppingCart 
} from '../icons';
import { SiteConfig, OrderFormData, CakeItem } from '../types';
import { generateCakeVisualMockup, explainCakeTerm } from '../services/gemini';
import { supabase } from '../lib/supabase';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

interface OrderWizardProps {
  config: SiteConfig;
  onClose: () => void;
  userEmail?: string;
}

export const OrderWizard: React.FC<OrderWizardProps> = ({ config, onClose, userEmail }) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGeneratingMockup, setIsGeneratingMockup] = React.useState(false);
  const [explanation, setExplanation] = React.useState<{ term: string, text: string } | null>(null);
  const [isExplaining, setIsExplaining] = React.useState(false);
  const [orderComplete, setOrderComplete] = React.useState(false);

  const [formData, setFormData] = React.useState<OrderFormData>({
    items: [{
      id: Math.random().toString(36).substr(2, 9),
      selectedCakeType: config.cake_types[0].id,
      selectedSize: config.sizes[0].id,
      quantity: 1,
      cakeFlavor: config.cake_flavours[0],
      filling: config.fillings[0],
      frosting: config.frosting_types[0],
      customMessage: '',
      inspirationImage: null,
      inspirationMimeType: null,
      inspirationUrl: '',
      dietaryReqs: [],
      mockupUrl: null
    }],
    customerName: '',
    customerEmail: userEmail || '',
    customerPhone: '',
    deliveryMethod: '',
    deliveryDate: format(addDays(new Date(), config.min_days_notice), 'yyyy-MM-dd'),
    deliveryAddress: ''
  });

  const activeItem = formData.items[0];

  const updateActiveItem = (updates: Partial<CakeItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, idx) => idx === 0 ? { ...item, ...updates } : item)
    }));
  };

  const calculateItemPrice = (item: CakeItem) => {
    const type = config.cake_types.find(t => t.id === item.selectedCakeType);
    const size = config.sizes.find(s => s.id === item.selectedSize);
    if (!type || !size) return 0;

    let price = type.base_price * size.multiplier * item.quantity;
    price += item.dietaryReqs.length * config.surcharges.dietary_per_item;
    if (item.frosting === 'Fondant') price += config.surcharges.fondant_premium;
    
    return price;
  };

  const totalPrice = formData.items.reduce((sum, item) => sum + calculateItemPrice(item), 0) + 
    (formData.deliveryMethod === 'delivery' ? config.surcharges.delivery_fee : 0);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 8));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        updateActiveItem({
          inspirationImage: base64String,
          inspirationMimeType: file.type,
          inspirationUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateMockup = async () => {
    setIsGeneratingMockup(true);
    const mockup = await generateCakeVisualMockup({
      type: config.cake_types.find(t => t.id === activeItem.selectedCakeType)?.name || '',
      flavor: activeItem.cakeFlavor,
      filling: activeItem.filling,
      frosting: activeItem.frosting,
      message: activeItem.customMessage,
      inspirationImage: activeItem.inspirationImage ? {
        data: activeItem.inspirationImage,
        mimeType: activeItem.inspirationMimeType || 'image/png'
      } : undefined
    });
    updateActiveItem({ mockupUrl: mockup });
    setIsGeneratingMockup(false);
  };

  const handleExplain = async (term: string, category: string) => {
    setIsExplaining(true);
    const text = await explainCakeTerm(term, category);
    setExplanation({ term, text });
    setIsExplaining(false);
  };

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.customerName || !formData.customerEmail || !formData.deliveryMethod) {
      alert("Please fill in all required contact and delivery details.");
      setCurrentStep(7);
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user ID if logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      const orderData = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        delivery_method: formData.deliveryMethod,
        delivery_date: formData.deliveryDate,
        delivery_address: formData.deliveryAddress,
        items: formData.items,
        total_price: totalPrice,
        status: 'pending',
        user_id: session?.user?.id || null
      };

      if (supabase) {
        const { error } = await supabase.from('orders').insert([orderData]);
        if (error) throw error;
      }

      // Trigger n8n via Secure Server Proxy
      await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }).catch(err => console.error("Order notification failed:", err));

      setOrderComplete(true);
    } catch (error) {
      console.error("Order submission failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 step-reveal">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-serif italic font-bold text-dark">Select Your Canvas</h3>
              <p className="text-muted">Choose the base style for your custom creation.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {config.cake_types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => updateActiveItem({ selectedCakeType: type.id })}
                  className={`relative p-6 rounded-3xl border-2 text-left transition-all ${
                    activeItem.selectedCakeType === type.id 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-border hover:border-primary/30 bg-white dark:bg-surface'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl">{type.emoji}</span>
                    <span className="text-lg font-bold text-primary">From £{type.base_price}</span>
                  </div>
                  <h4 className="text-xl font-serif italic font-bold text-dark mb-2">{type.name}</h4>
                  <p className="text-sm text-muted leading-relaxed">{type.description}</p>
                  {activeItem.selectedCakeType === type.id && (
                    <div className="absolute top-4 right-4 text-primary">
                      <Check size={20} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 step-reveal">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-serif italic font-bold text-dark">Choose the Scale</h3>
              <p className="text-muted">How many guests are we celebrating with?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {config.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => updateActiveItem({ selectedSize: size.id })}
                  className={`p-8 rounded-3xl border-2 text-center transition-all ${
                    activeItem.selectedSize === size.id 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-border hover:border-primary/30 bg-white dark:bg-surface'
                  }`}
                >
                  <h4 className="text-2xl font-serif italic font-bold text-dark mb-1">{size.label}</h4>
                  <p className="text-primary font-bold mb-4">Up to {size.servings} servings</p>
                  <div className="text-sm text-muted">
                    £{(config.cake_types.find(t => t.id === activeItem.selectedCakeType)!.base_price * size.multiplier).toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex flex-col items-center space-y-4 pt-8">
              <span className="text-sm font-bold uppercase tracking-widest text-muted">Quantity</span>
              <div className="flex items-center space-x-8">
                <button 
                  onClick={() => updateActiveItem({ quantity: Math.max(1, activeItem.quantity - 1) })}
                  className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                >
                  <Minus size={20} />
                </button>
                <span className="text-3xl font-serif italic font-bold">{activeItem.quantity}</span>
                <button 
                  onClick={() => updateActiveItem({ quantity: activeItem.quantity + 1 })}
                  className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 step-reveal">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-serif italic font-bold text-dark">Flavour & Filling</h3>
              <p className="text-muted">The heart of the experience. Select your preferred combination.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="font-bold uppercase tracking-widest text-xs text-muted">Cake Flavour</h4>
                <div className="flex flex-wrap gap-3">
                  {config.cake_flavours.map((f) => (
                    <button
                      key={f}
                      onClick={() => updateActiveItem({ cakeFlavor: f })}
                      className={`px-6 py-3 rounded-full border-2 transition-all flex items-center space-x-2 ${
                        activeItem.cakeFlavor === f ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span>{f}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleExplain(f, 'flavour'); }}
                        className={`p-1 rounded-full ${activeItem.cakeFlavor === f ? 'hover:bg-white/20' : 'hover:bg-black/5'}`}
                      >
                        <Info size={14} />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold uppercase tracking-widest text-xs text-muted">Filling</h4>
                <div className="flex flex-wrap gap-3">
                  {config.fillings.map((f) => (
                    <button
                      key={f}
                      onClick={() => updateActiveItem({ filling: f })}
                      className={`px-6 py-3 rounded-full border-2 transition-all flex items-center space-x-2 ${
                        activeItem.filling === f ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span>{f}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleExplain(f, 'filling'); }}
                        className={`p-1 rounded-full ${activeItem.filling === f ? 'hover:bg-white/20' : 'hover:bg-black/5'}`}
                      >
                        <Info size={14} />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {explanation && (
              <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl animate-fade-in">
                <div className="flex items-center space-x-2 text-accent mb-2">
                  <Sparkles size={16} />
                  <span className="font-bold text-sm uppercase tracking-widest">Sarah's Note on {explanation.term}</span>
                </div>
                <p className="text-muted italic leading-relaxed">{explanation.text}</p>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 step-reveal">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-serif italic font-bold text-dark">Frosting & Colour</h3>
              <p className="text-muted">Setting the aesthetic tone for your masterpiece.</p>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="font-bold uppercase tracking-widest text-xs text-muted">Frosting Type</h4>
                <div className="flex flex-wrap gap-3">
                  {config.frosting_types.map((f) => (
                    <button
                      key={f}
                      onClick={() => updateActiveItem({ frosting: f })}
                      className={`px-6 py-3 rounded-full border-2 transition-all flex items-center space-x-2 ${
                        activeItem.frosting === f ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span>{f}</span>
                      {f === 'Fondant' && <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">+£35</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold uppercase tracking-widest text-xs text-muted">Colour Palette</h4>
                <div className="flex flex-wrap gap-6">
                  {config.colour_options.map((c) => (
                    <button
                      key={c}
                      className="flex flex-col items-center space-y-2 group"
                      onClick={() => {}} // Placeholder for colour selection if needed
                    >
                      <div className={`w-12 h-12 rounded-full border-4 border-white dark:border-surface shadow-md transition-transform group-hover:scale-110 ${
                        c === 'Natural White' ? 'bg-white' : 
                        c === 'Blush Pink' ? 'bg-[#f8d7da]' :
                        c === 'Sage Green' ? 'bg-[#d4edda]' :
                        c === 'Dusty Blue' ? 'bg-[#d1ecf1]' : 'bg-[#e2e3e5]'
                      }`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 step-reveal">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-serif italic font-bold text-dark">Custom Details</h3>
              <p className="text-muted">Add your personal touch and see it come to life.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Inscription</label>
                  <input
                    type="text"
                    value={activeItem.customMessage}
                    onChange={(e) => updateActiveItem({ customMessage: e.target.value })}
                    placeholder="e.g. Happy Birthday Eleanor"
                    className="w-full px-6 py-4 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all text-dark dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Inspiration Image</label>
                  <div className="relative h-48 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center space-y-2 hover:border-primary/50 transition-all cursor-pointer overflow-hidden group">
                    {activeItem.inspirationUrl ? (
                      <img src={activeItem.inspirationUrl} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-muted" />
                        <span className="text-sm text-muted">Click to upload image</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerateMockup}
                  disabled={isGeneratingMockup}
                  className="w-full bg-accent text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {isGeneratingMockup ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Generate AI Mockup</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white dark:bg-black/20 border border-border flex items-center justify-center">
                {activeItem.mockupUrl ? (
                  <div className="relative w-full h-full group">
                    <img src={activeItem.mockupUrl} className="w-full h-full object-cover animate-fade-in" />
                    <div className="absolute bottom-6 left-6 right-6 p-4 glass rounded-2xl border border-white/20 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-dark">AI Mockup</span>
                      <div className="flex space-x-2">
                        <button className="p-2 rounded-full bg-green-500 text-white"><Check size={16} /></button>
                        <button className="p-2 rounded-full bg-red-500 text-white"><X size={16} /></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-12 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto">
                      <Sparkles size={40} />
                    </div>
                    <p className="text-muted italic">"Your vision, rendered by our AI artisan. Fill in the details to see a preview."</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8 step-reveal">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-serif italic font-bold text-dark">Dietary Requirements</h3>
              <p className="text-muted">We ensure everyone can enjoy a slice of the magic.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {config.dietary_options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    const current = activeItem.dietaryReqs;
                    const next = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
                    updateActiveItem({ dietaryReqs: next });
                  }}
                  className={`p-6 rounded-3xl border-2 flex justify-between items-center transition-all ${
                    activeItem.dietaryReqs.includes(opt) 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/30 bg-white dark:bg-surface'
                  }`}
                >
                  <span className="font-bold text-dark">{opt}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-primary">+£10</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      activeItem.dietaryReqs.includes(opt) ? 'bg-primary border-primary text-white' : 'border-border'
                    }`}>
                      {activeItem.dietaryReqs.includes(opt) && <Check size={14} />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-8 step-reveal">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-serif italic font-bold text-dark">Delivery & Contact</h3>
              <p className="text-muted">The final details before we start preheating the oven.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-1 bg-white dark:bg-black/20 rounded-2xl border border-border">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'pickup' }))}
                    className={`py-3 rounded-xl font-bold transition-all ${formData.deliveryMethod === 'pickup' ? 'bg-white dark:bg-surface shadow-md text-primary' : 'text-muted'}`}
                  >
                    Pickup
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'delivery' }))}
                    className={`py-3 rounded-xl font-bold transition-all ${formData.deliveryMethod === 'delivery' ? 'bg-white dark:bg-surface shadow-md text-primary' : 'text-muted'}`}
                  >
                    Delivery (+£25)
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Delivery/Pickup Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                      min={format(addDays(new Date(), config.min_days_notice), 'yyyy-MM-dd')}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all text-dark dark:text-white"
                    />
                  </div>
                </div>

                {formData.deliveryMethod === 'delivery' && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-muted" size={20} />
                      <textarea
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                        placeholder="Enter full address..."
                        rows={3}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all resize-none text-dark dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Full Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-6 py-4 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all text-dark dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Email Address</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="eleanor@example.com"
                    className="w-full px-6 py-4 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all text-dark dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+44 7000 000000"
                    className="w-full px-6 py-4 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all text-dark dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-8 step-reveal">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-serif italic font-bold text-dark">Review & Confirm</h3>
              <p className="text-muted">Double check your bespoke order details.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-surface p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{config.cake_types.find(t => t.id === item.selectedCakeType)?.emoji}</span>
                        <div>
                          <h4 className="text-2xl font-serif italic font-bold text-dark">
                            {config.cake_types.find(t => t.id === item.selectedCakeType)?.name}
                          </h4>
                          <p className="text-muted">{config.sizes.find(s => s.id === item.selectedSize)?.label} • {item.quantity}x</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-primary">£{calculateItemPrice(item).toFixed(2)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Flavour & Filling</span>
                        <p className="text-dark font-medium">{item.cakeFlavor} with {item.filling}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Frosting</span>
                        <p className="text-dark font-medium">{item.frosting}</p>
                      </div>
                      {item.customMessage && (
                        <div className="col-span-2 space-y-1">
                          <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Inscription</span>
                          <p className="text-dark font-medium italic">"{item.customMessage}"</p>
                        </div>
                      )}
                      {item.dietaryReqs.length > 0 && (
                        <div className="col-span-2 space-y-1">
                          <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Dietary</span>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.dietaryReqs.map(r => (
                              <span key={r} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-8">
                <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl space-y-6">
                  <h4 className="text-xl font-serif italic font-bold">Order Summary</h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between opacity-80">
                      <span>Subtotal</span>
                      <span>£{(totalPrice - (formData.deliveryMethod === 'delivery' ? 25 : 0)).toFixed(2)}</span>
                    </div>
                    {formData.deliveryMethod === 'delivery' && (
                      <div className="flex justify-between opacity-80">
                        <span>Delivery Fee</span>
                        <span>£25.00</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-white/20 flex justify-between text-2xl font-serif italic font-bold">
                      <span>Total</span>
                      <span>£{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface p-8 rounded-[2.5rem] border border-border shadow-sm space-y-4">
                  <h4 className="font-bold uppercase tracking-widest text-xs text-muted">Delivery Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3 text-dark">
                      <Calendar size={16} className="text-primary" />
                      <span>{format(new Date(formData.deliveryDate), 'EEEE, MMMM do yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-dark">
                      <MapPin size={16} className="text-primary" />
                      <span>{formData.deliveryMethod === 'delivery' ? formData.deliveryAddress : 'Pickup from London Kitchen'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-dark">
                      <ShoppingCart size={16} className="text-primary" />
                      <span className="capitalize">{formData.deliveryMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (orderComplete) {
    return (
      <div className="fixed inset-0 z-[100] bg-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mx-auto">
            <Check size={48} className="draw-check" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-serif italic font-bold text-dark">Sweet Success!</h2>
            <p className="text-muted leading-relaxed">
              Your bespoke order has been received. Sarah will review the details and contact you shortly to confirm.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-surface rounded-3xl border border-border shadow-sm">
            <span className="text-[10px] uppercase tracking-widest text-muted font-bold block mb-2">Order Reference</span>
            <span className="text-2xl font-mono font-bold text-primary">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-bg overflow-y-auto no-scrollbar">
      <div className="noise" />
      
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border px-4 sm:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <span className="text-xl font-serif italic font-bold text-primary">Order Wizard</span>
            <div className="flex space-x-1 mt-1">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i + 1 <= currentStep ? 'w-6 bg-primary' : 'w-2 bg-border'
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {renderStep()}
          </div>

          {/* Sidebar Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white dark:bg-surface p-8 rounded-[2.5rem] border border-border shadow-xl space-y-6">
                <h4 className="font-bold uppercase tracking-widest text-xs text-muted">Current Selection</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{config.cake_types.find(t => t.id === activeItem.selectedCakeType)?.emoji}</span>
                    <div>
                      <p className="font-bold text-dark">{config.cake_types.find(t => t.id === activeItem.selectedCakeType)?.name}</p>
                      <p className="text-xs text-muted">{config.sizes.find(s => s.id === activeItem.selectedSize)?.label} Size</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Base Price</span>
                      <span className="font-medium">£{calculateItemPrice(activeItem).toFixed(2)}</span>
                    </div>
                    {formData.deliveryMethod === 'delivery' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Delivery</span>
                        <span className="font-medium">£25.00</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-serif italic font-bold text-primary pt-2">
                      <span>Total</span>
                      <span>£{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {activeItem.mockupUrl && (
                <div className="rounded-[2.5rem] overflow-hidden border border-border shadow-xl animate-fade-in">
                  <img src={activeItem.mockupUrl} className="w-full h-48 object-cover" />
                  <div className="p-4 bg-white dark:bg-surface text-center">
                    <span className="text-[10px] uppercase tracking-widest text-muted font-bold">AI Visual Mockup</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 w-full glass border-t border-border p-4 sm:p-6 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 text-dark font-bold disabled:opacity-30 px-6 py-3 rounded-full hover:bg-black/5 transition-all"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>

          <div className="lg:hidden text-center">
            <span className="text-xl font-serif italic font-bold text-primary">£{totalPrice.toFixed(2)}</span>
          </div>

          {currentStep === 8 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all flex items-center space-x-3 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (
                <>
                  <span>Place Order</span>
                  <Check size={20} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-primary text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all flex items-center space-x-3 group"
            >
              <span>Next Step</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
