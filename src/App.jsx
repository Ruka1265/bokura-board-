import { useState, useEffect } from 'react'
import PostInput from './PostInput'
import './App.css'
import { db } from './firebase'
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, onSnapshot } from 'firebase/firestore'

function App() {
  const [posts, setPosts] = useState([])
  const [lastPostTime, setLastPostTime] = useState(0) // 最後の投稿時刻
  const [cooldownRemaining, setCooldownRemaining] = useState(0) // 残りクールダウン時間
  const [userId, setUserId] = useState('') // 現在のユーザーID

  // ユーザーIDの初期化
  useEffect(() => {
    let storedUserId = localStorage.getItem('messageBoardApp_userId');
    if (!storedUserId) {
      // ユニークなユーザーIDを生成
      storedUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('messageBoardApp_userId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Firestoreから投稿一覧をリアルタイムで取得
  useEffect(() => {
    console.log("Setting up real-time listener for posts..."); // デバッグログ
    
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    
    // リアルタイムリスナーを設定
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        console.log("Real-time update received, snapshot size:", querySnapshot.size); // デバッグログ
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          text: doc.data().text,
          timestamp: doc.data().createdAt?.toDate().toLocaleString('ja-JP') || new Date().toLocaleString('ja-JP'),
          userId: doc.data().userId // ユーザーIDを取得
        }));
        console.log("Updated posts data:", postsData); // デバッグログ
        setPosts(postsData);
      },
      (error) => {
        console.error("Error in real-time listener: ", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // より詳細なエラー情報を表示
        let errorMessage = "投稿の取得に失敗しました";
        if (error.code === 'permission-denied') {
          errorMessage = "データベースへのアクセス権限がありません。Firebase セキュリティルールを確認してください。";
        } else if (error.code === 'unavailable') {
          errorMessage = "ネットワーク接続に問題があります。接続を確認して再試行してください。";
        }
        
        alert(errorMessage + "\n詳細: " + error.message);
        
        // エラーが発生した場合は一度だけ手動で取得を試行
        fetchPostsManually();
      }
    );

    // 手動取得のフォールバック関数
    const fetchPostsManually = async () => {
      try {
        console.log("Fallback: Fetching posts manually...");
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          text: doc.data().text,
          timestamp: doc.data().createdAt?.toDate().toLocaleString('ja-JP') || new Date().toLocaleString('ja-JP'),
          userId: doc.data().userId
        }));
        console.log("Manual fetch successful, got", postsData.length, "posts");
        setPosts(postsData);
      } catch (error) {
        console.error("Error in manual fetch: ", error);
        console.error("Manual fetch error code:", error.code);
        console.error("Manual fetch error message:", error.message);
        
        let errorMessage = "投稿の手動取得に失敗しました";
        if (error.code === 'permission-denied') {
          errorMessage = "データベースへのアクセス権限がありません。";
        } else if (error.code === 'unavailable') {
          errorMessage = "ネットワーク接続に問題があります。";
        }
        
        // コンソールにのみエラーを出力し、アラートは表示しない
        console.error(errorMessage + ": " + error.message);
      }
    };

    // コンポーネントのアンマウント時にリスナーを解除
    return () => {
      console.log("Unsubscribing from real-time listener");
      unsubscribe();
    };
  }, []);

  // クールダウンタイマーの管理
  useEffect(() => {
    if (lastPostTime === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastPost = now - lastPostTime;
      const cooldownTime = 10000; // 10秒
      const remaining = Math.max(0, Math.ceil((cooldownTime - timeSinceLastPost) / 1000));
      
      setCooldownRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastPostTime]);

  // Firestoreにメッセージを追加
  const handleAddPost = async (text) => {
    const now = Date.now();
    const timeSinceLastPost = now - lastPostTime;
    const cooldownTime = 10000; // 10秒のクールダウン

    // クールダウン中かチェック
    if (timeSinceLastPost < cooldownTime) {
      const remainingSeconds = Math.ceil((cooldownTime - timeSinceLastPost) / 1000);
      alert(`連続投稿制限中です。${remainingSeconds}秒後に再度投稿してください。`);
      return;
    }

    console.log("handleAddPost called with text:", text); // デバッグログ
    try {
      const newPost = {
        text: text,
        createdAt: new Date(),
        userId: userId // ユーザーIDを追加
      }
      console.log("Attempting to add post to Firestore:", newPost); // デバッグログ
      const docRef = await addDoc(collection(db, "posts"), newPost);
      console.log("Post added successfully with ID:", docRef.id); // デバッグログ
      
      // 最後の投稿時刻を更新
      setLastPostTime(now);
      
      // リアルタイムリスナーが自動的に状態を更新するため、手動でのsetPostsは不要
    } catch (error) {
      console.error("Error adding post: ", error);
      alert("投稿に失敗しました: " + error.message); // ユーザーにもエラーを表示
    }
  }

  // Firestoreからメッセージを削除
  const handleDeletePost = async (id) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      console.log("Post deleted successfully with ID:", id); // デバッグログ
      // リアルタイムリスナーが自動的に状態を更新するため、手動でのsetPostsは不要
    } catch (error) {
      console.error("Error deleting post: ", error);
      alert("投稿の削除に失敗しました: " + error.message);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col overflow-x-hidden">
      {/* ヘッダーバー */}
      <div className="w-full bg-white shadow-sm border-b px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800">
          ぼくらの掲示板（β版）
        </h1>
      </div>

      {/* モバイル・タブレット用：縦並び / デスクトップ用：横並び */}
      <div className="flex flex-col md:flex-row flex-1 w-full overflow-x-hidden">
        {/* サイドバー（投稿フォーム）- モバイルでは下部、PCでは左側 */}
        <div className="w-full md:w-80 flex-shrink-0 bg-white border-t md:border-t-0 md:border-r p-3 md:p-6 order-2 md:order-1 overflow-x-hidden">
          <PostInput onAddPost={handleAddPost} cooldownRemaining={cooldownRemaining} />
        </div>

        {/* メインエリア（投稿一覧）- モバイルでは上部、PCでは右側 */}
        <div className="flex-1 min-w-0 p-3 md:p-6 overflow-y-auto overflow-x-hidden order-1 md:order-2 md:h-screen">
          <div className="w-full md:max-w-4xl md:mx-auto pb-4 md:pb-0">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                投稿一覧
              </h2>
              <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium flex-shrink-0 ${
                posts.length > 0 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {posts.length}件
              </span>
            </div>
            
            {posts.length > 0 ? (
              <div className="grid gap-3 md:gap-4">
                {posts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className={`p-3 md:p-4 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 ease-in-out ${
                      post.userId === userId ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    } ${index === 0 ? 'animate-fade-in' : ''}`}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="flex justify-between items-start mb-2 md:mb-3 w-full">
                      <p className="text-gray-800 flex-1 mr-2 md:mr-4 text-sm md:text-base leading-relaxed break-words overflow-wrap-anywhere">{post.text}</p>
                      {/* 自分の投稿の場合のみ削除ボタンを表示 */}
                      {post.userId === userId && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 md:p-2 rounded transition-colors flex-shrink-0 ml-2"
                          title="投稿を削除"
                        >
                          <svg 
                            className="w-4 h-4 md:w-5 md:h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-gray-500 w-full">
                      <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate flex-1">{post.timestamp}</span>
                      {post.userId === userId && (
                        <span className="ml-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap flex-shrink-0">
                          あなたの投稿
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 md:py-24 text-gray-500">
                <svg className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-base md:text-lg">まだ投稿がありません</p>
                <p className="text-xs md:text-sm mt-1 md:mt-2 text-center px-4">
                  <span className="md:hidden">下の入力欄</span>
                  <span className="hidden md:inline">左側の入力欄</span>
                  から最初の投稿をしてみましょう
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
