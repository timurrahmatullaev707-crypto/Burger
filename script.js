const MENU = [
  {id:"classic",name:"Classic Burger",description:"Mol go‘shti, cheddar, maxsus sous",price:38000,category:"Burgerlar",image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=720&q=82"},
  {id:"cheese",name:"Cheese Burger",description:"Ikki qavat cheddar va mol go‘shti",price:46000,category:"Burgerlar",image:"https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=720&q=82"},
  {id:"double",name:"Double Smash",description:"Ikki dona smash kotlet, piyoz",price:55000,category:"Burgerlar",image:"https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=720&q=82"},
  {id:"chicken",name:"Chicken Crispy",description:"Qarsildoq tovuq, salat, ranch sous",price:42000,category:"Burgerlar",image:"https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=720&q=82"},
  {id:"fries",name:"Kartoshka fri",description:"Oltinrang, qarsildoq kartoshka",price:18000,category:"Gazaklar",image:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=720&q=82"},
  {id:"nuggets",name:"Chicken Nuggets",description:"6 dona tovuqli naggets va sous",price:26000,category:"Gazaklar",image:"https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=720&q=82"},
  {id:"wings",name:"Achchiq qanotlar",description:"6 dona buffalo sousli qanotlar",price:32000,category:"Gazaklar",image:"https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=720&q=82"},
  {id:"cola",name:"Coca-Cola",description:"Muzdek, 0.5 litr",price:12000,category:"Ichimliklar",image:"https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=720&q=82"},
  {id:"fanta",name:"Fanta",description:"Apelsin ta’mi, 0.5 litr",price:12000,category:"Ichimliklar",image:"https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=720&q=82"},
  {id:"tea",name:"Muzli choy",description:"Limonli, 0.5 litr",price:14000,category:"Ichimliklar",image:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=720&q=82"},
  {id:"sauce",name:"Maxsus sous",description:"Uy retsepti bo‘yicha tayyorlangan",price:5000,category:"Qo‘shimcha",image:"https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=720&q=82"},
  {id:"cheese-sauce",name:"Pishloqli sous",description:"Yumshoq va qaymoqli ta’m",price:7000,category:"Qo‘shimcha",image:"https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?auto=format&fit=crop&w=720&q=82"}
];
const STORAGE_KEYS = {customers:"bunco_customers",orders:"bunco_orders",admins:"bunco_admins",session:"bunco_admin_session"};
const readStorage = key => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error(`Saqlangan ma'lumotni o'qib bo'lmadi (${key}).`, error);
    return [];
  }
};
let customers = readStorage(STORAGE_KEYS.customers);
let orders = readStorage(STORAGE_KEYS.orders);
let cart = {};
let activeCategory = "Barchasi";
let toastTimer;
let admins = readStorage(STORAGE_KEYS.admins);
const categories = ["Barchasi","Burgerlar","Gazaklar","Ichimliklar","Qo‘shimcha"];
const money = amount => `${Number(amount).toLocaleString("uz-UZ")} so‘m`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const getCustomerName = id => customers.find(customer => customer.id === id)?.name || "Noma’lum mijoz";

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  } catch (error) {
    console.error("Ma'lumotlarni saqlab bo'lmadi.", error);
    showToast("Ma’lumotlarni saqlab bo‘lmadi. Brauzer xotirasini tekshiring.");
    return false;
  }
  return true;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function setAuthFeedback(message, type = "error") {
  const feedback = document.getElementById("authFeedback");
  feedback.textContent = message;
  feedback.className = message ? `auth-feedback ${type}` : "auth-feedback";
}

