# CIE 色彩空間視覺化點位工具 (CIE Visualizer)

這是一個使用 Next.js 和 TypeScript 建置的線上工具，旨在幫助使用者在 CIE 1976 u'v' 和 CIE 1931 xy 色度圖上標記與視覺化色彩點位。

## ✨ 主要功能

- **雙圖表支援**: 可在 CIE 1976 u'v' 與 CIE 1931 xy 兩種圖表間自由切換。
- **互動式點位標記**: 在圖表上即時顯示輸入的座標點位。
- **點位管理**: 輕鬆新增、刪除、清空所有點位。
- **資料匯出/匯入**: 可將點位資料匯出為 `.json` 檔案，或從現有 `.json` 檔案匯入，方便備份與分享。
- **響應式設計**: 在桌面和行動裝置上皆有良好的瀏覽體驗。

## 🚀 如何在本機啟動

1.  **安裝依賴套件**:
    ```bash
    npm install
    ```

2.  **啟動開發伺服器**:
    ```bash
    npm run dev
    ```

3.  在瀏覽器中開啟 `http://localhost:3000` 即可看到應用程式。

## 🛠️ 使用技術

- [Next.js](https://nextjs.org/) – React 框架
- [React](https://react.dev/) – UI 函式庫
- [TypeScript](https://www.typescriptlang.org/) – 型別系統
- [Tailwind CSS](https://tailwindcss.com/) – CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) – UI 元件
