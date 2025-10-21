// === Lấy phần tử ===
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.querySelector(".sidebar");
const mainElement = document.querySelector("main");

// === Toggle menu (mở / đóng) ===
menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.toggle("hidden");
  
  // Thêm/xóa class cho body để CSS hoạt động
  if (sidebar.classList.contains("hidden")) {
    document.body.classList.add("menu-closed");
    document.body.classList.remove("menu-open");
  } else {
    document.body.classList.add("menu-open");
    document.body.classList.remove("menu-closed");
  }
});

// === Khi click vào danh mục trong sidebar -> tự đóng menu ===
sidebar.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    sidebar.classList.add("hidden");
    document.body.classList.add("menu-closed");
    document.body.classList.remove("menu-open");
  });
});

// === Hiển thị chi tiết sản phẩm (popup) ===
function openProductPopup(product) {
  let popup = document.querySelector(".product-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.className = "product-popup";
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div class="popup-content">
      <img src="${product.image}" alt="${product.name}">
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <span class="price">${product.price}</span>
      <button class="close-btn">Đóng</button>
    </div>
  `;

  popup.style.display = "flex";
  popup.style.zIndex = 1000; // popup nằm trên cùng nhưng không che icon menu

  const closeBtn = popup.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });
}


// script.js — unified for index + giohang
(function () {
  'use strict';

  // --- Helpers ---
  function parsePrice(text) {
    if (!text) return 0;
    const digits = String(text).replace(/[^\d]/g, '');
    return parseInt(digits, 10) || 0;
  }

  function formatVND(n) {
    return n.toLocaleString('vi-VN') + '₫';
  }

  // --- CART storage: array of { title, price, imgSrc, quantity } ---
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!Array.isArray(cart)) cart = [];
  } catch (e) {
    cart = [];
  }

  function saveCart() {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) { /* ignore */ }
    updateCartBadge();
  }

  function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const totalQty = cart.reduce((s, it) => s + (it.quantity || 0), 0);
    badge.textContent = totalQty;
    badge.style.visibility = totalQty > 0 ? 'visible' : 'hidden';
  }

  function addToCart(title, price, imgSrc) {
  // 🔥 Nếu localStorage không có giỏ hàng, reset luôn biến cart
  if (!localStorage.getItem("cart")) {
    cart = [];
  }

  const existing = cart.find(i => i.title === title);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ title, price, imgSrc, quantity: 1 });
  }

  saveCart();
  showSuccessPopup(`Đã thêm "${title}" vào giỏ hàng!`);
}


  // --- Render cart on cart page ---
  function loadCartPage() {
    const list = document.getElementById('cart'); // element id in giohang.html
    const totalEl = document.getElementById('total');
    if (!list) return; // not on cart page
    list.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
      list.innerHTML = '<li>🛒 Giỏ hàng trống</li>';
      if (totalEl) totalEl.textContent = '0₫';
      return;
    }
    cart.forEach((item, idx) => {
      const itemTotal = (Number(item.price) || 0) * (item.quantity || 0);
      total += itemTotal;
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div style="display:flex;gap:10px;align-items:center;">
          <img src="${item.imgSrc || ''}" width="60" style="border-radius:8px;">
          <div style="flex:1">
            <strong>${item.title}</strong><br>
            ${formatVND(item.price)} × 
            <button class="qty-btn" data-idx="${idx}" data-delta="-1">-</button>
            <span style="margin:0 8px">${item.quantity}</span>
            <button class="qty-btn" data-idx="${idx}" data-delta="1">+</button><br>
            <strong>Tổng: ${formatVND(itemTotal)}</strong>
          </div>
          <button class="remove-btn" data-idx="${idx}" title="Xóa">🗑️</button>
        </div>
        <hr>
      `;
      list.appendChild(li);
    });
    if (totalEl) totalEl.textContent = formatVND(total);
  }

  // --- Change quantity / remove handlers on cart page (delegation) ---
  function cartPageClickHandler(e) {
    const btn = e.target.closest('.qty-btn, .remove-btn');
    if (!btn) return;
    if (btn.classList.contains('qty-btn')) {
      const idx = Number(btn.dataset.idx);
      const delta = Number(btn.dataset.delta);
      if (!Number.isInteger(idx)) return;
      cart[idx].quantity = (cart[idx].quantity || 0) + delta;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
      saveCart();
      loadCartPage();
    } else if (btn.classList.contains('remove-btn')) {
      const idx = Number(btn.dataset.idx);
      if (!Number.isInteger(idx)) return;
      cart.splice(idx, 1);
      saveCart();
      loadCartPage();
    }
  }

  // --- Checkout (simple) ---