function setAuthMode(mode) {
  const isLogin = mode === "login";
  document.querySelectorAll("[data-toggle-password]").forEach(button => {
    document.getElementById(button.dataset.togglePassword).type = "password";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Parolni ko‘rsatish");
    button.title = "Parolni ko‘rsatish";
  });
  document.getElementById("loginForm").hidden = !isLogin;
  document.getElementById("registerForm").hidden = isLogin;
  document.getElementById("authTitle").textContent = isLogin ? "Xush kelibsiz" : "Akkaunt yarating";
  document.getElementById("authDescription").textContent = isLogin
    ? "Admin akkauntingizga kiring va ishni davom ettiring."
    : "BUN & CO boshqaruv panelini boshlash uchun ma’lumotlaringizni kiriting.";
  document.getElementById("authSwitch").innerHTML = isLogin
    ? 'Akkauntingiz yo‘qmi? <button type="button" data-auth-mode="register">Ro‘yxatdan o‘tish</button>'
    : 'Akkauntingiz bormi? <button type="button" data-auth-mode="login">Kirish</button>';
  setAuthFeedback("");
}

function showDashboard(admin) {
  document.body.classList.add("authenticated");
  document.getElementById("staffName").textContent = admin.name;
  document.getElementById("staffAvatar").textContent = admin.name.trim().charAt(0).toUpperCase();
}

function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  if (!window.crypto?.subtle) {
    throw new Error("Parolni xavfsiz saqlash uchun saytni HTTPS yoki localhost orqali oching.");
  }
  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await window.crypto.subtle.deriveBits(
    {name:"PBKDF2",salt:encoder.encode(salt),iterations:120000,hash:"SHA-256"},
    key,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

function saveAdmins() {
  try {
    localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(admins));
    return true;
  } catch (error) {
    console.error("Admin akkauntini saqlab bo‘lmadi.", error);
    setAuthFeedback("Akkauntni saqlab bo‘lmadi. Brauzer xotirasi sozlamalarini tekshiring.");
    return false;
  }
}

function saveAuthSession(admin) {
  try {
    localStorage.setItem(STORAGE_KEYS.session, admin.email);
    showDashboard(admin);
    return true;
  } catch (error) {
    console.error("Tizim seansini saqlab bo‘lmadi.", error);
    setAuthFeedback("Tizimga kirish seansini saqlab bo‘lmadi. Brauzer xotirasini tekshiring.");
    return false;
  }
}

function renderCategories() {
  document.getElementById("categoryTabs").innerHTML = categories.map(category =>
    `<button class="category-tab ${activeCategory === category ? "active" : ""}" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`
  ).join("");
}

function renderMenu() {
  const items = activeCategory === "Barchasi" ? MENU : MENU.filter(item => item.category === activeCategory);
  document.getElementById("menuGrid").innerHTML = items.map(item => `
    <article class="menu-item">
      <div class="food-art"><img src="${item.image}" alt="${escapeHTML(item.name)}" loading="lazy"></div>
      <div class="food-details"><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.description)}</p>
        <div class="food-bottom"><span class="food-price">${money(item.price)}</span><button class="add-button" data-add="${item.id}" aria-label="${escapeHTML(item.name)} qo‘shish">+</button></div>
      </div>
    </article>`).join("");
}

function renderCustomers() {
  const select = document.getElementById("customerSelect");
  const current = select.value;
  select.innerHTML = `<option value="">Mijozni tanlang...</option>` + customers.map(customer =>
    `<option value="${escapeHTML(customer.id)}">${escapeHTML(customer.id)} · ${escapeHTML(customer.name)}</option>`
  ).join("");
  if (customers.some(customer => customer.id === current)) select.value = current;
  document.getElementById("customerNavCount").textContent = customers.length;
  document.getElementById("totalCustomers").textContent = customers.length;
  renderSelectedCustomer();
  renderCustomerTable();
}

function renderSelectedCustomer() {
  const customer = customers.find(item => item.id === document.getElementById("customerSelect").value);
  document.getElementById("selectedCustomer").textContent = customer ? `${customer.name} · ${customer.phone}` : "";
  updateCheckout();
}

