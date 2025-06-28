import { useState } from 'react'

function PostInput({ onAddPost, cooldownRemaining }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      onAddPost(text.trim())
      setText('') // 投稿後にフォームをクリア
    }
  }

  return (
    <div className="w-full overflow-x-hidden">
      <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-6">
        新しい投稿
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 w-full">
        <div className="w-full">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
            投稿内容
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="自由に投稿してください..."
            className="w-full p-2 md:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20 md:h-32 text-xs md:text-sm box-border overflow-x-hidden"
            maxLength={140}
          />
          <div className="flex justify-between items-center mt-1 md:mt-2 w-full">
            <div className="text-xs text-gray-500 flex-shrink-0">
              最大140文字まで
            </div>
            <div className={`text-xs md:text-sm font-medium flex-shrink-0 ${text.length > 120 ? 'text-red-500' : 'text-gray-500'}`}>
              {text.length}/140
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!text.trim() || cooldownRemaining > 0}
          className="w-full bg-blue-600 text-white py-2 md:py-3 px-3 md:px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center text-sm md:text-base box-border"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="truncate">
            {cooldownRemaining > 0 ? `${cooldownRemaining}秒後に投稿可能` : '投稿する'}
          </span>
        </button>
        
        {/* クールダウン警告メッセージ */}
        {cooldownRemaining > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs md:text-sm text-yellow-700">
                連続投稿制限中です。{cooldownRemaining}秒後に再度投稿してください。
              </p>
            </div>
          </div>
        )}
      </form>

      {/* 投稿のヒント - デスクトップでのみ表示 */}
      <div className="hidden md:block mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 投稿のコツ</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 思ったことを自由に投稿してみましょう</li>
          <li>• 短い投稿でも大歓迎です</li>
          <li>• 絵文字も使えます 😊</li>
        </ul>
      </div>
    </div>
  )
}

export default PostInput
