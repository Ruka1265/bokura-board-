# ぼくらの掲示板 🗣️

**リアルタイム匿名掲示板アプリケーション**

誰でも自由に投稿できるシンプルなリアルタイム掲示板です。Firebase Firestoreを使用してリアルタイムでメッセージが更新され、レスポンシブデザインでモバイルからデスクトップまで快適にご利用いただけます。
URL: https://today-note-app.web.app/

*A real-time anonymous message board where anyone can freely post messages. Built with Firebase Firestore for real-time updates and responsive design for seamless experience across all devices.*

## ✨ 主な機能

- **リアルタイム投稿**: 投稿が即座に全ユーザーに反映
- **140文字制限**: 簡潔でわかりやすいメッセージ投稿
- **投稿削除**: 自分の投稿のみ削除可能
- **連続投稿制限**: 10秒のクールダウンでスパム防止
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **匿名システム**: アカウント登録不要で気軽に利用

## 🛠️ 技術スタック

### Frontend
- **React** 19.1.0 - モダンなUIライブラリ
- **Vite** 7.0.0 - 高速ビルドツール
- **TailwindCSS** 3.4.17 - ユーティリティファーストCSS

### Backend
- **Firebase** 11.9.1 - BaaS（Backend as a Service）
- **Cloud Firestore** - リアルタイムNoSQLデータベース
- **Firebase Hosting** - 静的サイトホスティング

### 開発ツール
- **ESLint** - コード品質管理
- **PostCSS** & **Autoprefixer** - CSS最適化

##  プロジェクト構成

```
bokura-board/
├── src/
│   ├── App.jsx          # メインアプリケーション
│   ├── PostInput.jsx    # 投稿入力コンポーネント
│   ├── firebase.js      # Firebase設定
│   └── main.jsx         # エントリーポイント
├── public/
├── firebase.json
├── package.json
└── README.md
```

## 🎯 使用方法

1. **投稿**: 入力欄にメッセージを入力して「投稿する」ボタンをクリック
2. **閲覧**: 投稿一覧で他のユーザーの投稿をリアルタイムで確認
3. **削除**: 自分の投稿に表示される削除ボタンで投稿を削除

## 📝 ライセンス

MIT License

## 👤 作成者

**寺田 光** - [GitHub](https://github.com/your-username)
