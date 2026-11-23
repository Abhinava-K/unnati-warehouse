// ==========================================================================
// UNNATI B2B Raw Materials Platform - Client Application Logic
// ==========================================================================

const API_BASE = 'http://localhost:5000/api';

// Application State
const state = {
  currentUser: null,
  token: localStorage.getItem('unnati_token') || null,
  activeTab: 'procurement',
  metadata: {
    categories: [],
    cities: [],
    popularTags: [],
    marketPrices: []
  },
  filters: {
    category: 'Mild Steel',
    subcategory: 'Flat Products',
    sku: 'CRC',
    city: 'Ahmedabad',
    search: ''
  },
  products: [],
  cart: []
};

// ==================== DOM ELEMENTS ====================
const el = {
  // Auth & Nav
  authActionsContainer: document.getElementById('auth-actions-container'),
  loginModalBtn: document.getElementById('login-modal-btn'),
  cartToggleBtn: document.getElementById('cart-toggle-btn'),
  cartCount: document.getElementById('cart-count'),
  serviceTabs: document.getElementById('service-tabs'),
  navBrand: document.getElementById('nav-brand'),
  toastContainer: document.getElementById('toast-container'),

  // Megamenu & Products
  categoryList: document.getElementById('category-list'),
  subcategoryList: document.getElementById('subcategory-list'),
  skuList: document.getElementById('sku-list'),
  cityList: document.getElementById('city-list'),
  productGrid: document.getElementById('product-grid'),
  activeFilterIndicator: document.getElementById('active-filter-indicator'),
  btnResetFilters: document.getElementById('btn-reset-filters'),
  btnViewNews: document.getElementById('btn-view-news'),
  popularTagsContainer: document.getElementById('popular-tags-container'),
  procurementSearchInput: document.getElementById('procurement-search-input'),
  procurementSearchBtn: document.getElementById('procurement-search-btn'),
  postProductBtn: document.getElementById('post-product-btn'),

  // Warehousing
  warehousingTable: document.getElementById('warehousing-table'),
  btnViewCartTable: document.getElementById('btn-view-cart-table'),

  // Credit
  btnOpenCreditModal: document.getElementById('btn-open-credit-modal'),
  btnCalculateCredit: document.getElementById('btn-calculate-credit'),
  calcLoanAmt: document.getElementById('calc-loan-amt'),
  calcTurnover: document.getElementById('calc-turnover'),
  calcInterestDisplay: document.getElementById('calc-interest-display'),
  creditEligibilityResult: document.getElementById('credit-eligibility-result'),

  // Market Research
  tickerGrid: document.getElementById('ticker-grid'),
  newsletterEmail: document.getElementById('newsletter-email'),
  btnSubscribeNewsletter: document.getElementById('btn-subscribe-newsletter'),

  // Modals
  authModal: document.getElementById('auth-modal'),
  authModalClose: document.getElementById('auth-modal-close'),
  tabBtnLogin: document.getElementById('tab-btn-login'),
  tabBtnRegister: document.getElementById('tab-btn-register'),
  formLogin: document.getElementById('form-login'),
  formRegister: document.getElementById('form-register'),
  authNoticeBanner: document.getElementById('auth-notice-banner'),

  postProductModal: document.getElementById('post-product-modal'),
  postProductClose: document.getElementById('post-product-close'),
  formPostProduct: document.getElementById('form-post-product'),

  creditAppModal: document.getElementById('credit-app-modal'),
  creditAppClose: document.getElementById('credit-app-close'),
  formCreditApp: document.getElementById('form-credit-app'),

  // Cart Drawer
  cartDrawerBackdrop: document.getElementById('cart-drawer-backdrop'),
  cartDrawerClose: document.getElementById('cart-drawer-close'),
  cartItemsContainer: document.getElementById('cart-items-container'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  cartGst: document.getElementById('cart-gst'),
  cartFreight: document.getElementById('cart-freight'),
  cartTotal: document.getElementById('cart-total'),
  btnCheckoutDirect: document.getElementById('btn-checkout-direct'),
  btnCheckoutCredit: document.getElementById('btn-checkout-credit')
};

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> <span>${message}</span>`;
  el.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==================== AUTH & SECURITY GATEKEEPERS ====================

// Check if user is logged in AND verified before performing actions!
function ensureVerifiedAuth(actionDescription = 'perform this action') {
  if (!state.currentUser || !state.token) {
    el.authNoticeBanner.innerHTML = `🔒 <strong>Authentication Required:</strong> Please sign in with a verified MSME or Manufacturer account to ${actionDescription}.`;
    openModal(el.authModal);
    showToast('Please log in or register to continue', 'warning');
    return false;
  }

  if (!state.currentUser.isVerified) {
    el.authNoticeBanner.innerHTML = `⚠️ <strong>Account Verification Pending:</strong> Your account must have a verified GSTIN to ${actionDescription}.`;
    openModal(el.authModal);
    showToast('Verified account required', 'error');
    return false;
  }

  return true;
}

async function fetchCurrentUser() {
  if (!state.token) {
    renderAuthUI();
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok) {
      const data = await res.json();
      state.currentUser = data.user;
      renderAuthUI();
      fetchCart();
    } else {
      logoutUser();
    }
  } catch (err) {
    console.error('Failed to fetch user:', err);
    logoutUser();
  }
}

function renderAuthUI() {
  if (state.currentUser) {
    const roleBadge = state.currentUser.role === 'manufacturer' ? '🏭 Manufacturer' : '🛒 MSME Buyer';
    el.authActionsContainer.innerHTML = `
      <div class="user-profile-pill">
        <span>👤 <strong>${state.currentUser.name}</strong> (${roleBadge})</span>
        <span class="verified-tag">✓ GST Verified</span>
        <button class="btn-text-logout" id="logout-btn">Logout</button>
      </div>
    `;
    document.getElementById('logout-btn').addEventListener('click', logoutUser);
  } else {
    el.authActionsContainer.innerHTML = `
      <button class="btn-amber pill-btn" id="login-modal-btn">Login / Sign Up</button>
    `;
    document.getElementById('login-modal-btn').addEventListener('click', () => {
      el.authNoticeBanner.innerHTML = `🔒 <strong>Verified Access Required:</strong> Sign in with verified credentials or register your unit to access trading and warehousing.`;
      openModal(el.authModal);
    });
  }
}

function logoutUser() {
  state.currentUser = null;
  state.token = null;
  state.cart = [];
  localStorage.removeItem('unnati_token');
  renderAuthUI();
  updateCartBadge();
  showToast('Logged out successfully', 'success');
}

// ==================== TABS NAVIGATION ====================
function setupTabs() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabKey = tab.getAttribute('data-tab');
      switchTab(tabKey);
    });
  });

  document.querySelectorAll('.tab-switch-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabKey = link.getAttribute('data-tab');
      switchTab(tabKey);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  el.navBrand.addEventListener('click', () => switchTab('procurement'));
}

function switchTab(tabKey) {
  state.activeTab = tabKey;
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabKey);
  });
  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === `pane-${tabKey}`);
  });
}

// ==================== METADATA & 4-TIER MEGAMENU ====================
async function fetchMetadata() {
  try {
    const res = await fetch(`${API_BASE}/metadata`);
    const data = await res.json();
    state.metadata = data;

    renderMegaMenu();
    renderPopularTags();
    renderMarketTicker();
    fetchProducts();
  } catch (err) {
    console.error('Failed to fetch metadata:', err);
  }
}

function renderPopularTags() {
  if (!state.metadata.popularTags) return;
  el.popularTagsContainer.innerHTML = state.metadata.popularTags.map(tag => `
    <button class="tag-chip ${state.filters.sku === tag || state.filters.search === tag ? 'active' : ''}" data-tag="${tag}">
      <span class="chip-dot"></span> ${tag}
    </button>
  `).join('');

  el.popularTagsContainer.querySelectorAll('.tag-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      state.filters.search = tag;
      el.procurementSearchInput.value = tag;
      fetchProducts();
      document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function renderMarketTicker() {
  if (!state.metadata.marketPrices) return;
  el.tickerGrid.innerHTML = state.metadata.marketPrices.map(item => `
    <div class="ticker-item">
      <div class="ticker-name">${item.commodity}</div>
      <div class="ticker-price">${item.price}</div>
      <div class="ticker-change ${item.change.startsWith('+') ? 'change-up' : 'change-down'}">
        ${item.change.startsWith('+') ? '▲' : '▼'} ${item.change}
      </div>
    </div>
  `).join('');
}

// 4-Tier Megamenu Cascade
function renderMegaMenu() {
  const { categories, cities } = state.metadata;
  if (!categories || !categories.length) return;

  // 1. Column 1: Primary Categories
  el.categoryList.innerHTML = categories.map(cat => `
    <div class="menu-item ${cat.name === state.filters.category ? 'active-category' : ''}" data-category="${cat.name}">
      <span>${cat.name}</span>
      <span class="item-arrow">&rsaquo;</span>
    </div>
  `).join('');

  el.categoryList.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      state.filters.category = item.getAttribute('data-category');
      // Set default subcategory and sku for selected category
      const catObj = categories.find(c => c.name === state.filters.category);
      if (catObj && catObj.subcategories.length) {
        state.filters.subcategory = catObj.subcategories[0].name;
        state.filters.sku = catObj.subcategories[0].skus[0] || '';
      }
      renderMegaMenu();
      fetchProducts();
    });
  });

  // 2. Column 2: Sub-Categories
  const currentCatObj = categories.find(c => c.name === state.filters.category) || categories[0];
  if (currentCatObj && currentCatObj.subcategories) {
    el.subcategoryList.innerHTML = currentCatObj.subcategories.map(sub => `
      <div class="menu-item ${sub.name === state.filters.subcategory ? 'active-subcategory' : ''}" data-subcategory="${sub.name}">
        <span>• ${sub.name}</span>
        <span class="item-arrow">&rsaquo;</span>
      </div>
    `).join('');

    el.subcategoryList.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        state.filters.subcategory = item.getAttribute('data-subcategory');
        const subObj = currentCatObj.subcategories.find(s => s.name === state.filters.subcategory);
        if (subObj && subObj.skus.length) {
          state.filters.sku = subObj.skus[0];
        }
        renderMegaMenu();
        fetchProducts();
      });
    });
  }

  // 3. Column 3: Products / SKUs
  const currentSubObj = currentCatObj?.subcategories?.find(s => s.name === state.filters.subcategory) || currentCatObj?.subcategories?.[0];
  if (currentSubObj && currentSubObj.skus) {
    el.skuList.innerHTML = currentSubObj.skus.map(sku => `
      <div class="menu-item ${sku === state.filters.sku ? 'active-sku' : ''}" data-sku="${sku}">
        <span>${sku}</span>
      </div>
    `).join('');

    el.skuList.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        state.filters.sku = item.getAttribute('data-sku');
        renderMegaMenu();
        fetchProducts();
      });
    });
  }

  // 4. Column 4: Cities
  el.cityList.innerHTML = cities.map(city => `
    <div class="menu-item ${city === state.filters.city ? 'active-city' : ''}" data-city="${city}">
      <span>${city}</span>
      ${city === state.filters.city ? '<span class="item-check">✓</span>' : ''}
    </div>
  `).join('');

  el.cityList.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      state.filters.city = item.getAttribute('data-city');
      renderMegaMenu();
      fetchProducts();
    });
  });
}

// Reset Megamenu Filters
el.btnResetFilters.addEventListener('click', () => {
  state.filters = {
    category: '',
    subcategory: '',
    sku: '',
    city: '',
    search: ''
  };
  el.procurementSearchInput.value = '';
  document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
  renderMegaMenu();
  fetchProducts();
  showToast('Filters reset to show all products');
});

el.btnViewNews.addEventListener('click', () => switchTab('market-research'));

// Search input
el.procurementSearchBtn.addEventListener('click', () => {
  state.filters.search = el.procurementSearchInput.value.trim();
  fetchProducts();
});

el.procurementSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    state.filters.search = el.procurementSearchInput.value.trim();
    fetchProducts();
  }
});

// ==================== PRODUCTS CATALOG ====================
async function fetchProducts() {
  try {
    const params = new URLSearchParams();
    if (state.filters.category) params.append('category', state.filters.category);
    if (state.filters.subcategory) params.append('subcategory', state.filters.subcategory);
    if (state.filters.sku) params.append('sku', state.filters.sku);
    if (state.filters.city) params.append('city', state.filters.city);
    if (state.filters.search) params.append('search', state.filters.search);

    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    const data = await res.json();
    state.products = data.products;

    renderProductGrid();
    updateFilterIndicator();
  } catch (err) {
    console.error('Error fetching products:', err);
  }
}

function updateFilterIndicator() {
  const parts = [];
  if (state.filters.category) parts.push(`Category: <strong>${state.filters.category}</strong>`);
  if (state.filters.subcategory) parts.push(`Format: <strong>${state.filters.subcategory}</strong>`);
  if (state.filters.sku) parts.push(`SKU: <strong>${state.filters.sku}</strong>`);
  if (state.filters.city) parts.push(`Hub: <strong>${state.filters.city}</strong>`);
  if (state.filters.search) parts.push(`Search: "<strong>${state.filters.search}</strong>"`);

  if (parts.length) {
    el.activeFilterIndicator.innerHTML = `Showing filtered listings for: ${parts.join(' • ')} (${state.products.length} found)`;
  } else {
    el.activeFilterIndicator.innerHTML = `Showing all verified manufacturer listings (${state.products.length} available)`;
  }
}

function renderProductGrid() {
  if (!state.products.length) {
    el.productGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border: 1px dashed var(--border-color); border-radius: 8px;">
        <span style="font-size: 32px;">📦</span>
        <h3 style="margin-top: 10px;">No exact manufacturer listings in this hub</h3>
        <p style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">
          Try changing the selected city or resetting filters to view listings from other logistics hubs.
        </p>
        <button class="btn-amber" style="margin-top: 16px;" onclick="document.getElementById('btn-reset-filters').click()">View All Hubs</button>
      </div>
    `;
    return;
  }

  el.productGrid.innerHTML = state.products.map(prod => `
    <div class="product-card">
      <div class="card-img-box">
        <img src="${prod.image}" alt="${prod.title}" class="card-img" loading="lazy">
        <span class="card-city-badge">📍 ${prod.city} Hub</span>
      </div>
      <div class="card-body">
        <div class="mfg-badge-row">
          <span class="mfg-name">${prod.manufacturerName}</span>
          <span class="seller-verified-tag">✓ Verified Producer</span>
        </div>
        <h3 class="product-title">${prod.title}</h3>
        <ul class="specs-list">
          <li>• <strong>SKU:</strong> ${prod.sku} (${prod.category})</li>
          ${prod.specifications ? Object.entries(prod.specifications).slice(0, 2).map(([k, v]) => `<li>• <strong>${k}:</strong> ${v}</li>`).join('') : ''}
          <li>• <strong>Ready Stock:</strong> ${prod.stockTons} ${prod.unit}s</li>
        </ul>
        <div class="price-moq-box">
          <div>
            <div class="price-val">₹ ${prod.pricePerTon.toLocaleString('en-IN')}</div>
            <div class="price-unit">per ${prod.unit} + GST</div>
          </div>
          <div class="moq-tag">MOQ: ${prod.moqTons} Tons</div>
        </div>
        <button class="btn-amber btn-block btn-add-product" data-id="${prod.id}">
          🛒 Add to Cart
        </button>
      </div>
    </div>
  `).join('');

  // Add to cart click listeners
  el.productGrid.querySelectorAll('.btn-add-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-id');
      const prod = state.products.find(p => p.id === prodId);
      if (!prod) return;

      // STRICT VERIFICATION CHECK
      if (!ensureVerifiedAuth('add products to cart')) return;

      addToCartAPI({
        id: prod.id,
        title: prod.title,
        type: 'product',
        city: prod.city,
        price: prod.pricePerTon,
        unit: prod.unit,
        quantity: prod.moqTons, // default to MOQ
        manufacturer: prod.manufacturerName
      });
    });
  });
}

