const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'store.json');

const sampleCartItems = [
  {
    id: "cart_prod_1",
    productId: "prod_1",
    title: "Prime Quality Cold Rolled Coil (CRC) 0.8mm - 2.0mm",
    type: "product",
    category: "Mild Steel",
    sku: "CRC",
    city: "Ahmedabad",
    manufacturer: "Tata Steel Processing Units Ltd",
    price: 58500,
    unit: "Metric Ton",
    quantity: 15,
    specifications: "IS 513:2016 Grade CR1, Width 1250mm",
    addedAt: new Date().toISOString()
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
    bookingDate: "2026-11-25",
    addedAt: new Date().toISOString()
  }
];

const defaultData = {
  users: [
    {
      id: "u_admin_1",
      name: "Devendra Verma",
      email: "admin@unnati.com",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "admin",
      companyName: "UNNATI Platform Operations & Governance",
      gstNumber: "24AAACU0001A1Z1",
      isVerified: true,
      city: "Ahmedabad",
      createdAt: new Date().toISOString()
    },
    {
      id: "u_producer_1",
      name: "Rajesh Sharma",
      email: "producer@tata.com",
      passwordHash: bcrypt.hashSync("producer123", 10),
      role: "producer", // Primary Producer & Mill Supplier
      companyName: "Tata Steel Processing Units Ltd",
      gstNumber: "24AAACT2727Q1ZW",
      isVerified: true,
      city: "Ahmedabad",
      createdAt: new Date().toISOString()
    },
    {
      id: "u_mfg_compat",
      name: "Sunil Agarwal",
      email: "manufacturer@tata.com",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "producer",
      companyName: "Tata Steel Processing Units Ltd",
      gstNumber: "24AAACT2727Q1ZW",
      isVerified: true,
      city: "Ahmedabad",
      createdAt: new Date().toISOString()
    },
    {
      id: "u_buyer_1",
      name: "Vikram Mehta",
      email: "buyer@gujaratfab.com",
      passwordHash: bcrypt.hashSync("buyer123", 10),
      role: "customer", // MSME Customer / Industrial Buyer
      companyName: "Gujarat Precision Fabricators Ltd",
      gstNumber: "24AABCG5544P1ZX",
      isVerified: true,
      city: "Ahmedabad",
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: "mild-steel",
      name: "Mild Steel",
      subcategories: [
        {
          id: "flat-products",
          name: "Flat Products",
          skus: ["CRC", "HR Coil", "HR Plate", "HBC"]
        },
        {
          id: "semi-finished",
          name: "Semi-Finished",
          skus: ["Billets", "Blooms", "Slabs", "Ingots"]
        },
        {
          id: "long-products",
          name: "Long Products",
          skus: ["TMT Rebars (Fe 500D)", "Wire Rods", "Round Bars", "Square Bars"]
        },
        {
          id: "structure",
          name: "Structure",
          skus: ["ISMB Beams", "Channels", "Equal Angles", "Unequal Angles"]
        }
      ]
    },
    {
      id: "non-ferrous",
      name: "Non Ferrous",
      subcategories: [
        {
          id: "aluminium",
          name: "Aluminium Products",
          skus: ["Aluminium Ingot", "Aluminium Wire Rod", "Extrusion Billets", "Aluminium Sheets"]
        },
        {
          id: "copper",
          name: "Copper & Zinc",
          skus: ["Copper Cathode", "Zinc Ingot", "Brass Billets", "Lead Ingots"]
        }
      ]
    },
    {
      id: "polymers-packaging",
      name: "Polymers & Packaging",
      subcategories: [
        {
          id: "polymers",
          name: "Polymer Resins",
          skus: ["PVC", "HDPE Blow Moulding", "LDPE Film Grade", "PP Raffia"]
        }
      ]
    },
    {
      id: "chemicals",
      name: "Chemicals",
      subcategories: [
        {
          id: "industrial-chemicals",
          name: "Bulk Industrial",
          skus: ["Methanol", "Caustic Soda Lye", "Sulfuric Acid", "Toluene"]
        }
      ]
    },
    {
      id: "energy-petroleum",
      name: "Energy & Petroleum",
      subcategories: [
        {
          id: "petro-products",
          name: "Petroleum Fractions",
          skus: ["Bitumen VG 30", "Bitumen VG 40", "Furnace Oil", "Pet Coke"]
        }
      ]
    },
    {
      id: "stainless-steel",
      name: "Stainless Steel",
      subcategories: [
        {
          id: "ss-flats",
          name: "SS Flat & Coils",
          skus: ["SS 304 Coil", "SS 316 Plate", "SS 201 Sheet", "SS Bright Bars"]
        }
      ]
    },
    {
      id: "pipes",
      name: "Pipes",
      subcategories: [
        {
          id: "industrial-pipes",
          name: "Industrial & Structural",
          skus: ["MS ERW Pipes", "Seamless Steel Pipes", "GI Square Hollow Pipes", "Ductile Iron Pipes"]
        }
      ]
    },
    {
      id: "infra-construction",
      name: "Infrastructure & Construction",
      subcategories: [
        {
          id: "construction-bulk",
          name: "Bulk Construction",
          skus: ["Secondary TMT", "OPC Cement Grade 53", "PPC Cement", "Prestressed Steel Strands"]
        }
      ]
    }
  ],
  cities: ["Ahmedabad", "Mumbai", "Pune", "Mysore", "Surat", "Bangalore", "Nashik"],
  products: [
    {
      id: "prod_1",
      title: "Prime Quality Cold Rolled Coil (CRC) 0.8mm - 2.0mm",
      category: "Mild Steel",
      subcategory: "Flat Products",
      sku: "CRC",
      city: "Ahmedabad",
      manufacturerId: "u_producer_1",
      manufacturerName: "Tata Steel Processing Units Ltd",
      isVerifiedSeller: true,
      pricePerTon: 58500,
      moqTons: 15,
      stockTons: 280,
      unit: "Metric Ton",
      specifications: {
        "Grade": "CR1 / CR2 Commercial Grade",
        "Thickness Range": "0.8mm - 2.0mm",
        "Width": "1250mm",
        "Standards": "IS 513 (Part 1): 2016",
        "Packaging": "Eye-to-Sky moisture wrapped coils"
      },
      image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod_2",
      title: "Hot Rolled Coil (HR Coil) Structural Grade",
      category: "Mild Steel",
      subcategory: "Flat Products",
      sku: "HR Coil",
      city: "Mumbai",
      manufacturerId: "u_producer_1",
      manufacturerName: "Jindal Steel & Power Ltd",
      isVerifiedSeller: true,
      pricePerTon: 53200,
      moqTons: 25,
      stockTons: 640,
      unit: "Metric Ton",
      specifications: {
        "Grade": "IS 2062 E250 / E350",
        "Thickness": "2.5mm - 12mm",
        "Finish": "Pickled & Oiled / Mill Scale"
      },
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod_3",
      title: "Heavy Duty HR Plate IS 2062 Gr.B",
      category: "Mild Steel",
      subcategory: "Flat Products",
      sku: "HR Plate",
      city: "Pune",
      manufacturerId: "u_producer_1",
      manufacturerName: "Jindal Steel & Power Ltd",
      isVerifiedSeller: true,
      pricePerTon: 55800,
      moqTons: 20,
      stockTons: 310,
      unit: "Metric Ton",
      specifications: {
        "Thickness": "10mm - 60mm",
        "Length": "6000mm - 12000mm",
        "Width": "2000mm - 2500mm"
      },
      image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod_4",
      title: "High Boron Commercial Wire / HBC",
      category: "Mild Steel",
      subcategory: "Flat Products",
      sku: "HBC",
      city: "Ahmedabad",
      manufacturerId: "u_producer_1",
      manufacturerName: "Tata Steel Processing Units Ltd",
      isVerifiedSeller: true,
      pricePerTon: 59800,
      moqTons: 10,
      stockTons: 120,
      unit: "Metric Ton",
      specifications: {
        "Carbon": "0.15% - 0.22%",
        "Boron Addition": "0.002% - 0.004%"
      },
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod_5",
      title: "Pure Aluminium Ingot 99.7% Grade (Hindalco Specs)",
      category: "Non Ferrous",
      subcategory: "Aluminium Products",
      sku: "Aluminium Ingot",
      city: "Ahmedabad",
      manufacturerId: "u_producer_1",
      manufacturerName: "Tata Steel Processing Units Ltd",
      isVerifiedSeller: true,
      pricePerTon: 224000,
      moqTons: 5,
      stockTons: 85,
      unit: "Metric Ton",
      specifications: {
        "Purity": "99.7% Min",
        "Ingot Weight": "20 kg each"
      },
      image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod_6",
      title: "Paving Grade Bitumen VG-30 Bulk Tankers",
      category: "Energy & Petroleum",
      subcategory: "Petroleum Fractions",
      sku: "Bitumen VG 30",
      city: "Mumbai",
      manufacturerId: "u_producer_1",
      manufacturerName: "Bharat Petroleum Refineries",
      isVerifiedSeller: true,
      pricePerTon: 41200,
      moqTons: 20,
      stockTons: 400,
      unit: "Metric Ton",
      specifications: {
        "Viscosity at 60C": "2400 - 3600 Poises",
        "Penetration at 25C": "45 - 70"
      },
      image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod_7",
      title: "High Purity Industrial Methanol 99.85%",
      category: "Chemicals",
      subcategory: "Bulk Industrial",
      sku: "Methanol",
      city: "Ahmedabad",
      manufacturerId: "u_producer_1",
      manufacturerName: "Gujarat State Fertilizers & Chemicals",
      isVerifiedSeller: true,
      pricePerTon: 28400,
      moqTons: 16,
      stockTons: 240,
      unit: "Metric Ton",
      specifications: {
        "Purity": "99.85% wt min",
        "Density at 20C": "0.791 - 0.793 g/ml"
      },
      image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod_8",
      title: "Suspension Grade PVC Resin K-67 (Pipe & Profile Grade)",
      category: "Polymers & Packaging",
      subcategory: "Polymer Resins",
      sku: "PVC",
      city: "Pune",
      manufacturerId: "u_producer_1",
      manufacturerName: "Reliance Polymers Ltd",
      isVerifiedSeller: true,
      pricePerTon: 74500,
      moqTons: 10,
      stockTons: 150,
      unit: "Metric Ton",
      specifications: {
        "K-Value": "67 ± 1",
        "Apparent Density": "0.52 - 0.58 g/cc"
      },
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod_9",
      title: "Secondary Re-rolled TMT Rebars Fe 500D (8mm to 32mm)",
      category: "Infrastructure & Construction",
      subcategory: "Bulk Construction",
      sku: "Secondary TMT",
      city: "Bangalore",
      manufacturerId: "u_producer_1",
      manufacturerName: "Kamdhenu Steel Rolling Mills",
      isVerifiedSeller: true,
      pricePerTon: 47800,
      moqTons: 12,
      stockTons: 500,
      unit: "Metric Ton",
      specifications: {
        "Standard": "IS 1786:2008 Grade Fe 500D",
        "Lengths": "12 Meters standard bundles"
      },
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date().toISOString()
    }
  ],
  warehousingProviders: [
    {
      facility: "Cold Storage",
      provider: "Snowman Logistics Ltd",
      baseFeePerMonth: 28000,
      cities: ["Ahmedabad", "Mumbai", "Pune", "Bangalore"]
    },
    {
      facility: "Cold Storage",
      provider: "TVS ColdChain Solutions",
      baseFeePerMonth: 29500,
      cities: ["Ahmedabad", "Mumbai", "Pune", "Mysore", "Nashik", "Surat"]
    },
    {
      facility: "Drop Shipping",
      provider: "Adani Logistics 3PL",
      baseFeePerMonth: 18500,
      cities: ["Ahmedabad", "Mumbai", "Pune", "Bangalore", "Nashik", "Mysore", "Surat"]
    },
    {
      facility: "Drop Shipping",
      provider: "Concor Multi-Modal Hub",
      baseFeePerMonth: 16800,
      cities: ["Ahmedabad", "Mumbai", "Pune", "Bangalore"]
    },
    {
      facility: "Inventory Check",
      provider: "SGS India Industrial Inspection",
      baseFeePerMonth: 12000,
      cities: ["Ahmedabad", "Mumbai", "Pune", "Mysore", "Bangalore", "Nashik", "Surat"]
    },
    {
      facility: "Customize Facilities",
      provider: "UNNATI Enterprise Solutions",
      baseFeePerMonth: 35000,
      cities: ["Ahmedabad", "Mumbai", "Pune", "Mysore", "Bangalore", "Nashik", "Surat"]
    }
  ],
  cart: {
    "u_buyer_1": JSON.parse(JSON.stringify(sampleCartItems)),
    "prototype_default": JSON.parse(JSON.stringify(sampleCartItems))
  },
  creditApplications: [
    {
      id: "cred_sample_1",
      userId: "u_buyer_1",
      applicantName: "Vikram Mehta",
      companyName: "Gujarat Precision Fabricators Ltd",
      gstNumber: "24AABCG5544P1ZX",
      requestedAmount: 2500000,
      approvedLimit: 2250000,
      annualTurnover: 18000000,
      tenureDays: 30,
      interestRatePercentPerMonth: 0.85,
      riskScore: 785,
      status: "APPROVED",
      createdAt: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: "ORD_789421",
      userId: "u_buyer_1",
      buyerName: "Vikram Mehta",
      companyName: "Gujarat Precision Fabricators Ltd",
      total: 1083490,
      status: "CONFIRMED",
      paymentMethod: "30_day_credit",
      paymentStatus: "FINANCED_VIA_CREDIT_LINE",
      items: JSON.parse(JSON.stringify(sampleCartItems)),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]
};

class DB {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    }
  }

  read() {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      return defaultData;
    }
  }

  write(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Users
  getUserByEmail(email) {
    const data = this.read();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id) {
    const data = this.read();
    return data.users.find(u => u.id === id);
  }

  createUser(user) {
    const data = this.read();
    data.users.push(user);
    this.write(data);
    return user;
  }

  // Products
  getProducts(filters = {}) {
    const data = this.read();
    return data.products.filter(p => {
      if (filters.category && p.category.toLowerCase() !== filters.category.toLowerCase()) return false;
      if (filters.subcategory && p.subcategory.toLowerCase() !== filters.subcategory.toLowerCase()) return false;
      if (filters.sku && p.sku.toLowerCase() !== filters.sku.toLowerCase()) return false;
      if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) return false;
      if (filters.manufacturerId && p.manufacturerId !== filters.manufacturerId) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches = p.title.toLowerCase().includes(q) ||
                        p.category.toLowerCase().includes(q) ||
                        p.sku.toLowerCase().includes(q) ||
                        p.manufacturerName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }

  addProduct(product) {
    const data = this.read();
    data.products.unshift(product);
    this.write(data);
    return product;
  }

  deleteProduct(productId) {
    const data = this.read();
    data.products = data.products.filter(p => p.id !== productId);
    this.write(data);
    return true;
  }

  // Cart (with rich default prototype sample items)
  getCart(userId) {
    const data = this.read();
    if (!data.cart[userId] || data.cart[userId].length === 0) {
      data.cart[userId] = JSON.parse(JSON.stringify(sampleCartItems));
      this.write(data);
    }
    return data.cart[userId];
  }

  addToCart(userId, item) {
    const data = this.read();
    if (!data.cart[userId]) {
      data.cart[userId] = JSON.parse(JSON.stringify(sampleCartItems));
    }
    const existingIndex = data.cart[userId].findIndex(i => i.id === item.id);
    if (existingIndex > -1) {
      data.cart[userId][existingIndex].quantity += (item.quantity || 1);
    } else {
      data.cart[userId].unshift(item);
    }
    this.write(data);
    return data.cart[userId];
  }

  updateCartQuantity(userId, itemId, delta) {
    const data = this.read();
    if (!data.cart[userId]) return [];
    const item = data.cart[userId].find(i => i.id === itemId);
    if (item) {
      item.quantity = Math.max(1, item.quantity + delta);
      this.write(data);
    }
    return data.cart[userId];
  }

  removeFromCart(userId, itemId) {
    const data = this.read();
    if (!data.cart[userId]) return [];
    data.cart[userId] = data.cart[userId].filter(i => i.id !== itemId);
    this.write(data);
    return data.cart[userId];
  }

  clearCart(userId) {
    const data = this.read();
    data.cart[userId] = [];
    this.write(data);
    return [];
  }

  // Orders
  createOrder(order) {
    const data = this.read();
    data.orders.unshift(order);
    this.write(data);
    return order;
  }

  getOrders() {
    const data = this.read();
    return data.orders || [];
  }

  // Credit Application
  createCreditApplication(app) {
    const data = this.read();
    data.creditApplications.unshift(app);
    this.write(data);
    return app;
  }

  getCreditApplications() {
    const data = this.read();
    return data.creditApplications || [];
  }

  approveCreditApplication(appId) {
    const data = this.read();
    const app = data.creditApplications.find(a => a.id === appId);
    if (app) {
      app.status = 'APPROVED';
      this.write(data);
    }
    return app;
  }
}

module.exports = new DB();
