# 謹聖廚房 - 快速部署指南

## 📦 文件清單

```
outputs/
├── config.json           (配置文件 - 所有參數)
├── index.html            (主頁面)
├── style.css             (簡約木頭文青風格)
├── app.js                (核心邏輯)
└── README.md             (這個文件)
```

## 🚀 立即開始

### 1. 本地測試（最快）
```bash
# 進入項目文件夾
cd /path/to/project

# 用任何 HTTP 服務器打開
# Python 3
python -m http.server 8000

# 或 Node.js (http-server)
npx http-server

# 打開瀏覽器
# http://localhost:8000
```

### 2. 上傳到 GitHub

```bash
# 初始化 git
git init
git add .
git commit -m "Initial commit"

# 添加遠程倉庫
git remote add origin https://github.com/your-username/noodle-ordering.git
git branch -M main
git push -u origin main

# 部署到 GitHub Pages
# 1. 進入 GitHub 倉庫設定
# 2. 找到 Settings → Pages
# 3. 選擇 "Deploy from a branch"
# 4. 選擇 main 分支
# 5. 點擊 Save

# 訪問：https://your-username.github.io/noodle-ordering
```

### 3. 快速部署選項

#### A. Vercel (推薦)
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel
```

#### B. Netlify
```bash
# 拖曳文件夾到 Netlify 網站
# https://app.netlify.com/drop
```

#### C. 自己的伺服器
```bash
# 複製所有 HTML/CSS/JS 文件
# 放到伺服器的公開目錄
# 通常是 /var/www/html 或 public_html
```

## 📝 配置修改

### 改菜單
編輯 `config.json`:
```json
{
  "menu": {
    "noodles": [
      { "id": "noodle_1", "name": "你的麵條" },
      // ...
    ],
    "flavors": [
      { "id": "flavor_1", "name": "你的口味" },
      // ...
    ],
    "sides": [
      { "id": "side_1", "name": "小菜名稱", "price": 價格 },
      // ...
    ]
  }
}
```

### 改密碼
編輯 `config.json`:
```json
{
  "app": {
    "adminPassword": "你的密碼"
  }
}
```

### 改色彩
編輯 `config.json` 的 `colors` 部分:
```json
{
  "colors": {
    "primary": "#5D4E37",      // 深棕
    "secondary": "#8B6F47",    // 淺棕
    "accent": "#A0826D",       // 米棕
    // ... 其他顏色
  }
}
```

或直接編輯 `style.css`:
```css
:root {
    --primary: #5D4E37;
    --secondary: #8B6F47;
    /* ... */
}
```

## 🎮 使用說明

### 客人端
1. 打開網站
2. 選擇訂位類型（現場內用/外帶/預約）
3. 點擊「謹聖廚房招牌湯麵」選麵條和口味
4. 點擊「小菜」添加小菜
5. 輸入名字（可選）
6. 確認送單

### 廚師端
1. 點擊標題區域 **8 次**
2. 輸入密碼（預設 000000）
3. 進入廚師面板
4. 點擊菜品按鈕標記售完
5. 收到訂單後，點「結單完成」

## 💾 數據存儲

所有訂單存儲在瀏覽器的 `localStorage` 中：
- 訂單數據：`noodle_orders`
- 售完菜品：`noodle_soldout`

刷新頁面不會丟失數據。如需清空：
```javascript
// 在瀏覽器控制台執行
localStorage.clear();
```

## 🔄 自動更新

廚師面板會每 30 秒自動刷新訂單列表（從 localStorage）。

## 📱 响應式

- 手機（320px+）：單欄佈局
- 平板（768px+）：適應佈局
- 桌面（1200px+）：雙欄廚師面板

## 🎨 設計亮點

- 簡約木頭文青風格
- 無 Emoji - 純文字
- Modal 浮窗 - 無頁面跳轉
- 深色棕色主題 (#5D4E37)
- 平滑過渡動畫

## 🔧 常見修改

### 改應用名稱
在 `config.json`:
```json
{
  "app": {
    "name": "你的店名",
    "tagline": "你的標語"
  }
}
```

### 添加新菜品
在 `config.json` 的 `menu.sides`:
```json
{
  "id": "side_4",
  "name": "新菜品名稱",
  "price": 50
}
```

### 改廚師面板大小
編輯 `style.css`:
```css
.orders-container {
    grid-template-columns: 1fr 1fr;  /* 改這裡 */
}
```

## 📊 訂單匯出

```javascript
// 在瀏覽器控制台執行，匯出為 JSON
const orders = JSON.parse(localStorage.getItem('noodle_orders'));
console.log(JSON.stringify(orders, null, 2));

// 複製到文件中做備份
```

## 🐛 故障排除

### Modal 沒打開
- 檢查瀏覽器控制台（F12）看有沒有錯誤
- 確認 `app.js` 是否正確載入

### 訂單沒保存
- 檢查瀏覽器是否允許 localStorage
- 檢查私密模式（私密模式不支持 localStorage）

### 廚師密碼失效
- 確認已改 `config.json` 中的 `adminPassword`
- 清空瀏覽器快取再試

### 樣式不正確
- 確認 `style.css` 與 `index.html` 在同一個文件夾
- 清空瀏覽器快取：Ctrl+Shift+Delete

## 📞 需要 Firebase 實時同步？

這個版本使用 localStorage（單機），如果需要多設備即時同步，可以添加 Firebase：

```javascript
// 在 app.js 頂部添加
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = { /* 你的配置 */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 改 saveOrders 函數為上傳到 Firestore
```

但目前版本已經支持一台廚師機器完整使用（通過同一個瀏覽器）。

## 🎯 下一步

1. 複製這 4 個文件到一個文件夾
2. 用 HTTP 服務器打開 `index.html`
3. 測試客人端和廚師端
4. 修改 `config.json` 配置菜單
5. 部署到 GitHub Pages 或 Vercel

---

**祝你營業順利！** 
有問題隨時檢查瀏覽器控制台的錯誤信息。
