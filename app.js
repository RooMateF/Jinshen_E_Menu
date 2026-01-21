// ==================== 配置加載 ====================

let CONFIG = {
    app: {
        name: "謹聖廚房",
        tagline: "招牌湯麵",
        adminPassword: "000000"
    },
    menu: {
        noodles: [
            { id: "noodle_1", name: "手打" },
            { id: "noodle_2", name: "細麵" },
            { id: "noodle_3", name: "冬粉" }
        ],
        flavors: [
            { id: "flavor_1", name: "原味" },
            { id: "flavor_2", name: "蝦醬" },
            { id: "flavor_3", name: "藥膳" }
        ],
        sides: [
            { id: "side_1", name: "炸物拼盤", price: 30 },
            { id: "side_2", name: "炸響鈴", price: 20 },
            { id: "side_3", name: "燫青菜", price: 25 }
        ]
    },
    storage: {
        ordersKey: "noodle_orders",
        soldOutKey: "noodle_soldout"
    }
};

// 嘗試從外部 config.json 加載
fetch('config.json')
    .then(r => r.json())
    .then(data => {
        CONFIG = data;
        init();
    })
    .catch(() => {
        // 使用默認配置
        init();
    });

// ==================== 全局狀態 ====================

let appState = {
    currentOrderType: null,
    cart: [],
    selectedNoodle: null,
    selectedFlavor: null,
    orders: [],
    soldOut: new Set(),
    isKitchenMode: false,
    adminClicks: 0
};

// ==================== 初始化 ====================

function init() {
    loadOrders();
    loadSoldOut();
    renderMenu();
    setupEventListeners();
    setupKitchenAccess();
}

// ==================== 事件監聽 ====================

function setupEventListeners() {
    // 訂單類型選擇
    document.querySelectorAll('.order-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            if (type === 'reservation') {
                openReservationModal();
            } else {
                selectOrderType(type);
            }
        });
    });

    // 湯麵和小菜按鈕
    document.querySelectorAll('.menu-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            if (section === 'noodles') {
                openNoodleModal();
            } else if (section === 'sides') {
                openSidesModal();
            }
        });
    });

    // 返回按鈕
    document.getElementById('back-to-types-btn').addEventListener('click', backToTypes);

    // 確認送單
    document.getElementById('submit-order-btn').addEventListener('click', submitOrder);

    // 廚師登出
    document.getElementById('kitchen-logout-btn').addEventListener('click', kitchenLogout);

    // 廚師密碼確認
    document.getElementById('auth-submit-btn').addEventListener('click', verifyPassword);
    document.getElementById('auth-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyPassword();
    });

    // 30秒自動更新廚師面板
    if (localStorage.getItem('isKitchen')) {
        setInterval(refreshKitchenPanel, 30000);
    }
}

// ==================== 廚師訪問 ====================

function setupKitchenAccess() {
    // 點擊應用標題區域來啟用廚師模式
    document.querySelector('.header').addEventListener('click', () => {
        appState.adminClicks++;
        if (appState.adminClicks >= 8) {
            appState.adminClicks = 0;
            openAuthModal();
        }
        // 5秒後重置計數
        setTimeout(() => {
            appState.adminClicks = 0;
        }, 5000);
    });

    // 檢查是否已登入廚師模式
    if (localStorage.getItem('isKitchen')) {
        enterKitchenMode();
    }
}

function openAuthModal() {
    document.getElementById('auth-modal').style.display = 'flex';
    document.getElementById('auth-password').focus();
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('auth-password').value = '';
}

function verifyPassword() {
    const password = document.getElementById('auth-password').value;
    if (password === CONFIG.app.adminPassword) {
        localStorage.setItem('isKitchen', 'true');
        closeAuthModal();
        enterKitchenMode();
    } else {
        alert('密碼錯誤');
        document.getElementById('auth-password').value = '';
    }
}

function enterKitchenMode() {
    appState.isKitchenMode = true;
    document.getElementById('customer-panel').style.display = 'none';
    document.getElementById('kitchen-panel').style.display = 'flex';
    refreshKitchenPanel();
}

function kitchenLogout() {
    localStorage.removeItem('isKitchen');
    appState.isKitchenMode = false;
    appState.adminClicks = 0;
    document.getElementById('kitchen-panel').style.display = 'none';
    document.getElementById('customer-panel').style.display = 'flex';
    document.getElementById('order-types-section').style.display = 'block';
    document.getElementById('menu-section').style.display = 'none';
}

// ==================== 菜單渲染 ====================