// Post Product Button (Restricted to verified manufacturers)
el.postProductBtn.addEventListener('click', () => {
  if (!ensureVerifiedAuth('post manufacturer product listings')) return;

  if (state.currentUser.role !== 'manufacturer') {
    showToast('Only registered Manufacturers can publish product listings. (Your account is MSME Buyer)', 'error');
    return;
  }

  openModal(el.postProductModal);
});

// Form: Post Product Submission
el.formPostProduct.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!ensureVerifiedAuth('post manufacturer product listings')) return;

  const payload = {
    title: document.getElementById('post-title').value.trim(),
    category: document.getElementById('post-category').value,
    subcategory: document.getElementById('post-subcategory').value.trim(),
    sku: document.getElementById('post-sku').value.trim(),
    city: document.getElementById('post-city').value,
    pricePerTon: Number(document.getElementById('post-price').value),
    moqTons: Number(document.getElementById('post-moq').value),
    stockTons: Number(document.getElementById('post-stock').value),
    specifications: { "Standards": document.getElementById('post-specs').value.trim() }
  };

  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Product successfully published to the marketplace!', 'success');
      closeModal(el.postProductModal);
      el.formPostProduct.reset();
      fetchProducts();
    } else {
      showToast(data.message || 'Failed to post product', 'error');
    }
  } catch (err) {
    showToast('Network error while posting product', 'error');
  }
});

