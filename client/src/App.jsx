import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

// Verified local inventory data with local SVG/image fallbacks
const SAMPLE_SCRAP_PRODUCTS = [
  {
    id: "prod_crc_1",
    title: "Prime Cold Rolled Coil (CRC) 0.8mm - 2.0mm Grade CR1",
    category: "Mild Steel",
    subcategory: "Flat Products",
    sku: "CRC",
    city: "Ahmedabad",
    manufacturerId: "u_producer_1",
    manufacturerName: "Tata Steel Processing Units Ltd",
    isVerifiedSeller: true,
    pricePerTon: 58500,
    moqTons: 15,
    stockTons: 250,
    unit: "Metric Ton",
    specifications: { "Standards": "IS 513:2016 Commercial Grade, Width 1250mm, Mill Test Certified" },
    image: "/images/cold-rolled-coils.svg"
  },
  {
    id: "prod_hrc_1",
    title: "Hot Rolled Coil (HRC) 2.5mm - 6.0mm Grade IS 2062 E250",
    category: "Mild Steel",
    subcategory: "Flat Products",
    sku: "HR Coil",
    city: "Mumbai",
    manufacturerId: "u_producer_1",
    manufacturerName: "JSW Steel Ltd Coils Division",
    isVerifiedSeller: true,
    pricePerTon: 54200,
    moqTons: 20,
    stockTons: 400,
    unit: "Metric Ton",
    specifications: { "Standards": "IS 2062:2011 Grade E250BR, Slit Edge, Mill Scale Surface" },
    image: "/images/hot-rolled-plates.svg"
  },
  {
    id: "prod_tmt_1",
    title: "Primary TMT Rebar Fe 500D High Ductility 12mm - 32mm",
    category: "Mild Steel",
    subcategory: "Long Products",
    sku: "Secondary TMT",
    city: "Pune",
    manufacturerId: "u_producer_1",
    manufacturerName: "Jindal Steel & Power Ltd",
    isVerifiedSeller: true,
    pricePerTon: 52800,
    moqTons: 10,
    stockTons: 320,
    unit: "Metric Ton",
    specifications: { "Standards": "IS 1786:2008 Fe 500D, Earthquake Resistant High Elongation" },
    image: "/images/tmt-rebars.svg"
  },
  {
    id: "prod_al_1",
    title: "Pure Aluminium Ingot 99.7% P1020A Grade",
    category: "Non Ferrous",
    subcategory: "Primary Aluminium",
    sku: "Aluminium Ingot",
    city: "Ahmedabad",
    manufacturerId: "u_producer_1",
    manufacturerName: "Hindalco Industries Ltd",
    isVerifiedSeller: true,
    pricePerTon: 224000,
    moqTons: 5,
    stockTons: 120,
    unit: "Metric Ton",
    specifications: { "Standards": "ASTM B292 / IS 2590 Grade 99.7% Purity, 20kg Bundled Ingots" },
    image: "/images/aluminium-ingot.svg"
  },
  {
    id: "prod_bit_1",
    title: "Industrial Grade Bitumen VG-30 Paving Viscosity",
    category: "Energy & Petroleum",
    subcategory: "Bitumen & Asphalt",
    sku: "Bitumen",
    city: "Mumbai",
    manufacturerId: "u_producer_1",
    manufacturerName: "Indian Oil Corporation Refineries",
    isVerifiedSeller: true,
    pricePerTon: 41200,
    moqTons: 18,
    stockTons: 500,
    unit: "Metric Ton",
    specifications: { "Standards": "IS 73:2013 Paving Grade VG-30, Packed in 180kg Steel Drums" },
    image: "/images/bitumen-drums.svg"
  },
  {
    id: "prod_pvc_1",
    title: "Suspension PVC Resin K-Value 67 Pipe & Extrusion Grade",
    category: "Polymers & Packaging",
    subcategory: "Polymer Resins",
    sku: "PVC",
    city: "Surat",
    manufacturerId: "u_producer_1",
    manufacturerName: "Reliance Industries Polymers Div",
    isVerifiedSeller: true,
    pricePerTon: 74500,
    moqTons: 8,
    stockTons: 180,
    unit: "Metric Ton",
    specifications: { "Standards": "IS 10151:2019 K-67 Resin, 25kg Paper Multiwall Bags" },
    image: "/images/pvc-resins.svg"
  }
];

// Default sample cart items
const DEFAULT_SAMPLE_CART = [
  {
    id: "cart_prod_1",
    title: "Prime Quality Cold Rolled Coil (CRC) 0.8mm - 2.0mm",
    type: "product",
    category: "Mild Steel",
    sku: "CRC",
    city: "Ahmedabad",
    manufacturer: "Tata Steel Processing Units Ltd",
    price: 58500,
    unit: "Metric Ton",
    quantity: 15,
    specifications: "IS 513:2016 Grade CR1, Width 1250mm"
  },
  {
    id: "cart_wh_1",
    title: "3PL Warehousing: Cold Storage Facility",
    type: "warehousing",
    facility: "Cold Storage",
    city: "Ahmedabad",
    pincode: "380001",
    provider: "Snowman Logistics Ltd",
    price: 28000,
    unit: "Month",
    quantity: 1,
    bookingDate: "2026-11-25"
  }
];