function renderMenu() {
    // 湯麵選項
    const noodleList = document.getElementById('noodle-list');
    noodleList.innerHTML = CONFIG.menu.noodles.map(noodle =>
        `<button class="modal-item-btn" onclick="selectNoodle('${noodle.id}', '${noodle.name}')">
            <span class="modal-item-name">${noodle.name}</span>
        </button>`
    ).join('');

    // 口味選項
    const flavorList = document.getElementById('flavor-list');
    flavorList.innerHTML = CONFIG.menu.flavors.map(flavor =>
        `<button class="modal-item-btn" onclick="selectFlavor('${flavor.id}', '${flavor.name}')">
            <span class="modal-item-name">${flavor.name}</span>
        </button>`
    ).join('');

    // 小菜選項
    const sidesList = document.getElementById('sides-list');
    sidesList.innerHTML = CONFIG.menu.sides.map(side =>
        `<button class="modal-item-btn" onclick="addSideToCart('${side.id}', '${side.name}', ${side.price})">
            <span class="modal-item-name">${side.name}</span>
            <span class="modal-item-price">NT$${side.price}</span>
        </button>`
    ).join('');

    // 廚師面板 - 菜品管理
    const soldoutGrid = document.getElementById('soldout-grid');
    const allItems = [
        ...CONFIG.menu.noodles.map(n => ({ id: n.id, name: n.name })),
        ...CONFIG.menu.flavors.map(f => ({ id: f.id, name: f.name })),
        ...CONFIG.menu.sides.map(s => ({ id: s.id, name: s.name }))
    ];
    
    soldoutGrid.innerHTML = allItems.map(item =>
        `<button class="soldout-btn ${appState.soldOut.has(item.id) ? 'active' : ''}" 
                onclick="toggleSoldOut('${item.id}')">${item.name}</button>`
    ).join('');
}

// ==================== 訂單類型 ====================

function selectOrderType(type) {
    appState.currentOrderType = type;
    appState.cart = [];
    appState.selectedNoodle = null;
    appState.selectedFlavor = null;
    
    document.getElementById('order-types-section').style.display = 'none';
    document.getElementById('menu-section').style.display = 'block';
    updateCartDisplay();
}

// ==================== 預約選擇 ====================

function openReservationModal() {
    document.getElementById('reservation-modal').style.display = 'flex';
}

function closeReservationModal() {
    document.getElementById('reservation-modal').style.display = 'none';
}

document.querySelectorAll('#reservation-modal .modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        selectOrderType(type);
        closeReservationModal();
    });
});

// ==================== 湯麵選擇 ====================

function openNoodleModal() {
    document.getElementById('noodle-modal').style.display = 'flex';
}

function closeNoodleModal() {
    document.getElementById('noodle-modal').style.display = 'none';
}

function selectNoodle(id, name) {
    appState.selectedNoodle = { id, name };
    closeNoodleModal();
    openFlavorModal();
}

// ==================== 口味選擇 ====================

function openFlavorModal() {
    const title = document.getElementById('flavor-modal-title');
    title.textContent = appState.selectedNoodle ? 
        `${appState.selectedNoodle.name} - 選擇口味` : 
        '選擇口味';
    document.getElementById('flavor-modal').style.display = 'flex';
}

function closeFlavorModal() {
    document.getElementById('flavor-modal').style.display = 'none';
}

function selectFlavor(id, name) {
    appState.selectedFlavor = { id, name };
    
    // 添加到購物車
    const itemName = `${name}${appState.selectedNoodle.name}`;
    appState.cart.push({
        id: `${appState.selectedNoodle.id}-${id}`,
        name: itemName,
        type: 'noodle',
        noodle: appState.selectedNoodle.name,
        flavor: name
    });
    
    closeFlavorModal();
    appState.selectedNoodle = null;
    appState.selectedFlavor = null;
    updateCartDisplay();
}

// ==================== 小菜 ====================

function openSidesModal() {
    document.getElementById('sides-modal').style.display = 'flex';
}

function closeSidesModal() {
    document.getElementById('sides-modal').style.display = 'none';
}

function addSideToCart(id, name, price) {
    appState.cart.push({
        id,
        name,
        type: 'side',
        price
    });
    updateCartDisplay();
    // 保持模態打開，讓用戶繼續添加
}

// ==================== 購物車 ====================