// ==================== WAREHOUSING INTERFACE ====================
function setupWarehousingTable() {
  el.warehousingTable.querySelectorAll('.btn-add-warehouse').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // STRICT VERIFICATION CHECK
      if (!ensureVerifiedAuth('book warehousing facilities')) return;

      const row = btn.closest('tr');
      const facility = row.getAttribute('data-facility');
      const city = row.querySelector('.cell-city').value;
      const pincode = row.querySelector('.cell-pincode').value;
      const provider = row.querySelector('.cell-provider').value;
      const date = row.querySelector('.cell-date').value;
      const feeText = row.querySelector('.cell-fee').innerText;

      // Extract number from feeText
      const feeNumber = parseInt(feeText.replace(/[^0-9]/g, '')) || 25000;

      addToCartAPI({
        id: `wh_${facility.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        title: `Warehousing: ${facility} (${provider})`,
        type: 'warehousing',
        city,
        pincode,
        provider,
        bookingDate: date,
        price: feeNumber,
        unit: 'Month',
        quantity: 1
      });
    });
  });

  el.btnViewCartTable.addEventListener('click', () => openCartDrawer());
}

// ==================== CREDIT CALCULATOR & APPLICATION ====================
function setupCreditSection() {
  function updateCalc() {
    const loan = Number(el.calcLoanAmt.value) || 0;
    const turnover = Number(el.calcTurnover.value) || 0;
    const monthlyRate = 0.0085; // 0.85% per month
    const interest = Math.round(loan * monthlyRate);

    el.calcInterestDisplay.innerText = `₹ ${interest.toLocaleString('en-IN')} (0.85% / mo)`;
  }

  el.calcLoanAmt.addEventListener('input', updateCalc);
  el.calcTurnover.addEventListener('input', updateCalc);

  el.btnCalculateCredit.addEventListener('click', () => {
    const loan = Number(el.calcLoanAmt.value) || 0;
    const turnover = Number(el.calcTurnover.value) || 0;
    const maxCredit = turnover * 0.15;

    if (loan <= maxCredit) {
      el.creditEligibilityResult.innerHTML = `
        <div style="background: #E6F4EA; border: 1px solid #A8DAB5; color: #137333; padding: 14px; border-radius: 6px;">
          <strong>✓ Pre-Approved Eligibility:</strong> Based on ₹${(turnover/100000).toFixed(1)}L annual turnover, your business is eligible for up to <strong>₹${(maxCredit/100000).toFixed(1)} Lakhs</strong> collateral-free credit for 30 days.
        </div>
      `;
    } else {
      el.creditEligibilityResult.innerHTML = `
        <div style="background: #FEF3C7; border: 1px solid #FDE68A; color: #92400E; padding: 14px; border-radius: 6px;">
          <strong>ℹ High Requirement Note:</strong> Maximum instant sanction is up to 15% of annual turnover (₹${(maxCredit/100000).toFixed(1)}L). Higher limits require balance sheet submission.
        </div>
      `;
    }
  });

  el.btnOpenCreditModal.addEventListener('click', () => {
    if (!ensureVerifiedAuth('apply for working capital credit')) return;
    openModal(el.creditAppModal);
  });

  el.formCreditApp.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!ensureVerifiedAuth('apply for working capital credit')) return;

    const payload = {
      loanAmount: Number(document.getElementById('app-amount').value),
      annualTurnover: Number(document.getElementById('app-turnover').value),
      sector: document.getElementById('app-sector').value,
      businessYears: Number(document.getElementById('app-years').value)
    };

    try {
      const res = await fetch(`${API_BASE}/credit/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.application.message, 'success');
        closeModal(el.creditAppModal);
        el.creditEligibilityResult.innerHTML = `
          <div style="background: #E6F4EA; border: 1px solid #A8DAB5; color: #137333; padding: 16px; border-radius: 6px; margin-top: 15px;">
            <h4>🎉 Credit Line Sanctioned!</h4>
            <p>Sanctioned Limit: <strong>₹ ${data.application.approvedLimit.toLocaleString('en-IN')}</strong> | Proprietary AI Risk Score: <strong>${data.application.riskScore}/900</strong></p>
            <p>You can now checkout raw material carts using the "Finance with 30-Day Credit Line" button.</p>
          </div>
        `;
      } else {
        showToast(data.message || 'Application review failed', 'error');
      }
    } catch (err) {
      showToast('Network error in credit submission', 'error');
    }
  });
}