function renderCustomerTable() {
  const query = (document.getElementById("customerSearch")?.value || "").trim().toLowerCase();
  const filtered = customers.filter(customer => `${customer.id} ${customer.name} ${customer.phone}`.toLowerCase().includes(query));
  document.getElementById("customerTableCount").textContent = `${filtered.length} ta mijoz`;
  document.getElementById("customersTable").innerHTML = filtered.length ? filtered.map(customer => {
    const count = orders.filter(order => order.customerId === customer.id).length;
    return `<tr><td><span class="customer-id">${escapeHTML(customer.id)}</span></td><td><span class="customer-name-cell"><span class="customer-avatar">${escapeHTML(customer.name.charAt(0).toUpperCase())}</span>${escapeHTML(customer.name)}</span></td><td>${escapeHTML(customer.phone)}</td><td>${count} ta</td><td>${escapeHTML(customer.createdAt)}</td></tr>`;
  }).join("") : `<tr><td class="empty-table" colspan="5">${query ? "Qidiruv bo‘yicha mijoz topilmadi." : "Hali mijozlar qo‘shilmagan. «Mijoz qo‘shish» tugmasini bosing."}</td></tr>`;
}

function renderCart() {
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const subtotal = entries.reduce((sum, [id, quantity]) => sum + MENU.find(item => item.id === id).price * quantity, 0);
  document.getElementById("cartItemCount").textContent = count ? `${count} ta mahsulot` : "Hozircha bo‘sh";
  document.getElementById("cartItems").innerHTML = entries.length ? entries.map(([id, quantity]) => {
    const item = MENU.find(product => product.id === id);
    return `<div class="cart-row"><div><div class="cart-product-name">${escapeHTML(item.name)}</div><div class="cart-product-price">${money(item.price * quantity)}</div></div><div class="quantity-control"><button data-quantity="${id}" data-change="-1" aria-label="Kamaytirish">−</button><span>${quantity}</span><button data-quantity="${id}" data-change="1" aria-label="Ko‘paytirish">+</button></div></div>`;
  }).join("") : `<div class="cart-empty"><strong>Savatingiz hozircha bo‘sh</strong><small>Menyudan mazali narsalar qo‘shing</small></div>`;
  document.getElementById("subtotal").textContent = money(subtotal);
  document.getElementById("total").innerHTML = `${subtotal.toLocaleString("uz-UZ")} <small>so‘m</small>`;
  updateCheckout();
}

function updateCheckout() {
  const hasCustomer = Boolean(document.getElementById("customerSelect").value);
  const hasItems = Object.values(cart).some(quantity => quantity > 0);
  document.getElementById("placeOrder").disabled = !(hasCustomer && hasItems);
}

function renderOrders() {
  const today = new Date().toLocaleDateString("uz-UZ");
  const todaysOrders = orders.filter(order => order.date === today);
  const revenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
  document.getElementById("todayOrders").textContent = todaysOrders.length;
  document.getElementById("todayRevenue").innerHTML = `${revenue.toLocaleString("uz-UZ")} <i>so‘m</i>`;
  document.getElementById("orderTableCount").textContent = `${orders.length} ta buyurtma`;
  document.getElementById("ordersTable").innerHTML = orders.length ? [...orders].reverse().map(order => {
    const summary = order.items.map(item => `${escapeHTML(item.name)} × ${item.quantity}`).join(", ");
    return `<tr><td><span class="order-id">${escapeHTML(order.id)}</span></td><td>${escapeHTML(getCustomerName(order.customerId))}<br><small>${escapeHTML(order.customerId)}</small></td><td>${summary}</td><td><strong>${money(order.total)}</strong></td><td>${escapeHTML(order.date)} · ${escapeHTML(order.time)}</td><td><span class="status-pill">Qabul qilindi</span></td></tr>`;
  }).join("") : `<tr><td class="empty-table" colspan="6">Hali buyurtmalar yo‘q. Birinchi buyurtmani qabul qiling!</td></tr>`;
  renderCustomerTable();
}

function openCustomerModal() {
  document.getElementById("customerModal").classList.add("open");
  document.getElementById("customerModal").setAttribute("aria-hidden","false");
  document.getElementById("customerName").focus();
}