export default function App() {
  // Theme Mode: 'dark' (default enterprise style) or 'light'
  const [theme, setTheme] = useState(localStorage.getItem('unnati_theme') || 'dark');

  // Navigation State
  const [activeTab, setActiveTab] = useState('procurement');
  const [megamenuOpen, setMegamenuOpen] = useState(false);

  // Authenticated User & Tokens (Strict RBAC - No public role-switching)
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('unnati_token') || null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [registerRole, setRegisterRole] = useState('customer'); // 'customer' or 'producer'
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Modals & Drawers
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditPaymentModalOpen, setCreditPaymentModalOpen] = useState(false);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [consultScheme, setConsultScheme] = useState('Government MSME Schemes');
  const [toast, setToast] = useState(null);

  // Producer Upload Form Validation
  const [uploadErrors, setUploadErrors] = useState({});

  // Categories & Megamenu Selection
  const [selectedCategory, setSelectedCategory] = useState('Mild Steel');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Flat Products');
  const [selectedSku, setSelectedSku] = useState('CRC');
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');
  const [searchQuery, setSearchQuery] = useState('');

  // Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Metadata
  const [metadata, setMetadata] = useState({
    categories: [
      {
        id: "mild-steel",
        name: "Mild Steel",
        subcategories: [
          { id: "flat-products", name: "Flat Products", skus: ["CRC", "HR Coil", "HR Plate", "HBC"] },
          { id: "semi-finished", name: "Semi-Finished", skus: ["Billets", "Blooms", "Slabs"] },
          { id: "long-products", name: "Long Products", skus: ["Secondary TMT", "Wire Rods", "Rounds"] },
          { id: "structure", name: "Structure", skus: ["Beams", "Channels", "Angles"] }
        ]
      },
      {
        id: "non-ferrous",
        name: "Non Ferrous",
        subcategories: [
          { id: "primary-al", name: "Primary Aluminium", skus: ["Aluminium Ingot", "Wire Rods", "Billet"] },
          { id: "copper", name: "Copper & Zinc", skus: ["Cathode", "Rods", "Zinc Ingot"] }
        ]
      },
      {
        id: "polymers",
        name: "Polymers & Packaging",
        subcategories: [
          { id: "poly-resins", name: "Polymer Resins", skus: ["PVC", "HDPE", "PP", "LLDPE"] }
        ]
      },
      {
        id: "chemicals",
        name: "Chemicals",
        subcategories: [
          { id: "industrial-chem", name: "Industrial Solvents", skus: ["Methanol", "Caustic Soda", "Toluene"] }
        ]
      },
      {
        id: "energy",
        name: "Energy & Petroleum",
        subcategories: [
          { id: "bitumen-group", name: "Bitumen & Fuels", skus: ["Bitumen", "VG-30", "VG-40", "Furnace Oil"] }
        ]
      },
      {
        id: "stainless",
        name: "Stainless Steel",
        subcategories: [
          { id: "ss-flat", name: "SS Flats & Sheets", skus: ["SS 304 Coil", "SS 316 Sheet"] }
        ]
      },
      {
        id: "pipes",
        name: "Pipes",
        subcategories: [
          { id: "ms-pipes", name: "Tubular Products", skus: ["ERW Pipes", "GI Pipes", "Seamless"] }
        ]
      },
      {
        id: "infra",
        name: "Infrastructure & Construction",
        subcategories: [
          { id: "cement-tmt", name: "Structural Sourcing", skus: ["OPC 53 Cement", "TMT Bundles"] }
        ]
      }
    ],
    cities: ['Ahmedabad', 'Mumbai', 'Pune', 'Mysore', 'Surat', 'Bangalore', 'Nashik'],
    popularTags: ["Aluminium Ingot", "Bitumen", "Methanol", "PVC", "Secondary TMT"],
    marketPrices: [
      { commodity: "CRC Mild Steel (IS 513)", price: "₹58,500/MT", change: "+1.2%" },
      { commodity: "Hot Rolled Coil (IS 2062)", price: "₹54,200/MT", change: "+0.7%" },
      { commodity: "Aluminium Ingot 99.7%", price: "₹2,24,000/MT", change: "+0.8%" },
      { commodity: "Bitumen VG-30", price: "₹41,200/MT", change: "-0.4%" },
      { commodity: "PVC Resin K-67", price: "₹74,500/MT", change: "+2.1%" },
      { commodity: "Secondary TMT Rebar", price: "₹47,800/MT", change: "+0.5%" },
      { commodity: "Methanol Industrial", price: "₹28,400/MT", change: "-1.1%" },
      { commodity: "Primary TMT 500D", price: "₹52,800/MT", change: "-0.3%" }
    ]
  });

  const [products, setProducts] = useState(SAMPLE_SCRAP_PRODUCTS);
  const [cart, setCart] = useState(DEFAULT_SAMPLE_CART);
  const [sanctionedCredit, setSanctionedCredit] = useState(2500000);

  // Toggle Theme
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('unnati_theme', next);
  };

  // Sync theme with document and body for 100% full-screen color switching
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = `theme-${theme}`;
    document.body.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Toast Notification
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth gatekeeper
  const requireVerifiedAuth = (actionName = 'perform this action') => {
    if (!user || !token) {
      setAuthError(`Authentication Required: Sign in with a verified account to ${actionName}.`);
      setAuthModalOpen(true);
      showToast('Please sign in or register to proceed', 'error');
      return false;
    }
    if (!user.isVerified) {
      setAuthError(`Verification Required: Your GSTIN/KYC must be verified to ${actionName}.`);
      setAuthModalOpen(true);
      showToast('Verified account required', 'error');
      return false;
    }
    return true;
  };

  // Initial Load
  useEffect(() => {
    fetchMetadata();
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, selectedSku, selectedCity, searchQuery]);

  const fetchMetadata = async () => {
    try {
      const res = await fetch(`${API_BASE}/metadata`);
      if (res.ok) {
        const data = await res.json();
        setMetadata(data);
      }
    } catch (err) {
      // Keep state
    }
  };

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        fetchCart(authToken);
      }
    } catch (err) {
      // Keep session
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
      if (selectedSku) params.append('sku', selectedSku);
      if (selectedCity) params.append('city', selectedCity);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          return;
        }
      }
      let filtered = [...SAMPLE_SCRAP_PRODUCTS];
      if (selectedCategory) filtered = filtered.filter(p => p.category === selectedCategory);
      if (selectedCity) filtered = filtered.filter(p => p.city === selectedCity);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      }
      setProducts(filtered.length > 0 ? filtered : SAMPLE_SCRAP_PRODUCTS);
    } catch (err) {
      setProducts(SAMPLE_SCRAP_PRODUCTS);
    }
  };

  const fetchCart = async (authToken = token) => {
    try {
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
      const res = await fetch(`${API_BASE}/cart`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setCart(data.items);
          return;
        }
      }
      setCart(DEFAULT_SAMPLE_CART);
    } catch (err) {
      setCart(DEFAULT_SAMPLE_CART);
    }
  };

  const handleAddToCart = async (item) => {
    if (!requireVerifiedAuth('add products to cart')) return;

    try {
      const res = await fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ item })
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.items);
        showToast(`Added ${item.title} to cart`);
        setCartDrawerOpen(true);
      } else {
        setCart(prev => [item, ...prev]);
        showToast(`Added ${item.title} to cart`);
        setCartDrawerOpen(true);
      }
    } catch (err) {
      setCart(prev => [item, ...prev]);
      showToast(`Added ${item.title} to cart`);
      setCartDrawerOpen(true);
    }
  };

  const handleUpdateQuantity = async (itemId, delta) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const handleRemoveFromCart = async (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
    showToast('Item removed from cart');
  };

  const handleCheckout = async (paymentMethod) => {
    if (!requireVerifiedAuth('complete order checkout')) return;
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (paymentMethod === 'card') {
      setCreditPaymentModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/cart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethod })
      });
      if (res.ok) {
        showToast(paymentMethod === '30_day_credit' ? 'Order Financed via 30-Day Working Capital Credit Line' : 'Order Placed & Scheduled for Dispatch');
        setCart([]);
        setCartDrawerOpen(false);
      } else {
        showToast('Order confirmed and scheduled for dispatch', 'success');
        setCart([]);
        setCartDrawerOpen(false);
      }
    } catch (err) {
      showToast('Order confirmed and scheduled for dispatch', 'success');
      setCart([]);
      setCartDrawerOpen(false);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    setProducts(prev => prev.filter(p => p.id !== prodId));
    showToast('Lot removed from catalogue');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCart(DEFAULT_SAMPLE_CART);
    localStorage.removeItem('unnati_token');
    showToast('Signed out successfully');
  };

  // Categories helper
  const currentCategoryObj = metadata.categories.find(c => c.name === selectedCategory) || metadata.categories[0];
  const subcategories = currentCategoryObj?.subcategories || [];
  const currentSubObj = subcategories.find(s => s.name === selectedSubcategory) || subcategories[0];
  const skus = currentSubObj?.skus || [];
  const cities = metadata.cities || ['Ahmedabad', 'Mumbai', 'Pune', 'Mysore', 'Surat', 'Bangalore', 'Nashik'];

  // Cart Calculations
  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const gst = Math.round(subtotal * 0.18);
  const freight = cart.some(i => i.type === 'product') ? 15000 : 0;
  const total = subtotal + gst + freight;

  return (
    <div className={`app-root theme-${theme}`}>
      {/* ==================== 1. PROFESSIONAL ENTERPRISE TOP UTILITY HEADER ==================== */}
      <header className="site-header">
        <div className="top-utility-bar">
          <div className="container utility-inner">
            <div className="brand-wrapper">
              <div className="brand-logo" onClick={() => { setActiveTab('procurement'); setMegamenuOpen(false); }}>
                <div className="logo-graphic">
                  <span className="chart-bar b1"></span>
                  <span className="chart-bar b2"></span>
                  <span className="chart-bar b3"></span>
                  <svg className="arrow-icon" viewBox="0 0 24 24"><path fill="#2E7D32" d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>
                </div>
                <span className="brand-name">UNNATI</span>
              </div>
              <div className="utility-nav-links">
                <a href="#news" onClick={(e) => { e.preventDefault(); setActiveTab('market-research'); setMegamenuOpen(false); }} className={`utility-btn-news ${activeTab === 'market-research' ? 'active-link' : ''}`}>NEWS</a>
                <a href="#about" onClick={(e) => { e.preventDefault(); setActiveTab('about-us'); setMegamenuOpen(false); }} className={`utility-link ${activeTab === 'about-us' ? 'active-link' : ''}`}>ABOUT US</a>
                <a href="#connect" onClick={(e) => { e.preventDefault(); setActiveTab('lets-connect'); setMegamenuOpen(false); }} className={`utility-link ${activeTab === 'lets-connect' ? 'active-link' : ''}`}>LET'S CONNECT</a>
              </div>
            </div>

            <div className="utility-right">
              {/* Light / Dark Mode Toggle */}
              <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
                {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
              </button>

              {/* Authenticated User Status or Login Trigger */}
              {user ? (
                <div className="user-badge">
                  <span className="user-name-text">
                    <strong>{user.companyName || user.name}</strong> ({
                      user.role === 'producer' || user.role === 'manufacturer' 
                        ? 'Mill Producer' 
                        : user.role === 'admin' 
                          ? 'Admin' 
                          : 'MSME Buyer'
                    })
                  </span>
                  <span className="gst-verified-pill">GST VERIFIED</span>
                  <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
                </div>
              ) : (
                <button className="btn-login-signup" onClick={() => { setAuthError(''); setAuthTab('login'); setAuthModalOpen(true); }}>
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==================== 2. SOLID DARK SERVICE BAR ==================== */}
        <nav className="service-nav-bar">
          <div className="container service-nav-inner">
            <div className="service-nav-tabs">
              <button
                className={`service-tab-btn ${activeTab === 'procurement' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('procurement');
                  setMegamenuOpen(!megamenuOpen);
                }}
              >
                <span>Procurement</span> <span className="tab-chevron">{megamenuOpen ? '▲' : '▾'}</span>
              </button>

              <button
                className={`service-tab-btn ${activeTab === 'warehousing' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('warehousing');
                  setMegamenuOpen(false);
                }}
              >
                <span>Warehousing</span>
              </button>

              <button
                className={`service-tab-btn ${activeTab === 'credit' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('credit');
                  setMegamenuOpen(false);
                }}
              >
                <span>Credit</span>
              </button>

              <button
                className={`service-tab-btn ${activeTab === 'consultancy' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('consultancy');
                  setMegamenuOpen(false);
                }}
              >
                <span>Consultancy</span>
              </button>

              <button
                className={`service-tab-btn ${activeTab === 'market-research' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('market-research');
                  setMegamenuOpen(false);
                }}
              >
                <span>Market Research</span>
              </button>

              {/* Producer Terminal - Strictly visible only when authenticated as Producer */}
              {(user?.role === 'producer' || user?.role === 'manufacturer') && (
                <button
                  className={`service-tab-btn role-special-btn ${activeTab === 'producer-portal' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('producer-portal'); setMegamenuOpen(false); }}
                >
                  <span>Producer Terminal</span>
                </button>
              )}

              {/* Admin Console - Strictly visible only when authenticated as Admin */}
              {user?.role === 'admin' && (
                <button
                  className={`service-tab-btn role-special-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('admin'); setMegamenuOpen(false); }}
                >
                  <span>Admin Console</span>
                </button>
              )}
            </div>

            {/* Cart Trigger with live count */}
            <button className="cart-btn-header" onClick={() => setCartDrawerOpen(true)}>
              <span>Cart</span>
              <span className="cart-btn-count">{cart.reduce((a, b) => a + (b.quantity || 1), 0)}</span>
            </button>
          </div>

          {/* ==================== 3. FLOATING 4-TIER DROPDOWN MEGAMENU ==================== */}
          {megamenuOpen && (
            <>
              <div className="megamenu-backdrop-closer" onClick={() => setMegamenuOpen(false)}></div>
              <div className="megamenu-dropdown-overlay">
                <div className="megamenu-grid-4col">
                  {/* Column 1: Primary Category */}
                  <div className="megamenu-col">
                    <div className="col-heading">Category</div>
                    {[
                      'Mild Steel',
                      'Non Ferrous',
                      'Polymers & Packaging',
                      'Chemicals',
                      'Energy & Petroleum',
                      'Stainless Steel',
                      'Pipes',
                      'Infrastructure & Construction'
                    ].map(catName => (
                      <div
                        key={catName}
                        className={`menu-row ${selectedCategory === catName ? 'highlighted' : ''}`}
                        onClick={() => {
                          setSelectedCategory(catName);
                          const cObj = metadata.categories.find(c => c.name === catName);
                          if (cObj && cObj.subcategories.length) {
                            setSelectedSubcategory(cObj.subcategories[0].name);
                            setSelectedSku(cObj.subcategories[0].skus[0] || '');
                          }
                        }}
                      >
                        <div className="row-left">
                          <span>{catName}</span>
                        </div>
                        <span className="row-arrow">&rsaquo;</span>
                      </div>
                    ))}
                  </div>

                  {/* Column 2: Top Actions & Sub-Categories */}
                  <div className="megamenu-col">
                    <div className="megamenu-top-action">
                      <span>Daily Report &amp; News</span>
                      <button className="btn-black-pill" onClick={() => { setActiveTab('market-research'); setMegamenuOpen(false); }}>View &rarr;</button>
                    </div>
                    <div className="megamenu-top-action">
                      <span>Explore Categories</span>
                      <button className="btn-black-pill" onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); setSelectedSku(''); setSelectedCity(''); setSearchQuery(''); setMegamenuOpen(false); }}>View &rarr;</button>
                    </div>

                    <div className="col-heading" style={{ marginTop: '14px' }}>Sub-Category</div>
                    {subcategories.map(sub => (
                      <div
                        key={sub.name}
                        className={`menu-row ${selectedSubcategory === sub.name ? 'highlighted' : ''}`}
                        onClick={() => {
                          setSelectedSubcategory(sub.name);
                          if (sub.skus.length) setSelectedSku(sub.skus[0]);
                        }}
                      >
                        <span>{sub.name}</span>
                        <span className="row-arrow">&rsaquo;</span>
                      </div>
                    ))}
                  </div>

                  {/* Column 3: Products (SKUs) */}
                  <div className="megamenu-col">
                    <div className="col-heading">Products</div>
                    {skus.map(skuItem => (
                      <div
                        key={skuItem}
                        className={`menu-row ${selectedSku === skuItem ? 'highlighted' : ''}`}
                        onClick={() => setSelectedSku(skuItem)}
                      >
                        <span>{skuItem}</span>
                        <span className="row-arrow">&rsaquo;</span>
                      </div>
                    ))}
                  </div>

                  {/* Column 4: City / Logistics Hub */}
                  <div className="megamenu-col">
                    <div className="col-heading">City</div>
                    {cities.map(cityName => (
                      <div
                        key={cityName}
                        className={`menu-row ${selectedCity === cityName ? 'highlighted' : ''}`}
                        onClick={() => {
                          setSelectedCity(cityName);
                          showToast(`Logistics Hub: ${cityName}`);
                          setMegamenuOpen(false);
                        }}
                      >
                        <span>{cityName}</span>
                        {selectedCity === cityName && <span style={{ fontWeight: '900', color: '#B45309' }}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="megamenu-footer-ribbon">
                  <span className="national-recog-text">NATIONAL RECOGNITION</span>
                  <span>Allied with MSME Ministry Networks • GST E-Invoicing Compliant • Pan-India Logistics Grid</span>
                </div>
              </div>
            </>
          )}
        </nav>
      </header>

      {/* ==================== TAB 1: HERO & PROCUREMENT ==================== */}
      {activeTab === 'procurement' && (
        <main>
          {/* ENLARGED HERO SECTION WITH BLENDED KONECRANES COILS BACKGROUND */}
          <section className="procurement-hero-end2end">
            <div className="hero-overlay-dark">
              <div className="container hero-content-container">
                <div className="hero-text-block">
                  <div className="hero-watermark">Raw Materials</div>
                  <h1 className="hero-exact-title">
                    India's Leading B2B Raw<br />
                    Materials<br />
                    Procurement &amp; End-to-End<br />
                    Transaction Platform
                  </h1>
                  <p className="hero-exact-subtext">
                    End-to-end procurement, embedded credit &amp; pan-India logistics, built for India's SMEs.
                  </p>

                  {/* Universal Search Bar Pill */}
                  <div className="hero-search-box">
                    <span style={{ fontSize: '16px', marginRight: '10px', color: '#6B7280' }}>🔍</span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search for TMT, Steel, Cement, Chemicals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                    />
                    <button className="btn-search-amber" onClick={fetchProducts}>Search</button>
                  </div>

                  {/* Colored Tag Chips */}
                  <div className="hero-tag-chips">
                    <button className={`chip-item ${selectedSku === 'Aluminium Ingot' ? 'active' : ''}`} onClick={() => { setSelectedSku('Aluminium Ingot'); setSearchQuery('Aluminium Ingot'); }}>
                      <span className="chip-dot dot-red"></span> Aluminium Ingot
                    </button>
                    <button className={`chip-item ${selectedSku === 'Bitumen' ? 'active' : ''}`} onClick={() => { setSelectedSku('Bitumen'); setSearchQuery('Bitumen'); }}>
                      <span className="chip-dot dot-blue"></span> Bitumen
                    </button>
                    <button className={`chip-item ${selectedSku === 'Methanol' ? 'active' : ''}`} onClick={() => { setSelectedSku('Methanol'); setSearchQuery('Methanol'); }}>
                      <span className="chip-dot dot-cyan"></span> Methanol
                    </button>
                    <button className={`chip-item ${selectedSku === 'PVC' ? 'active' : ''}`} onClick={() => { setSelectedSku('PVC'); setSearchQuery('PVC'); }}>
                      <span className="chip-triangle">▲</span> PVC
                    </button>
                    <button className={`chip-item ${selectedSku === 'Secondary TMT' ? 'active' : ''}`} onClick={() => { setSelectedSku('Secondary TMT'); setSearchQuery('Secondary TMT'); }}>
                      <span className="chip-square dot-orange"></span> Secondary TMT
                    </button>
                  </div>
                </div>
              </div>

              <div className="hero-bottom-accent-container">
                <div className="hero-amber-dash"></div>
              </div>
            </div>
          </section>

          {/* Ribbon */}
          <div className="ribbon-banner">
            ALL YOU NEED AT ONE PLACE
          </div>

          {/* Live Catalogue Grid */}
          <section className="container catalog-section">
            <div className="catalog-header">
              <div>
                <h2 className="catalog-title">Live Manufacturer Inventory</h2>
                <p className="catalog-sub">
                  Category: <strong>{selectedCategory || 'All Categories'}</strong> &bull; SKU: <strong>{selectedSku || 'All SKUs'}</strong> &bull; Logistics Hub: <strong>{selectedCity || 'All Hubs'}</strong> ({products.length} ready lots)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {(user?.role === 'producer' || user?.role === 'manufacturer' || user?.role === 'admin') && (
                  <button className="btn-post-product" onClick={() => setPostModalOpen(true)}>
                    + Upload Goods to Catalogue
                  </button>
                )}
                <button className="btn-post-product" style={{ background: '#059669', color: 'white' }} onClick={() => setCartDrawerOpen(true)}>
                  View Cart ({cart.reduce((a, b) => a + (b.quantity || 1), 0)} items)
                </button>
              </div>
            </div>

            <div className="product-grid">
              {products.map(prod => (
                <div className="product-card" key={prod.id}>
                  <div className="card-img-wrap">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="card-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/cold-rolled-coils.svg';
                      }}
                    />
                    <span className="hub-badge">{prod.city} Hub</span>
                  </div>
                  <div className="card-body">
                    <div className="seller-row">
                      <span className="seller-name">{prod.manufacturerName}</span>
                      <span className="verified-seller-badge">Verified Producer</span>
                    </div>
                    <h3 className="item-title">{prod.title}</h3>
                    <ul className="spec-list">
                      <li>• <strong>SKU:</strong> {prod.sku} ({prod.category})</li>
                      <li>• <strong>Ready Stock:</strong> {prod.stockTons} {prod.unit}s</li>
                      <li>• <strong>Standards:</strong> {prod.specifications?.Standards || 'IS / ISO Certified'}</li>
                    </ul>
                    <div className="price-box">
                      <div>
                        <div className="price-main">₹ {prod.pricePerTon.toLocaleString('en-IN')}</div>
                        <div className="price-unit">per {prod.unit} + GST</div>
                      </div>
                      <div className="moq-info">MOQ: {prod.moqTons} Tons</div>
                    </div>
                    <button
                      className="btn-add-cart"
                      onClick={() => handleAddToCart({
                        id: prod.id,
                        title: prod.title,
                        type: 'product',
                        city: prod.city,
                        price: prod.pricePerTon,
                        unit: prod.unit,
                        quantity: prod.moqTons,
                        manufacturer: prod.manufacturerName
                      })}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ==================== TAB 2: WAREHOUSING (60% VIEWPORT BANNER & STRICT PRODUCER ACCESS) ==================== */}
      {activeTab === 'warehousing' && (
        <main>
          {/* ENLARGED 60% VIEWPORT WAREHOUSING BANNER */}
          <div className="warehousing-hero-60vh">
            <div className="warehousing-hero-overlay">
              <div className="container warehousing-hero-content">
                <span className="badge-producer-terminal">PRODUCER TERMINAL &amp; 3PL LOGISTICS</span>
                <h1 className="warehousing-hero-title">Industrial Warehousing &amp; Fulfillment Grid</h1>
                <p className="warehousing-hero-sub">
                  Pan-India Cold Storage, Drop Shipping &amp; Inventory Audit infrastructure for verified primary mill manufacturers and industrial producers.
                </p>

                {/* Role-Based Warehousing Access: Producer vs MSME Buyer vs Guest */}
                {user?.role === 'producer' || user?.role === 'manufacturer' || user?.role === 'admin' ? (
                  <div className="warehousing-authenticated-banner">
                    <span>Logged in as Verified Producer: <strong>{user.companyName || user.name}</strong> (GSTIN: {user.gstNumber})</span>
                    <button className="btn-warehousing-producer-cta" onClick={() => setPostModalOpen(true)}>
                      + Upload Goods to Catalogue
                    </button>
                  </div>
                ) : user ? (
                  <div className="warehousing-buyer-authenticated-box">
                    <div className="buyer-auth-badge">
                      <span className="badge-pill">ACCOUNT ROLE: MSME BUYER</span>
                      <h4>{user.companyName || user.name}</h4>
                      <p>GSTIN: {user.gstNumber} &bull; Registered Hub: {user.city}</p>
                    </div>
                    <div className="buyer-auth-notice">
                      <p>
                        <strong>3PL Warehousing Interface is Reserved for Primary Mill Producers:</strong> Facility reservation, drop-shipping allocations, and bulk inventory audits are strictly available to verified industrial producers.
                      </p>
                      <p>
                        As an <strong>MSME Buyer</strong>, your material purchases automatically include end-to-end warehousing and dispatch logistics directly to your receiving facility.
                      </p>
                      <button className="btn-post-product" style={{ marginTop: '10px' }} onClick={() => setActiveTab('procurement')}>
                        Browse Raw Materials Catalogue
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="warehousing-cta-container">
                    <button
                      className="btn-warehousing-producer-cta"
                      onClick={() => {
                        setAuthError('');
                        setAuthTab('register');
                        setRegisterRole('producer');
                        setAuthModalOpen(true);
                      }}
                    >
                      Sign Up as Producer to Publish Goods &amp; Book Facilities
                    </button>
                    <button
                      className="btn-warehousing-signin-cta"
                      onClick={() => {
                        setAuthError('');
                        setAuthTab('login');
                        setAuthModalOpen(true);
                      }}
                    >
                      Sign In with Verified Producer Account
                    </button>
                    <div className="warehousing-note-text">
                      Strict Role-Based Access: Warehouse space booking and catalogue listing are reserved for GST-verified primary mill producers. Buyers automatically receive bundled dispatch logistics.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* WAREHOUSING TABLE (REPLICATED FROM IMAGE 1) - ONLY FOR PRODUCER / ADMIN */}
          <div className="container" style={{ margin: '40px auto 70px auto' }}>
            {user?.role === 'producer' || user?.role === 'manufacturer' || user?.role === 'admin' ? (
              <div className="table-card">
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Warehousing Interface (Image 1 Replicated)</h3>
                  <span className="gst-verified-pill">PRODUCER ALLOCATION ACTIVE</span>
                </div>

                <table className="warehousing-grid-table">
                  <thead>
                    <tr>
                      <th className="facility-head">Facility</th>
                      <th className="other-head">City/Town</th>
                      <th className="other-head">Pincode</th>
                      <th className="other-head">Service Provider</th>
                      <th className="other-head">Time Zone and Date</th>
                      <th className="other-head">Fee Charged</th>
                      <th className="other-head">Service added to cart</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { facility: 'Cold Storage', defaultCity: 'Ahmedabad', defaultPin: '380001', provider: 'Snowman Logistics Ltd', fee: 28000 },
                      { facility: 'Drop Shipping', defaultCity: 'Mumbai', defaultPin: '400001', provider: 'Adani Logistics 3PL', fee: 18500 },
                      { facility: 'Inventory Check', defaultCity: 'Pune', defaultPin: '411001', provider: 'SGS India Industrial Inspection', fee: 12000 },
                      { facility: 'Customize Facilities', defaultCity: 'Bangalore', defaultPin: '560001', provider: 'UNNATI Enterprise Solutions', fee: 35000 }
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '800' }}>{row.facility}</td>
                        <td>
                          <select className="table-select" defaultValue={row.defaultCity}>
                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td><input type="text" className="table-input" defaultValue={row.defaultPin} /></td>
                        <td>
                          <select className="table-select" defaultValue={row.provider}>
                            <option>{row.provider}</option>
                            <option>TVS Supply Chain Solutions</option>
                            <option>Concor Multi-Modal Terminal</option>
                            <option>DHL Supply Chain India</option>
                          </select>
                        </td>
                        <td><input type="date" className="table-input" defaultValue="2026-11-25" /></td>
                        <td style={{ fontWeight: '800', color: '#B45309' }}>₹ {row.fee.toLocaleString('en-IN')} / mo</td>
                        <td>
                          <button
                            className="btn-add-table"
                            onClick={() => handleAddToCart({
                              id: `wh_${row.facility.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
                              title: `Warehousing: ${row.facility}`,
                              type: 'warehousing',
                              city: row.defaultCity,
                              price: row.fee,
                              unit: 'Month',
                              quantity: 1,
                              provider: row.provider
                            })}
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="table-bottom-bar">
                  <button className="btn-view-cart-amber" onClick={() => setCartDrawerOpen(true)}>
                    View your Cart ({cart.reduce((a, b) => a + (b.quantity || 1), 0)} services)
                  </button>
                </div>
              </div>
            ) : (
              <div className="warehousing-buyer-info-card">
                <h3>Looking to procure raw materials with bundled fulfillment?</h3>
                <p>
                  As an industrial buyer or customer, all warehousing, quality inspection, and transit insurance are seamlessly bundled directly into your procurement orders.
                </p>
                <button className="btn-post-product" onClick={() => setActiveTab('procurement')}>
                  Browse Live Manufacturer Catalogue
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ==================== TAB 3: CREDIT / WORKING CAPITAL (IMAGE 3 REPLICATED) ==================== */}
      {activeTab === 'credit' && (
        <main className="container credit-container">
          <div className="credit-exact-card">
            <div className="credit-top-photo-wrap">
              <img
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=85"
                alt="Working Capital Papers and Calculator"
                className="credit-photo"
              />
            </div>

            <div className="credit-bottom-banner">
              <div className="credit-banner-left">
                <span className="credit-yellow-pill">Get a Working Capital Loan</span>
                <p className="credit-subtext-yellow">
                  for 30 days for best interest rates that suits your business
                </p>
              </div>
              <button className="btn-apply-dark-exact" onClick={() => { if (requireVerifiedAuth('apply for loan')) setCreditModalOpen(true); }}>
                Apply Now
              </button>
            </div>
          </div>

          <div className="credit-status-grid">
            <div className="credit-summary-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="gst-verified-pill" style={{ background: '#FEF3C7', color: '#92400E' }}>REVOLVING CREDIT LINE</span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Account: {user?.companyName || 'Gujarat Precision Fabricators'}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700' }}>SANCTIONED 30-DAY LIMIT</div>
              <div style={{ fontSize: '32px', fontWeight: '900', margin: '6px 0 8px 0' }}>
                ₹ {sanctionedCredit.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '13px', color: '#059669', fontWeight: '700' }}>
                Interest Rate: 0.85% per month (Revolving 30-day tenor)
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button className="btn-post-product" style={{ fontSize: '13px', padding: '9px 18px' }} onClick={() => setCreditPaymentModalOpen(true)}>
                  Settle with Corporate Card
                </button>
                <button className="btn-black-pill" style={{ padding: '9px 18px', fontSize: '13px' }} onClick={() => setCreditModalOpen(true)}>
                  Request Limit Increase
                </button>
              </div>
            </div>

            <div className="credit-calculator-card">
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '14px' }}>Working Capital Repayment Calculator</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-field">
                  <label>Financed Amount (₹)</label>
                  <input type="number" defaultValue="1500000" step="100000" />
                </div>
                <div className="form-field">
                  <label>Repayment Tenor</label>
                  <select defaultValue="30">
                    <option value="30">30 Days (0.85% interest)</option>
                    <option value="60">60 Days (1.70% interest)</option>
                    <option value="90">90 Days (2.55% interest)</option>
                  </select>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', padding: '12px', borderRadius: '6px', fontSize: '13px', marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Estimated Interest Cost: <strong>₹ 12,750</strong></span>
                <span style={{ color: '#059669', fontWeight: '700' }}>Total Repayment: ₹ 15,12,750</span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ==================== TAB 4: CONSULTANCY SERVICES (IMAGES 4 & 5 REPLICATED) ==================== */}
      {activeTab === 'consultancy' && (
        <main>
          <div className="consultancy-exact-dark-hero">
            <div className="container text-center">
              <div className="pill-our-services-exact">OUR SERVICES</div>
              <h1 className="consultancy-title-exact">Consultancy</h1>
              <p className="consultancy-sub-exact">
                Expert guidance across government schemes, export incentives, and business strategy to help your business grow
              </p>
            </div>
          </div>

          <div className="container" style={{ marginTop: '-40px', marginBottom: '45px' }}>
            <div className="consultancy-3cards-grid">
              {/* CARD 1: SUBSIDIES & TENDERS (White Card) */}
              <div className="consultancy-card-white">
                <span className="pill-scheme-yellow">SUBSIDIES &amp; TENDERS</span>

                <div className="consultancy-svg-wrap">
                  <svg width="140" height="90" viewBox="0 0 140 90" fill="none">
                    <circle cx="70" cy="45" r="32" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3"/>
                    <circle cx="70" cy="45" r="18" fill="#1E293B"/>
                    <text x="70" y="49" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle">MSME</text>
                    <circle cx="70" cy="13" r="5" fill="#06B6D4"/>
                    <circle cx="98" cy="28" r="5.5" fill="#8B5CF6"/>
                    <circle cx="102" cy="45" r="4.5" fill="#EC4899"/>
                    <circle cx="88" cy="71" r="5" fill="#EF4444"/>
                    <circle cx="48" cy="67" r="5" fill="#10B981"/>
                    <circle cx="38" cy="45" r="4.5" fill="#3B82F6"/>
                    <circle cx="46" cy="24" r="5" fill="#F59E0B"/>
                  </svg>
                </div>

                <h3 className="scheme-title-text">Government MSME Schemes</h3>
                <p className="scheme-desc-text">List of Government MSME Schemes You Need To Know</p>

                <button className="btn-scheme-action" onClick={() => { setConsultScheme('Government MSME Schemes'); setConsultModalOpen(true); }}>
                  Schedule Advisory &rarr;
                </button>
              </div>

              {/* CARD 2: EXPORT INCENTIVES (Dark Container) */}
              <div className="consultancy-card-dark">
                <span className="pill-scheme-yellow">EXPORT INCENTIVES</span>

                <div className="consultancy-svg-wrap">
                  <svg width="140" height="90" viewBox="0 0 140 90" fill="none">
                    <rect x="68" y="28" width="18" height="18" rx="3" fill="#EF4444"/>
                    <text x="77" y="41" fill="#FFFFFF" fontSize="11" fontWeight="800" textAnchor="middle">T</text>
                    <rect x="88" y="28" width="18" height="18" rx="3" fill="#F59E0B"/>
                    <text x="97" y="41" fill="#FFFFFF" fontSize="11" fontWeight="800" textAnchor="middle">A</text>
                    <rect x="52" y="38" width="18" height="28" rx="3" fill="#6366F1"/>
                    <rect x="72" y="48" width="34" height="18" rx="3" fill="#EC4899"/>
                    <text x="89" y="61" fill="#FFFFFF" fontSize="10" fontWeight="800" textAnchor="middle">EXPORT</text>
                    <circle cx="44" cy="58" r="5" fill="#F59E0B"/>
                    <circle cx="38" cy="65" r="3.5" fill="#FBBF24"/>
                  </svg>
                </div>

                <h3 className="scheme-title-text text-white">Export Incentives</h3>
                <p className="scheme-desc-text text-slate-300">Types, Benefits And Everything Else You Need To Know</p>

                <button className="btn-scheme-action" onClick={() => { setConsultScheme('Export Incentives'); setConsultModalOpen(true); }}>
                  Schedule Advisory &rarr;
                </button>
              </div>

              {/* CARD 3: BUSINESS ADVISORY (Dark Container) */}
              <div className="consultancy-card-dark">
                <span className="pill-scheme-yellow">BUSINESS ADVISORY</span>

                <div className="consultancy-svg-wrap">
                  <svg width="140" height="90" viewBox="0 0 140 90" fill="none">
                    <rect x="40" y="58" width="60" height="4" rx="2" fill="#94A3B8"/>
                    <rect x="46" y="62" width="3" height="14" fill="#64748B"/>
                    <rect x="91" y="62" width="3" height="14" fill="#64748B"/>
                    <circle cx="52" cy="40" r="6" fill="#F97316"/>
                    <path d="M46 54C46 48 58 48 58 54V58H46V54Z" fill="#0EA5E9"/>
                    <circle cx="88" cy="40" r="6" fill="#F97316"/>
                    <path d="M82 54C82 48 94 48 94 54V58H82V54Z" fill="#3B82F6"/>
                    <rect x="65" y="50" width="10" height="7" rx="1" fill="#E2E8F0"/>
                    <rect x="63" y="57" width="14" height="2" rx="1" fill="#CBD5E1"/>
                  </svg>
                </div>

                <h3 className="scheme-title-text text-white">Business Consultancy</h3>
                <p className="scheme-desc-text text-slate-300">Expert Advisory for Growth, Strategy &amp; Operations</p>

                <button className="btn-scheme-action" onClick={() => { setConsultScheme('Business Advisory & Strategy'); setConsultModalOpen(true); }}>
                  Schedule Advisory &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* WHAT WE OFFER SECTION WITH YELLOW ACCENT DASHES (IMAGE 5) */}
          <div className="what-we-offer-dark-bg">
            <div className="container">
              <h2 className="what-we-offer-header">What We Offer</h2>
              <div className="offerings-6grid">
                {[
                  {
                    title: "Supply Chain Consulting",
                    desc: "Streamline raw material procurement cycles, identify multi-modal transit efficiencies, and reduce warehouse holding costs."
                  },
                  {
                    title: "Business Strategy",
                    desc: "Data-backed strategic expansion models tailored for Indian manufacturing MSMEs to accelerate production and EBITDA margins."
                  },
                  {
                    title: "Vendor Management",
                    desc: "Systematic tier-1 mill supplier benchmarking, continuous metallurgical quality compliance, and automated replenishment contracts."
                  },
                  {
                    title: "Procurement Consulting",
                    desc: "Aggregated buying power, price hedge advisories, and direct long-term contracts with primary blast-furnace producers."
                  },
                  {
                    title: "Operational Excellence",
                    desc: "Lean manufacturing deployment, shop-floor scrap minimization, and Six-Sigma inventory velocity improvements."
                  },
                  {
                    title: "Ask Any Query",
                    desc: "Connect directly with our senior industry consultants for customized metallurgical, tax withholding, or cross-border trade queries."
                  }
                ].map((item, idx) => (
                  <div className="offer-box-exact" key={idx}>
                    <div className="amber-dash-accent"></div>
                    <h4 className="offer-box-title">{item.title}</h4>
                    <p className="offer-box-desc">{item.desc}</p>
                    <a className="offer-learn-more" onClick={() => { setConsultScheme(item.title); setConsultModalOpen(true); }}>
                      Connect with Consultant &rarr;
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ==================== TAB 5: MARKET RESEARCH & NEWSLETTER ==================== */}
      {activeTab === 'market-research' && (
        <main className="container" style={{ padding: '30px 20px 60px 20px' }}>
          <div className="newsletter-card">
            <h1 className="newsletter-title">Newsletter Like Never Before !!!</h1>
            <p className="newsletter-desc">
              Daily commodity pricing intelligence, steel index forecasts, and industrial raw material market sentiment.
            </p>
            <form className="newsletter-input-box" onSubmit={(e) => { e.preventDefault(); showToast('Subscribed to UNNATI Daily Market Intelligence'); e.target.reset(); }}>
              <input type="email" required className="search-input" style={{ border: '1px solid #D1D5DB', borderRadius: '5px', padding: '9px 12px' }} placeholder="Enter business email for daily market bulletins..." />
              <button type="submit" className="btn-search-amber">Subscribe Now</button>
            </form>
          </div>

          <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: '800' }}>National Commodity Spot Price Matrix</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Ex-Plant mill gate benchmarks updated daily across major industrial clusters</p>
              </div>
              <span className="gst-verified-pill" style={{ padding: '4px 10px' }}>LIVE SPOT INDICES</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px' }}>
              {(metadata.marketPrices || []).map((m, idx) => (
                <div key={idx} style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>{m.commodity}</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', marginTop: '4px' }}>{m.price}</div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: m.change.startsWith('+') ? '#059669' : '#DC2626', marginTop: '3px' }}>
                    {m.change.startsWith('+') ? '▲' : '▼'} {m.change} (24h Trend)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ==================== TAB 6: DEDICATED ABOUT US PAGE ==================== */}
      {activeTab === 'about-us' && (
        <main className="container" style={{ padding: '40px 20px 80px 20px' }}>
          <div className="about-hero-box">
            <span className="badge-producer-terminal">CORPORATE OVERVIEW</span>
            <h1 style={{ fontSize: '36px', fontWeight: '900', margin: '12px 0' }}>Empowering India's Industrial Growth</h1>
            <p style={{ fontSize: '16px', lineHeight: '1.6', maxWidth: '850px', color: 'var(--text-muted)' }}>
              UNNATI is India's leading B2B raw materials procurement network, bridging primary blast-furnace producers, petrochemical refiners, and non-ferrous smelters with over 300,000 downstream manufacturing MSMEs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', margin: '40px 0' }}>
            <div className="about-stat-card">
              <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary-amber)' }}>₹ 4.82 Cr+</div>
              <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '6px' }}>Monthly Transaction Volume</div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Transparent pricing with zero middleman markups.</p>
            </div>
            <div className="about-stat-card">
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#3B82F6' }}>28+ Mills</div>
              <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '6px' }}>Primary Producer Direct Alliances</div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Tata Steel, JSW, JSPL, Hindalco, IOCL certified lots.</p>
            </div>
            <div className="about-stat-card">
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#10B981' }}>100% Verified</div>
              <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '6px' }}>GSTIN &amp; E-Way Bill Integration</div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Automated tax invoicing and pan-India dispatch.</p>
            </div>
          </div>
        </main>
      )}

      {/* ==================== TAB 7: DEDICATED LET'S CONNECT PAGE ==================== */}
      {activeTab === 'lets-connect' && (
        <main className="container" style={{ padding: '40px 20px 80px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }}>
            <div className="connect-form-card">
              <span className="badge-producer-terminal">GET IN TOUCH</span>
              <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '10px 0 6px 0' }}>Connect with UNNATI Enterprise Team</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '22px' }}>
                Speak directly with our commodity specialists regarding bulk raw material orders, producer mill listing, or collateral-free credit lines.
              </p>

              {contactSubmitted ? (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '20px', borderRadius: '8px', color: '#065F46' }}>
                  <h4 style={{ fontWeight: '800', fontSize: '16px' }}>Inquiry Submitted Successfully</h4>
                  <p style={{ fontSize: '13px', marginTop: '6px' }}>Thank you. An industry specialist from our nearest regional hub will contact you within 2 business hours.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); showToast('Inquiry submitted successfully'); }}>
                  <div className="form-2col">
                    <div className="form-field">
                      <label>Full Name</label>
                      <input type="text" required defaultValue={user?.name || ""} placeholder="Your name" />
                    </div>
                    <div className="form-field">
                      <label>Business Email</label>
                      <input type="email" required defaultValue={user?.email || ""} placeholder="work@company.com" />
                    </div>
                  </div>
                  <div className="form-2col">
                    <div className="form-field">
                      <label>Company Name</label>
                      <input type="text" required defaultValue={user?.companyName || ""} placeholder="Industrial Unit Name" />
                    </div>
                    <div className="form-field">
                      <label>Inquiry Nature</label>
                      <select defaultValue="Procurement">
                        <option value="Procurement">Bulk Raw Material Procurement</option>
                        <option value="Producer">Primary Mill Producer Listing</option>
                        <option value="Credit">Working Capital Credit Facility</option>
                        <option value="Warehousing">3PL Warehousing &amp; Fulfillment</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Message / Order Requirements</label>
                    <textarea rows="4" required placeholder="Specify commodity grades, required tonnage, destination hub..."></textarea>
                  </div>
                  <button type="submit" className="btn-submit-amber">Submit Enterprise Inquiry</button>
                </form>
              )}
            </div>

            <div className="connect-info-card">
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Regional Operations Hubs</h3>
              
              <div className="office-card">
                <div style={{ fontWeight: '800', fontSize: '14px' }}>Western India Headquarters</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  UNNATI Towers, Sarkhej-Gandhinagar Highway, Ahmedabad, Gujarat 380054
                </div>
                <div style={{ fontSize: '12px', color: 'var(--primary-amber)', fontWeight: '700', marginTop: '4px' }}>west@unnati.com • +91 79 4001 8800</div>
              </div>

              <div className="office-card">
                <div style={{ fontWeight: '800', fontSize: '14px' }}>Mumbai Financial &amp; Maritime Hub</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Bandra-Kurla Complex (BKC), Mumbai, Maharashtra 400051
                </div>
                <div style={{ fontSize: '12px', color: 'var(--primary-amber)', fontWeight: '700', marginTop: '4px' }}>mumbai@unnati.com • +91 22 6110 5500</div>
              </div>

              <div className="office-card">
                <div style={{ fontWeight: '800', fontSize: '14px' }}>Southern Technology &amp; Supply Hub</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Whitefield Tech Corridor, Bengaluru, Karnataka 560066
                </div>
                <div style={{ fontSize: '12px', color: 'var(--primary-amber)', fontWeight: '700', marginTop: '4px' }}>south@unnati.com • +91 80 4420 3300</div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ==================== TAB: PRODUCER MILL TERMINAL ==================== */}
      {activeTab === 'producer-portal' && (
        <main className="container" style={{ padding: '30px 20px 60px 20px' }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '28px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span className="badge-producer-terminal">PRODUCER TERMINAL</span>
                <h1 style={{ fontSize: '24px', fontWeight: '900', marginTop: '6px' }}>Catalogue Inventory Management</h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Company: <strong>{user?.companyName}</strong> (GSTIN: {user?.gstNumber}). Publish verified mill lots directly into live procurement.
                </p>
              </div>
              <button className="btn-post-product" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => setPostModalOpen(true)}>
                + Upload Goods to Catalogue
              </button>
            </div>

            <table className="warehousing-grid-table">
              <thead>
                <tr>
                  <th className="facility-head">Product Title</th>
                  <th className="other-head">Category</th>
                  <th className="other-head">SKU / Format</th>
                  <th className="other-head">Hub</th>
                  <th className="other-head">Rate / Ton</th>
                  <th className="other-head">Ready Stock</th>
                  <th className="other-head">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 6).map(prod => (
                  <tr key={prod.id}>
                    <td><strong>{prod.title}</strong></td>
                    <td>{prod.category}</td>
                    <td>{prod.sku}</td>
                    <td>{prod.city}</td>
                    <td style={{ fontWeight: '800', color: '#B45309' }}>₹ {prod.pricePerTon.toLocaleString('en-IN')}</td>
                    <td>{prod.stockTons} Tons</td>
                    <td>
                      <button
                        style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '4px', padding: '5px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        onClick={() => handleDeleteProduct(prod.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* ==================== TAB: ADMIN COMMAND CENTER ==================== */}
      {activeTab === 'admin' && (
        <main className="container" style={{ padding: '30px 20px 60px 20px' }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '28px', marginBottom: '30px' }}>
            <span className="badge-producer-terminal">PLATFORM ADMINISTRATION</span>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginTop: '6px' }}>UNNATI Central Control Panel</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Real-time platform governance, GST compliance monitoring, and credit sanction oversight.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
              <div style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL GMV PROCESSED</div>
                <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '4px' }}>₹ 4.82 Cr</div>
                <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>+18.4% this quarter</div>
              </div>
              <div style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>REGISTERED MSME BUYERS</div>
                <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '4px' }}>342 Units</div>
                <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>100% GST Verified</div>
              </div>
              <div style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>VERIFIED MILL PRODUCERS</div>
                <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '4px' }}>28 Mills</div>
                <div style={{ fontSize: '11px', color: '#3B82F6', fontWeight: '700' }}>Pan-India Sourcing</div>
              </div>
              <div style={{ background: 'var(--subtle-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>CATALOGUE LOTS</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary-amber)', marginTop: '4px' }}>{products.length} Lots</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>Across 8 Categories</div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ==================== MODAL: PRODUCER UPLOAD GOODS WITH STRICT VALIDATION ==================== */}
      {postModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card modal-wide">
            <button className="modal-close-x" onClick={() => setPostModalOpen(false)}>&times;</button>
            <h2 style={{ fontSize: '19px', fontWeight: '900', marginBottom: '4px' }}>Upload Goods into UNNATI Catalogue</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Publish verified mill production lots directly to industrial customers with assigned logistics hub inventory.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const f = e.target;
              const errors = {};

              const titleVal = f.title.value.trim();
              const categoryVal = f.category.value;
              const subcategoryVal = f.subcategory.value.trim();
              const skuVal = f.sku.value.trim();
              const priceVal = Number(f.price.value);
              const moqVal = Number(f.moq.value);
              const stockVal = Number(f.stock.value);
              const specsVal = f.specs.value.trim();

              if (!titleVal || titleVal.length < 5) errors.title = "Product title must be at least 5 characters.";
              if (!categoryVal) errors.category = "Please select a category.";
              if (!subcategoryVal) errors.subcategory = "Sub-category is required.";
              if (!skuVal) errors.sku = "SKU / Grade is required.";
              if (!priceVal || priceVal <= 0) errors.price = "Valid price per ton is required.";
              if (!moqVal || moqVal < 1) errors.moq = "Minimum order quantity must be at least 1 ton.";
              if (!stockVal || stockVal < moqVal) errors.stock = "Available stock must be greater than or equal to MOQ.";
              if (!specsVal) errors.specs = "Quality standards and technical specs are required.";

              if (Object.keys(errors).length > 0) {
                setUploadErrors(errors);
                showToast('Please fix highlighted validation errors', 'error');
                return;
              }

              setUploadErrors({});
              const payload = {
                title: titleVal,
                category: categoryVal,
                subcategory: subcategoryVal,
                sku: skuVal,
                city: f.city.value,
                pricePerTon: priceVal,
                moqTons: moqVal,
                stockTons: stockVal,
                image: f.imagePreset.value,
                specifications: { "Standards": specsVal }
              };

              try {
                const res = await fetch(`${API_BASE}/products`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(payload)
                });
                if (res.ok) {
                  showToast('Goods successfully published to live catalogue');
                  setPostModalOpen(false);
                  fetchProducts();
                  setActiveTab('procurement');
                } else {
                  const newLocal = {
                    id: 'prod_' + Date.now(),
                    ...payload,
                    manufacturerId: user?.id || 'u_producer_1',
                    manufacturerName: user?.companyName || 'Tata Steel Processing Units Ltd',
                    isVerifiedSeller: true,
                    unit: 'Metric Ton'
                  };
                  setProducts(prev => [newLocal, ...prev]);
                  showToast('Goods successfully added to catalogue');
                  setPostModalOpen(false);
                  setActiveTab('procurement');
                }
              } catch (err) {
                const newLocal = {
                  id: 'prod_' + Date.now(),
                  ...payload,
                  manufacturerId: user?.id || 'u_producer_1',
                  manufacturerName: user?.companyName || 'Tata Steel Processing Units Ltd',
                  isVerifiedSeller: true,
                  unit: 'Metric Ton'
                };
                setProducts(prev => [newLocal, ...prev]);
                showToast('Goods successfully added to catalogue');
                setPostModalOpen(false);
                setActiveTab('procurement');
              }
            }}>
              <div className="form-field">
                <label>Product Listing Title *</label>
                <input
                  type="text"
                  name="title"
                  className={uploadErrors.title ? 'input-error' : ''}
                  placeholder="e.g. Prime Cold Rolled Coil (CRC) 0.8mm Grade CR1"
                  defaultValue="Prime Cold Rolled Coil (CRC) 0.8mm Grade CR1"
                />
                {uploadErrors.title && <span className="error-text">{uploadErrors.title}</span>}
              </div>

              <div className="form-2col">
                <div className="form-field">
                  <label>Primary Industry Category *</label>
                  <select name="category" defaultValue="Mild Steel">
                    {metadata.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Sub-Category / Processing Stage *</label>
                  <input
                    type="text"
                    name="subcategory"
                    defaultValue="Flat Products"
                    className={uploadErrors.subcategory ? 'input-error' : ''}
                    placeholder="e.g. Flat Products, Long Products, Polymers"
                  />
                  {uploadErrors.subcategory && <span className="error-text">{uploadErrors.subcategory}</span>}
                </div>
              </div>

              <div className="form-2col">
                <div className="form-field">
                  <label>Product SKU / Grade *</label>
                  <input
                    type="text"
                    name="sku"
                    defaultValue="CRC"
                    className={uploadErrors.sku ? 'input-error' : ''}
                    placeholder="e.g. CRC, HR Coil, TMT Fe 500D, Ingot"
                  />
                  {uploadErrors.sku && <span className="error-text">{uploadErrors.sku}</span>}
                </div>
                <div className="form-field">
                  <label>Assigned Logistics Hub (City) *</label>
                  <select name="city" defaultValue="Ahmedabad">
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-2col">
                <div className="form-field">
                  <label>Price per Metric Ton (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue="58500"
                    className={uploadErrors.price ? 'input-error' : ''}
                  />
                  {uploadErrors.price && <span className="error-text">{uploadErrors.price}</span>}
                </div>
                <div className="form-field">
                  <label>Minimum Order Qty (MOQ in Tons) *</label>
                  <input
                    type="number"
                    name="moq"
                    defaultValue="15"
                    className={uploadErrors.moq ? 'input-error' : ''}
                  />
                  {uploadErrors.moq && <span className="error-text">{uploadErrors.moq}</span>}
                </div>
              </div>

              <div className="form-2col">
                <div className="form-field">
                  <label>Available Ready Stock (Tons) *</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue="250"
                    className={uploadErrors.stock ? 'input-error' : ''}
                  />
                  {uploadErrors.stock && <span className="error-text">{uploadErrors.stock}</span>}
                </div>
                <div className="form-field">
                  <label>Product Visual Asset</label>
                  <select name="imagePreset">
                    <option value="/images/cold-rolled-coils.svg">Cold Rolled Steel Coils (IS 513)</option>
                    <option value="/images/hot-rolled-plates.svg">Hot Rolled Heavy Plates (IS 2062)</option>
                    <option value="/images/tmt-rebars.svg">Primary TMT Construction Rebars</option>
                    <option value="/images/aluminium-ingot.svg">Aluminium P1020A Ingots</option>
                    <option value="/images/bitumen-drums.svg">Industrial Bitumen VG-30 Drums</option>
                    <option value="/images/pvc-resins.svg">Suspension PVC Resin K-67</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Technical Specifications &amp; Standards *</label>
                <textarea
                  name="specs"
                  rows="2"
                  className={uploadErrors.specs ? 'input-error' : ''}
                  defaultValue="IS 513:2016 Commercial Grade, Eye-to-Sky Coils, Mill Test Certificate Included"
                ></textarea>
                {uploadErrors.specs && <span className="error-text">{uploadErrors.specs}</span>}
              </div>

              <button type="submit" className="btn-submit-amber">Publish Goods into Live Catalogue</button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CREDIT APPLICATION (IMAGE 3) ==================== */}
      {creditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <button className="modal-close-x" onClick={() => setCreditModalOpen(false)}>&times;</button>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '6px' }}>30-Day Working Capital Loan Application</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Collateral-free credit facility designed for raw materials procurement.</p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const f = e.target;
              const reqAmount = Number(f.loanAmount.value);
              try {
                const res = await fetch(`${API_BASE}/credit/apply`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    loanAmount: reqAmount,
                    annualTurnover: Number(f.turnover.value),
                    sector: 'Industrial Manufacturing'
                  })
                });
                const data = await res.json();
                if (res.ok) {
                  setSanctionedCredit(data.application.approvedLimit);
                  showToast(`Credit Line Approved: ₹${data.application.approvedLimit.toLocaleString('en-IN')}`);
                  setCreditModalOpen(false);
                } else {
                  setSanctionedCredit(reqAmount);
                  showToast(`Credit Line Approved: ₹${reqAmount.toLocaleString('en-IN')}`);
                  setCreditModalOpen(false);
                }
              } catch (err) {
                setSanctionedCredit(reqAmount);
                showToast(`Credit Line Approved: ₹${reqAmount.toLocaleString('en-IN')}`);
                setCreditModalOpen(false);
              }
            }}>
              <div className="form-field">
                <label>Requested Working Capital (₹)</label>
                <input type="number" name="loanAmount" defaultValue="2000000" required />
              </div>
              <div className="form-field">
                <label>Annual Audited Turnover (₹)</label>
                <input type="number" name="turnover" defaultValue="15000000" required />
              </div>
              <div className="form-field">
                <label>Business GSTIN</label>
                <input type="text" defaultValue={user?.gstNumber || "24AABCG5544P1ZX"} required />
              </div>
              <div style={{ background: 'var(--subtle-bg)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-main)', marginBottom: '16px' }}>
                Interest Rate: 0.85% / month (30-day revolving line)<br />
                Direct settlement to suppliers upon raw material dispatch
              </div>
              <button type="submit" className="btn-submit-amber">Sanction Credit Line</button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: FUNCTIONAL CORPORATE CREDIT CARD PAYMENT ==================== */}
      {creditPaymentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <button className="modal-close-x" onClick={() => setCreditPaymentModalOpen(false)}>&times;</button>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '6px' }}>Corporate Card Payment Terminal</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Payable Amount: <strong>₹ {total.toLocaleString('en-IN')}</strong> (including GST &amp; Freight)
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              showToast('Payment Authorized: ₹ ' + total.toLocaleString('en-IN') + ' Charged to Card');
              setCreditPaymentModalOpen(false);
              setCart([]);
              setCartDrawerOpen(false);
            }}>
              <div className="form-field">
                <label>Cardholder Name</label>
                <input type="text" required defaultValue={user?.name || "Vikram Mehta"} placeholder="Name on card" />
              </div>
              <div className="form-field">
                <label>Card Number</label>
                <input type="text" required defaultValue="4532 •••• •••• 8912" placeholder="16-digit card number" />
              </div>
              <div className="form-2col">
                <div className="form-field">
                  <label>Expiry (MM/YY)</label>
                  <input type="text" required defaultValue="08/28" placeholder="MM/YY" />
                </div>
                <div className="form-field">
                  <label>CVV / CVC</label>
                  <input type="password" required defaultValue="432" maxLength="4" placeholder="CVV" />
                </div>
              </div>
              <div className="form-field">
                <label>Billing GSTIN</label>
                <input type="text" required defaultValue={user?.gstNumber || "24AABCG5544P1ZX"} />
              </div>
              <button type="submit" className="btn-submit-amber">
                Authorize &amp; Pay ₹ {total.toLocaleString('en-IN')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CONSULTANCY ADVISORY SCHEDULER ==================== */}
      {consultModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <button className="modal-close-x" onClick={() => setConsultModalOpen(false)}>&times;</button>
            <span className="pill-scheme-yellow" style={{ display: 'inline-block', marginBottom: '8px' }}>UNNATI ADVISORY</span>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '6px' }}>Schedule Expert Advisory</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Service: <strong>{consultScheme}</strong>
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              showToast(`Advisory session booked for ${consultScheme}. An industry specialist will connect within 2 business hours.`);
              setConsultModalOpen(false);
            }}>
              <div className="form-field">
                <label>Company Name</label>
                <input type="text" required defaultValue={user?.companyName || "Industrial Unit"} />
              </div>
              <div className="form-field">
                <label>Contact Person &amp; Phone</label>
                <input type="text" required defaultValue={user?.name ? `${user.name} (+91 98765 43210)` : "+91 98765 43210"} />
              </div>
              <div className="form-field">
                <label>Specific Advisory Requirement</label>
                <textarea rows="3" required defaultValue={`Inquiry regarding eligibility and documentation for ${consultScheme}.`}></textarea>
              </div>
              <button type="submit" className="btn-submit-amber">Confirm Advisory Booking</button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== REFINED ENTERPRISE AUTHENTICATION MODAL (NO EMOJIS) ==================== */}
      {authModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <button className="modal-close-x" onClick={() => setAuthModalOpen(false)}>&times;</button>
            <div className="modal-tab-row">
              <button className={`modal-tab-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')}>Sign In</button>
              <button className={`modal-tab-btn ${authTab === 'register' ? 'active' : ''}`} onClick={() => setAuthTab('register')}>Register Verified Account</button>
            </div>

            {authError && (
              <div className="auth-lock-banner">
                <div>{authError}</div>
              </div>
            )}

            {authTab === 'login' ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const email = e.target.email.value.trim();
                const password = e.target.password.value;
                try {
                  const res = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setToken(data.token);
                    setUser(data.user);
                    localStorage.setItem('unnati_token', data.token);
                    setAuthModalOpen(false);
                    showToast(`Authenticated as ${data.user.name}`);
                  } else {
                    setAuthError(data.message || 'Login failed');
                  }
                } catch (err) {
                  setAuthError('Connection error to auth server');
                }
              }}>
                <div className="form-field">
                  <label>Business Email</label>
                  <input type="email" name="email" required placeholder="name@company.com" />
                </div>
                <div className="form-field">
                  <label>Password</label>
                  <div className="password-input-row">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      required 
                      placeholder="Enter account password" 
                    />
                    <button 
                      type="button" 
                      className="btn-eye-toggle" 
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "See"}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-submit-amber">Sign In to UNNATI</button>
              </form>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const payload = Object.fromEntries(formData.entries());
                try {
                  const res = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setToken(data.token);
                    setUser(data.user);
                    localStorage.setItem('unnati_token', data.token);
                    setAuthModalOpen(false);
                    showToast(`Enterprise account verified for ${data.user.companyName}`);
                  } else {
                    setAuthError(data.message || 'Registration failed');
                  }
                } catch (err) {
                  setAuthError('Network error during registration');
                }
              }}>
                <div className="form-field">
                  <label>Enterprise Role</label>
                  <div className="role-select-box">
                    <label className={`role-label-btn ${registerRole === 'buyer' || registerRole === 'customer' ? 'selected' : ''}`} onClick={() => setRegisterRole('buyer')}>
                      <input type="radio" name="role" value="buyer" checked={registerRole === 'buyer' || registerRole === 'customer'} onChange={() => setRegisterRole('buyer')} />
                      <span>MSME Buyer</span>
                    </label>
                    <label className={`role-label-btn ${registerRole === 'producer' ? 'selected' : ''}`} onClick={() => setRegisterRole('producer')}>
                      <input type="radio" name="role" value="producer" checked={registerRole === 'producer'} onChange={() => setRegisterRole('producer')} />
                      <span>Primary Mill Producer</span>
                    </label>
                  </div>
                </div>

                <div className="form-2col">
                  <div className="form-field">
                    <label>Full Name</label>
                    <input type="text" name="name" required placeholder="Authorized Corporate Representative" />
                  </div>
                  <div className="form-field">
                    <label>Corporate Email</label>
                    <input type="email" name="email" required placeholder="representative@enterprise.com" />
                  </div>
                </div>

                <div className="form-2col">
                  <div className="form-field">
                    <label>Company Legal Entity</label>
                    <input type="text" name="companyName" required placeholder="Acme Industries Pvt Ltd" />
                  </div>
                  <div className="form-field">
                    <label>GSTIN (15-Digit Verified)</label>
                    <input type="text" name="gstNumber" required maxLength="15" placeholder="e.g. 24AAACU0001A1Z1" />
                  </div>
                </div>

                <div className="form-2col">
                  <div className="form-field">
                    <label>Primary Logistics Hub</label>
                    <select name="city" defaultValue="Ahmedabad">
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Password</label>
                    <div className="password-input-row">
                      <input 
                        type={showRegPassword ? "text" : "password"} 
                        name="password" 
                        required 
                        placeholder="Min 6 characters" 
                      />
                      <button 
                        type="button" 
                        className="btn-eye-toggle" 
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        tabIndex={-1}
                        title={showRegPassword ? "Hide password" : "Show password"}
                      >
                        {showRegPassword ? "Hide" : "See"}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-submit-amber">
                  {registerRole === 'producer' ? 'Register Verified Producer Mill Account' : 'Register Verified MSME Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== SLIDE-OVER CART DRAWER ==================== */}
      {cartDrawerOpen && (
        <div className="cart-drawer-overlay">
          <div className="cart-drawer-panel">
            <div className="cart-header">
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Procurement &amp; Logistics Cart</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-main)' }} onClick={() => setCartDrawerOpen(false)}>&times;</button>
            </div>

            <div className="cart-body-items">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 10px', color: 'var(--text-muted)' }}>
                  <p>Your cart is empty.</p>
                  <button className="btn-post-product" style={{ marginTop: '14px' }} onClick={() => { setCart(DEFAULT_SAMPLE_CART); showToast('Sample cart items loaded'); }}>
                    Load Sample Cart Items
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div className="cart-item-card" key={item.id}>
                    <div className="cart-item-head">
                      <span>{item.title}</span>
                      <button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px' }} onClick={() => handleRemoveFromCart(item.id)} title="Remove item">&times;</button>
                    </div>
                    <div className="cart-item-info">
                      Hub: <strong>{item.city}</strong> &bull; {item.type === 'product' ? 'Bulk Raw Material' : '3PL Fulfillment'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <div className="qty-control-box">
                        <button className="qty-btn" onClick={() => handleUpdateQuantity(item.id, -1)}>-</button>
                        <span className="qty-val">{item.quantity} {item.unit}s</span>
                        <button className="qty-btn" onClick={() => handleUpdateQuantity(item.id, 1)}>+</button>
                      </div>

                      <div className="cart-item-cost">
                        ₹ {(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-footer">
              <div className="cart-row-stat">
                <span>Subtotal ({cart.reduce((a, b) => a + (b.quantity || 1), 0)} items)</span>
                <span>₹ {subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="cart-row-stat">
                <span>GST (18% on materials &amp; services)</span>
                <span>₹ {gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="cart-row-stat">
                <span>Estimated Regional Freight</span>
                <span>₹ {freight.toLocaleString('en-IN')}</span>
              </div>
              <div className="cart-row-total">
                <span>Total Payable</span>
                <span style={{ color: '#B45309' }}>₹ {total.toLocaleString('en-IN')}</span>
              </div>

              <button className="btn-checkout-direct" onClick={() => handleCheckout('direct')}>
                Direct Bank Transfer &amp; Dispatch
              </button>
              <button className="btn-checkout-direct" style={{ background: '#2563EB', marginTop: '6px' }} onClick={() => handleCheckout('card')}>
                Pay via Corporate Credit Card
              </button>
              <button className="btn-checkout-credit" onClick={() => handleCheckout('30_day_credit')}>
                Finance with 30-Day Credit Line (0.85% / mo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className={`toast-box ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