// ==================== CART & CHECKOUT ====================
async function fetchCart() {
  if (!state.token) {
    state.cart = [];
    updateCartBadge();
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok) {
      const data = await res.json();
      state.cart = data.items || [];
      updateCartBadge();
      renderCartDrawer();
    }
  } catch (err) {
    console.error('Error fetching cart:', err);
  }
}

async function addToCartAPI(item) {
  try {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ item })
    });
    const data = await res.json();
    if (res.ok) {
      state.cart = data.items;
      updateCartBadge();
      showToast(`Added ${item.title} to cart!`, 'success');
      openCartDrawer();
    } else {
      showToast(data.message || 'Could not add to cart', 'error');
    }
  } catch (err) {
    showToast('Failed to add item to cart', 'error');
  }
}

async function removeFromCartAPI(itemId) {
  try {
    const res = await fetch(`${API_BASE}/cart/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (res.ok) {
      state.cart = data.items;
      updateCartBadge();
      renderCartDrawer();
      showToast('Item removed from cart', 'success');
    }
  } catch (err) {
    showToast('Failed to remove item', 'error');
  }
}

function updateCartBadge() {
  const count = state.cart.reduce((acc, i) => acc + (i.quantity || 1), 0);
  el.cartCount.innerText = count;
  document.querySelectorAll('.cart-btn-count').forEach(badge => badge.innerText = count);
}

function renderCartDrawer() {
  if (!state.cart.length) {
    el.cartItemsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <span style="font-size: 36px;">🛒</span>
        <p style="margin-top: 10px;">Your procurement cart is empty.</p>
      </div>
    `;
    el.cartSubtotal.innerText = '₹ 0';
    el.cartGst.innerText = '₹ 0';
    el.cartFreight.innerText = '₹ 0';
    el.cartTotal.innerText = '₹ 0';
    return;
  }

  el.cartItemsContainer.innerHTML = state.cart.map(item => `
    <div class="cart-item-card">
      <div class="cart-item-top">
        <span class="cart-item-title">${item.title}</span>
        <button class="cart-remove-btn" data-id="${item.id}">&times;</button>
      </div>
      <div class="cart-item-meta">
        <span>📍 Hub: ${item.city || 'Standard'}</span> • <span>Qty: ${item.quantity} ${item.unit}s</span>
      </div>
      <div class="cart-item-price">
        ₹ ${(item.price * item.quantity).toLocaleString('en-IN')}
      </div>
    </div>
  `).join('');

  el.cartItemsContainer.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCartAPI(btn.getAttribute('data-id'));
    });
  });

  const subtotal = state.cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const gst = Math.round(subtotal * 0.18);
  const freight = state.cart.some(i => i.type === 'product') ? 15000 : 0;
  const total = subtotal + gst + freight;

  el.cartSubtotal.innerText = `₹ ${subtotal.toLocaleString('en-IN')}`;
  el.cartGst.innerText = `₹ ${gst.toLocaleString('en-IN')}`;
  el.cartFreight.innerText = `₹ ${freight.toLocaleString('en-IN')}`;
  el.cartTotal.innerText = `₹ ${total.toLocaleString('en-IN')}`;
}