function checkout() {
  if (cart.length === 0) {
    showSuccessPopup("🛒 Giỏ hàng trống!");
    return;
  }
  showSuccessPopup("🎉 Thanh toán thành công! Cảm ơn bạn đã mua hàng 💖");
  launchFireworks();
  setTimeout(() => {
    cart = [];
    localStorage.removeItem("cart");
    updateCartBadge();
    window.location.reload();
  }, 1500);
}



  // --- Popup product (used on index and any product card) ---
  function openProductPopup(imgSrc, title, price, desc) {
    // remove old
    document.querySelector('.product-popup')?.remove();

    const popup = document.createElement('div');
    popup.className = 'product-popup';
    popup.style.position = 'fixed';
    popup.style.inset = 0;
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';
    popup.style.background = 'rgba(0,0,0,0.5)';
    popup.style.zIndex = 9999;

    popup.innerHTML = `
      <div class="popup-box" style="background:#fff;padding:18px;border-radius:8px;max-width:520px;width:90%;position:relative;">
        <button class="close-popup" style="position:absolute;right:10px;top:8px;border:none;background:transparent;font-size:20px;cursor:pointer;">&times;</button>
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <img src="${imgSrc || ''}" alt="${title}" style="width:140px;height:auto;border-radius:6px;object-fit:cover;">
          <div style="flex:1">
            <h2 style="margin:0 0 6px">${title}</h2>
            <p style="margin:0 0 6px;color:#333">${desc || ''}</p>
            <p style="margin:0 0 12px;font-weight:700">${formatVND(price)}</p>
            <div style="display:flex;gap:8px">
              <button class="popup-add-btn">🛒 Thêm vào giỏ</button>
              <button class="buy-btn">Mua ngay</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    popup.querySelector('.close-popup').addEventListener('click', () => popup.remove());
    popup.addEventListener('click', (ev) => { if (ev.target === popup) popup.remove(); });

    popup.querySelector('.popup-add-btn').addEventListener('click', () => {
      addToCart(title, price, imgSrc);
      popup.remove();
    });

    // buy-btn can navigate to checkout page if desired
    popup.querySelector('.buy-btn').addEventListener('click', () => {
      addToCart(title, price, imgSrc);
      // if you have a checkout page, redirect: location.href = 'giohang.html';
      popup.remove();
      window.location.href = 'giohang.html'; // optional: go to cart page
    });
  }

  // --- Product-list click delegation (add to cart or open popup) ---
  function productListHandler(e) {
    // handle "Thêm vào giỏ" buttons inside product cards
    const addBtn = e.target.closest('.add-to-cart-btn, .add-cart-btn');
    if (addBtn) {
      const card = addBtn.closest('.product, .product-card');
      if (!card) return;
      const title = (card.querySelector('h3') || card.querySelector('h2'))?.innerText?.trim() || '';
      // try price from .price or .price-text or <p>
      const priceText = (card.querySelector('.price') || card.querySelector('.price-text') || card.querySelector('p'))?.innerText || '';
      const price = parsePrice(priceText);
      const imgSrc = card.querySelector('img')?.src || '';
      addToCart(title, price, imgSrc);
      return;
    }

    // clicking on product card opens popup (unless clicked a button)
    const prod = e.target.closest('.product-card, .product');
    if (prod && !e.target.closest('button')) {
      const img = prod.querySelector('img')?.src || '';
      const title = (prod.querySelector('h3') || prod.querySelector('h2'))?.innerText?.trim() || '';
      const priceText = (prod.querySelector('.price') || prod.querySelector('.price-text') || prod.querySelector('p'))?.innerText || '';
      const price = parsePrice(priceText);
      const desc = prod.getAttribute('data-desc') || '';
      openProductPopup(img, title, price, desc);
    }
  }

  // --- Cart popup (small list) when clicking cart icon ---
  function showCartPopupSmall() {
    // build small popup modal content (or reuse a simple alert)
    if (cart.length === 0) {
      alert('🛒 Giỏ hàng trống!');
      return;
    }
    let text = '🛒 Giỏ hàng:\n';
    let grand = 0;
    cart.forEach((it, i) => {
      const line = `${i + 1}. ${it.title} x${it.quantity} - ${formatVND((it.price || 0) * it.quantity)}\n`;
      text += line;
      grand += (it.price || 0) * it.quantity;
    });
    text += `\nTổng: ${formatVND(grand)}`;
    alert(text);
  }

  // --- Hiển thị popup thêm vào giỏ hàng (hiệu ứng tích xanh + pháo hoa)
function showSuccessPopup(message = "Đã thêm vào giỏ hàng!") {
  // Xóa popup cũ nếu có
  document.querySelector(".success-popup")?.remove();

  const popup = document.createElement("div");
  popup.className = "success-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <div class="checkmark">
        <div class="checkmark-circle"></div>
        <div class="checkmark-stem"></div>
        <div class="checkmark-kick"></div>
      </div>
      <p>${message}</p>
    </div>
  `;
  document.body.appendChild(popup);

  // Hiện popup + tự ẩn sau 2.5s
  setTimeout(() => popup.classList.add("show"));
  setTimeout(() => popup.classList.remove("show"), 1000);
  setTimeout(() => popup.remove(), 1000);
}

  // --- Init on DOMContentLoaded ---
  document.addEventListener('DOMContentLoaded', () => {
    // 1) update badge
    updateCartBadge();

    // 2) attach product list handler (delegation)
    document.body.addEventListener('click', productListHandler, true);

// 3) Khi bấm vào nút giỏ hàng -> luôn mở trang giohang.html
const viewCartBtn = document.getElementById('view-cart-btn');
if (viewCartBtn) {
  viewCartBtn.addEventListener('click', (ev) => {
    ev.preventDefault(); // chặn hành vi mặc định (nếu có)
    window.location.href = "giohang.html"; // chuyển sang trang giỏ hàng
  });
}

    // 4) If on cart page: load cart & attach handlers
    loadCartPage();
    const cartListEl = document.getElementById('cart');
    if (cartListEl) {
      cartListEl.addEventListener('click', cartPageClickHandler);
    }

    // 5) If there is a checkout button bound inline, ensure it calls checkout()
    window.checkout = checkout;
    // 6) Expose addToCart and openProductPopup for inline onclick usage (if you use onclick in HTML)
    window.addToCart = addToCart;
    window.openProductPopup = openProductPopup;
  });

})(); // end wrapper
