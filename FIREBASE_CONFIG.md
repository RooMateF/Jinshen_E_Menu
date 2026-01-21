# Firebase 配置指南 - JinShenAPP

## 重要：你的數據去向

所有訂單數據目前存在 **瀏覽器本地 localStorage**，不會上傳到任何地方。

當你設置 Firebase 後，數據才會同步到 Firebase Firestore（Google 的數據庫）。

---

## 步驟 1：進入 Firebase Console

1. 打開：https://console.firebase.google.com
2. 選擇你的專案 **JinShenAPP**

---

## 步驟 2：獲取 Firebase 配置

1. 進入 Project Settings（專案設定）
   - 按左下角齒輪圖示
   - 選「Project Settings」

2. 找到「Your apps」部分
   - 點「</> 」(Add app)
   - 選 Web

3. 複製配置代碼

會看到這樣的東西：
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "jinsenapp.firebaseapp.com",
  databaseURL: "https://jinsenapp.firebaseio.com",
  projectId: "jinsenapp",
  storageBucket: "jinsenapp.appspot.com",
  messagingSenderId: "...",
  appId: "1:...",
  measurementId: "..."
};
```

---

## 步驟 3：更新 config.json

編輯你的 `config.json`：

```json
{
  "firebase": {
    "projectId": "jinsenapp",
    "apiKey": "AIza...",           // 改這裡
    "authDomain": "jinsenapp.firebaseapp.com",
    "databaseURL": "https://jinsenapp.firebaseio.com",
    "storageBucket": "jinsenapp.appspot.com",
    "messagingSenderId": "...",    // 改這裡
    "appId": "1:..."               // 改這裡
  }
}
```

把你複製的值貼進去。

---

## 步驟 4：啟用 Firestore Database

1. Firebase Console 左側 → Build → Firestore Database
2. 點「Create Database」
3. 選 Singapore（新加坡）地區
4. 選「Start in test mode」（開發期間）

---

## 步驟 5：設定安全規則

Firestore → Rules

改為：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{document=**} {
      allow read, write: if true;  // 開發期間
    }
    match /soldout/{document=**} {
      allow read, write: if true;  // 開發期間
    }
  }
}
```

點「Publish」

---

## 目前配置狀態

✅ **config.json** - Firebase 配置已預留
✅ **app.js** - Firebase 已準備（尚未啟用）
⚠️ **Firebase SDK** - 未添加（稍後添加）

---

## 目前數據流向

```
客人 → 網站 → 瀏覽器 localStorage
廚師 → 網站 → 瀏覽器 localStorage
```

數據只存在瀏覽器，刷新會保留，但換設備不會同步。

---

## 啟用 Firebase（稍後）

當你準備好時：

1. 在 `index.html` 加入 Firebase SDK
2. 改 `app.js` 的 `saveOrders()` 上傳到 Firestore
3. 改廚師面板監聽 Firestore 即時更新

---

## 防止配置外洩

⚠️ **重要**：你的 `config.json` 中的 API Key 會在瀏覽器中可見。

為了安全，生產環境應該：
1. 使用 Firestore 安全規則限制訪問
2. 啟用 reCAPTCHA
3. 後端驗證

開發期間沒關係，但上線前要加強安全。

---

## 快速測試

如果你想現在就測試 Firebase：

1. 完成上面的步驟 1-4
2. 告訴我，我幫你添加 Firebase SDK 和同步代碼

現在還是用 localStorage 就可以了，完全夠用！

---

## 常見問題

**Q: 我的 API Key 被暴露了嗎？**
A: 不會。Firestore 安全規則會保護數據。但開發期間要小心不要把 config.json 上傳到公開地方。

**Q: 可以不用 Firebase 嗎？**
A: 完全可以！目前的 localStorage 版本很好用。Firebase 只是為了多設備同步。

**Q: localStorage 數據會丟失嗎？**
A: 不會。除非：
- 用戶清空瀏覽器快取
- 用戶刪除網站數據
- 瀏覽器出錯

---

**暫時不配置也沒問題，繼續開發吧！** 🚀