function openCartDrawer() {
  if (!ensureVerifiedAuth('view procurement cart')) return;
  renderCartDrawer();
  el.cartDrawerBackdrop.classList.add('active');
}

function closeCartDrawer() {
  el.cartDrawerBackdrop.classList.remove('active');
}

el.cartToggleBtn.addEventListener('click', openCartDrawer);
el.cartDrawerClose.addEventListener('click', closeCartDrawer);

// Checkout handlers
async function handleCheckout(paymentMethod) {
  if (!ensureVerifiedAuth('complete order checkout')) return;
  if (!state.cart.length) {
    showToast('Your cart is empty', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cart/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ paymentMethod })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Order Confirmed! ${data.order.paymentStatus === 'FINANCED_VIA_CREDIT_LINE' ? 'Financed via 30-Day Credit Line' : 'Payment Received'}`, 'success');
      state.cart = [];
      updateCartBadge();
      renderCartDrawer();
      closeCartDrawer();
    } else {
      showToast(data.message || 'Checkout failed', 'error');
    }
  } catch (err) {
    showToast('Error processing checkout', 'error');
  }
}

el.btnCheckoutDirect.addEventListener('click', () => handleCheckout('direct'));
el.btnCheckoutCredit.addEventListener('click', () => handleCheckout('30_day_credit'));

// ==================== AUTH MODAL HANDLERS ====================
function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
  modal.classList.remove('active');
}

el.authModalClose.addEventListener('click', () => closeModal(el.authModal));
el.postProductClose.addEventListener('click', () => closeModal(el.postProductModal));
el.creditAppClose.addEventListener('click', () => closeModal(el.creditAppModal));

el.tabBtnLogin.addEventListener('click', () => {
  el.tabBtnLogin.classList.add('active');
  el.tabBtnRegister.classList.remove('active');
  el.formLogin.classList.add('active');
  el.formRegister.classList.remove('active');
});

el.tabBtnRegister.addEventListener('click', () => {
  el.tabBtnRegister.classList.add('active');
  el.tabBtnLogin.classList.remove('active');
  el.formRegister.classList.add('active');
  el.formLogin.classList.remove('active');
});

// Demo Login fill links
document.querySelectorAll('.demo-fill').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-email').value = link.getAttribute('data-email');
    document.getElementById('login-password').value = link.getAttribute('data-pass');
    el.formLogin.requestSubmit();
  });
});

// Login Form Submit
el.formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      state.token = data.token;
      state.currentUser = data.user;
      localStorage.setItem('unnati_token', data.token);
      renderAuthUI();
      closeModal(el.authModal);
      fetchCart();
      showToast(`Welcome back, ${data.user.name} (${data.user.companyName})!`, 'success');
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch (err) {
    showToast('Network error during login', 'error');
  }
});

// Register Form Submit
el.formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  const role = document.querySelector('input[name="reg-role"]:checked').value;
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const companyName = document.getElementById('reg-company').value.trim();
  const gstNumber = document.getElementById('reg-gst').value.trim();
  const city = document.getElementById('reg-city').value;
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, companyName, gstNumber, city, password, role })
    });
    const data = await res.json();
    if (res.ok) {
      state.token = data.token;
      state.currentUser = data.user;
      localStorage.setItem('unnati_token', data.token);
      renderAuthUI();
      closeModal(el.authModal);
      fetchCart();
      showToast('Registration successful! Your account is verified with GST.', 'success');
    } else {
      showToast(data.message || 'Registration failed', 'error');
    }
  } catch (err) {
    showToast('Network error during registration', 'error');
  }
});

// Newsletter
el.btnSubscribeNewsletter.addEventListener('click', () => {
  const email = el.newsletterEmail.value.trim();
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address', 'warning');
    return;
  }
  showToast('Subscribed to daily raw material market intelligence!', 'success');
  el.newsletterEmail.value = '';
});

// Scheme inquiry clicks
document.querySelectorAll('.scheme-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const scheme = link.getAttribute('data-scheme');
    showToast(`Advisory request submitted for ${scheme}. Our consultant will contact your registered company.`, 'success');
  });
});

document.getElementById('btn-ask-query').addEventListener('click', () => {
  showToast('Consultant advisory slot booked. UNNATI specialists will reach out within 2 hours.', 'success');
});

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupWarehousingTable();
  setupCreditSection();
  fetchCurrentUser();
  fetchMetadata();
});