function closeCustomerModal() {
  document.getElementById("customerModal").classList.remove("open");
  document.getElementById("customerModal").setAttribute("aria-hidden","true");
}

function createCustomerId() {
  let next = customers.reduce((maximum, customer) => {
    const match = customer.id.match(/^M-(\d+)$/);
    return match ? Math.max(maximum, Number(match[1])) : maximum;
  }, 0) + 1;
  let id = `M-${String(next).padStart(4,"0")}`;
  while (customers.some(customer => customer.id === id)) {
    next += 1;
    id = `M-${String(next).padStart(4,"0")}`;
  }
  return id;
}

document.getElementById("categoryTabs").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderMenu();
});
document.getElementById("menuGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  cart[button.dataset.add] = (cart[button.dataset.add] || 0) + 1;
  renderCart();
});
document.getElementById("cartItems").addEventListener("click", event => {
  const button = event.target.closest("[data-quantity]");
  if (!button) return;
  const id = button.dataset.quantity;
  cart[id] = Math.max(0, (cart[id] || 0) + Number(button.dataset.change));
  if (!cart[id]) delete cart[id];
  renderCart();
});
document.getElementById("customerSelect").addEventListener("change", renderSelectedCustomer);
document.getElementById("customerSearch").addEventListener("input", renderCustomerTable);
document.getElementById("openCustomerModal").addEventListener("click", openCustomerModal);
document.getElementById("openCustomerModal2").addEventListener("click", openCustomerModal);
document.getElementById("closeCustomerModal").addEventListener("click", closeCustomerModal);
document.getElementById("customerModal").addEventListener("click", event => {
  if (event.target.id === "customerModal") closeCustomerModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCustomerModal();
});
document.getElementById("customerForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name")).trim();
  const phone = String(form.get("phone")).trim();
  if (!name || !phone) return;
  const customer = {id:createCustomerId(),name,phone,createdAt:new Date().toLocaleDateString("uz-UZ")};
  customers.push(customer);
  if (!saveData()) {
    customers.pop();
    return;
  }
  renderCustomers();
  document.getElementById("customerSelect").value = customer.id;
  renderSelectedCustomer();
  event.currentTarget.reset();
  closeCustomerModal();
  showToast(`${customer.name} mijoz sifatida qo‘shildi · ${customer.id}`);
});
document.getElementById("authSwitch").addEventListener("click", event => {
  const button = event.target.closest("[data-auth-mode]");
  if (button) setAuthMode(button.dataset.authMode);
});
document.getElementById("authScreen").addEventListener("click", event => {
  const button = event.target.closest("[data-toggle-password]");
  if (!button) return;
  const input = document.getElementById(button.dataset.togglePassword);
  const isVisible = input.type === "text";
  input.type = isVisible ? "password" : "text";
  button.setAttribute("aria-pressed", String(!isVisible));
  button.setAttribute("aria-label", isVisible ? "Parolni ko‘rsatish" : "Parolni yashirish");
  button.title = isVisible ? "Parolni ko‘rsatish" : "Parolni yashirish";
});
document.getElementById("registerForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name")).trim();
  const email = String(form.get("email")).trim().toLowerCase();
  const password = String(form.get("password"));
  const confirm = String(form.get("confirm"));
  if (password.length < 8) {
    setAuthFeedback("Parol kamida 8 ta belgidan iborat bo‘lishi kerak.");
    return;
  }
  if (password !== confirm) {
    setAuthFeedback("Parollar bir-biriga mos kelmadi.");
    return;
  }
  if (admins.some(admin => admin.email === email)) {
    setAuthFeedback("Bu email bilan akkaunt mavjud. Tizimga kiring.");
    return;
  }
  const button = event.currentTarget.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const salt = bytesToHex(window.crypto.getRandomValues(new Uint8Array(16)));
    const passwordHash = await hashPassword(password, salt);
    const admin = {name,email,salt,passwordHash};
    admins.push(admin);
    if (!saveAdmins()) {
      admins.pop();
      return;
    }
    if (!saveAuthSession(admin)) {
      admins.pop();
      saveAdmins();
      return;
    }
    showToast(`Xush kelibsiz, ${admin.name}!`);
  } catch (error) {
    console.error("Admin akkauntini yaratib bo‘lmadi.", error);
    setAuthFeedback(error.message || "Akkaunt yaratishda xatolik yuz berdi.");
  } finally {
    button.disabled = false;
  }
});
document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get("email")).trim().toLowerCase();
  const password = String(form.get("password"));
  const admin = admins.find(account => account.email === email);
  if (!admin) {
    setAuthFeedback("Bu email bilan akkaunt topilmadi. Avval ro‘yxatdan o‘ting.");
    return;
  }
  const button = event.currentTarget.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const passwordHash = await hashPassword(password, admin.salt);
    if (passwordHash !== admin.passwordHash) {
      setAuthFeedback("Email yoki parol noto‘g‘ri.");
      return;
    }
    if (saveAuthSession(admin)) showToast(`Xush kelibsiz, ${admin.name}!`);
  } catch (error) {
    console.error("Tizimga kirib bo‘lmadi.", error);
    setAuthFeedback(error.message || "Tizimga kirishda xatolik yuz berdi.");
  } finally {
    button.disabled = false;
  }
});
document.getElementById("signOut").addEventListener("click", () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.session);
    document.body.classList.remove("authenticated");
    setAuthMode("login");
    showToast("Tizimdan chiqdingiz.");
  } catch (error) {
    console.error("Tizimdan chiqib bo‘lmadi.", error);
    showToast("Tizimdan chiqib bo‘lmadi. Qayta urinib ko‘ring.");
  }
});
document.getElementById("placeOrder").addEventListener("click", () => {
  const customerId = document.getElementById("customerSelect").value;
  const items = Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([id, quantity]) => {
    const item = MENU.find(product => product.id === id);
    return {id:item.id,name:item.name,price:item.price,quantity};
  });
  if (!customers.some(customer => customer.id === customerId) || !items.length) return;
  const now = new Date();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id:`B-${String(orders.reduce((maximum, existing) => Math.max(maximum, Number(existing.id.replace(/\D/g,"")) || 0), 0) + 1).padStart(4,"0")}`,
    customerId,items,total,date:now.toLocaleDateString("uz-UZ"),time:now.toLocaleTimeString("uz-UZ",{hour:"2-digit",minute:"2-digit"})
  };
  orders.push(order);
  if (!saveData()) {
    orders.pop();
    return;
  }
  cart = {};
  renderCart();
  renderOrders();
  showToast(`Buyurtma qabul qilindi · ${order.id}`);
});
document.querySelector(".side-nav").addEventListener("click", event => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  const views = {orders:"Buyurtma olish",customers:"Mijozlar",history:"Buyurtmalar tarixi"};
  document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link === button));
  document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
  document.getElementById(`${button.dataset.view}View`).classList.add("active");
  document.getElementById("breadcrumbCurrent").textContent = views[button.dataset.view];
});
document.getElementById("todayDate").textContent = new Date().toLocaleDateString("uz-UZ",{weekday:"short",day:"numeric",month:"long",year:"numeric"});
setAuthMode(admins.length ? "login" : "register");
try {
  const sessionEmail = localStorage.getItem(STORAGE_KEYS.session);
  const activeAdmin = admins.find(admin => admin.email === sessionEmail);
  if (activeAdmin) showDashboard(activeAdmin);
  else if (sessionEmail) localStorage.removeItem(STORAGE_KEYS.session);
} catch (error) {
  console.error("Tizim seansini o‘qib bo‘lmadi.", error);
  setAuthFeedback("Saqlangan seansni o‘qib bo‘lmadi. Brauzer xotirasini tekshiring.");
}
renderCategories();
renderMenu();
renderCustomers();
renderCart();
renderOrders();