function updateCartDisplay() {
    const cartSummary = document.getElementById('cart-summary');
    const cartItems = document.getElementById('cart-items');
    
    if (appState.cart.length === 0) {
        cartSummary.style.display = 'none';
        return;
    }
    
    cartSummary.style.display = 'block';
    cartItems.innerHTML = appState.cart.map((item, idx) =>
        `<div class="cart-item">
            <span class="cart-item-name">${item.name}</span>
            <button class="cart-item-remove" onclick="removeFromCart(${idx})">✕</button>
        </div>`
    ).join('');
}

function removeFromCart(index) {
    appState.cart.splice(index, 1);
    updateCartDisplay();
}

function backToTypes() {
    appState.currentOrderType = null;
    appState.cart = [];
    appState.selectedNoodle = null;
    appState.selectedFlavor = null;
    
    document.getElementById('order-types-section').style.display = 'block';
    document.getElementById('menu-section').style.display = 'none';
    updateCartDisplay();
}

// ==================== 提交訂單 ====================

function submitOrder() {
    if (appState.cart.length === 0) {
        alert('購物車是空的');
        return;
    }
    
    const customerName = document.getElementById('customer-name').value || '匿名';
    
    const order = {
        id: `ORDER_${Date.now()}`,
        type: appState.currentOrderType,
        customerName,
        items: appState.cart,
        timestamp: new Date().toLocaleTimeString('zh-TW'),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    appState.orders.push(order);
    saveOrders();
    
    alert(`訂單已送出！\n單號：${order.id}`);
    
    // 重置
    appState.cart = [];
    appState.currentOrderType = null;
    document.getElementById('customer-name').value = '';
    backToTypes();
}

// ==================== 廚師面板 ====================

function refreshKitchenPanel() {
    const liveOrders = appState.orders.filter(o => 
        o.status === 'pending' && 
        (o.type === 'dine_in' || o.type === 'takeaway')
    );
    
    const reservationOrders = appState.orders.filter(o =>
        o.status === 'pending' &&
        (o.type === 'reservation_dine_in' || o.type === 'reservation_takeaway')
    );
    
    renderOrders('live-orders', liveOrders);
    renderOrders('reservation-orders', reservationOrders);
}

function renderOrders(containerId, orders) {
    const container = document.getElementById(containerId);
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><p class="empty-state-text">暫無訂單</p></div>';
        return;
    }
    
    container.innerHTML = orders.map((order, idx) => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-number">#${idx + 1}</span>
                <span class="order-time">${order.timestamp}</span>
            </div>
            ${order.customerName !== '匿名' ? `<div class="order-customer">👤 ${order.customerName}</div>` : ''}
            <div class="order-items">
                ${order.items.map(item => 
                    `<div class="order-item ${appState.soldOut.has(item.id) ? 'soldout' : ''}">
                        ${item.name}
                    </div>`
                ).join('')}
            </div>
            <button class="order-complete-btn" onclick="completeOrder('${order.id}')">結單完成</button>
        </div>
    `).join('');
}

function completeOrder(orderId) {
    const order = appState.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        saveOrders();
        refreshKitchenPanel();
    }
}

function toggleSoldOut(itemId) {
    if (appState.soldOut.has(itemId)) {
        appState.soldOut.delete(itemId);
    } else {
        appState.soldOut.add(itemId);
    }
    
    saveSoldOut();
    renderMenu();
    
    // 更新廚師面板的菜品按鈕
    if (appState.isKitchenMode) {
        document.querySelectorAll('.soldout-btn').forEach(btn => {
            const allItems = [
                ...CONFIG.menu.noodles,
                ...CONFIG.menu.flavors,
                ...CONFIG.menu.sides
            ];
            allItems.forEach(item => {
                if (btn.textContent.trim() === item.name) {
                    if (appState.soldOut.has(item.id)) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                }
            });
        });
    }
}

// ==================== 存儲操作 ====================

function saveOrders() {
    localStorage.setItem(
        CONFIG.storage.ordersKey,
        JSON.stringify(appState.orders)
    );
}

function loadOrders() {
    const data = localStorage.getItem(CONFIG.storage.ordersKey);
    appState.orders = data ? JSON.parse(data) : [];
}

function saveSoldOut() {
    localStorage.setItem(
        CONFIG.storage.soldOutKey,
        JSON.stringify(Array.from(appState.soldOut))
    );
}

function loadSoldOut() {
    const data = localStorage.getItem(CONFIG.storage.soldOutKey);
    appState.soldOut = new Set(data ? JSON.parse(data) : []);
}

// ==================== Modal 關閉 ====================

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// 點擊背景關閉 Modal
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// 防止 Modal 內容點擊時關閉
document.addEventListener('click', (e) => {
    if (e.target.closest('.modal-content')) {
        e.stopPropagation();
    }
}, true);
