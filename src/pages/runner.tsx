import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
// 簡単なID生成関数
const generateId = () => Math.random().toString(36).substring(2, 15);

// 動的インポートでDynamicCodeExecutorを読み込み
const DynamicCodeExecutor = dynamic(() => import('../components/DynamicCodeExecutor'), {
  loading: () => <div className="animate-pulse">Loading code executor...</div>,
  ssr: false,
});

// postMessage通信の型定義
interface CodeExecutionMessage {
  type: 'EXECUTE_CODE' | 'EXECUTION_RESULT' | 'SANDBOX_READY';
  executionId: string;
  payload: {
    code?: string;
    result?: string;
    error?: string;
    timestamp: number;
  };
}

// 許可されたオリジンリスト
const ALLOWED_ORIGINS = [
  'https://app.deskrex.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const RunnerPage: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [executionId, setExecutionId] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<string>('Ready for code execution...');

  // メインアプリへメッセージを送信する関数
  const sendMessage = useCallback((message: CodeExecutionMessage) => {
    try {
      console.log('📤 Sending message to parent:', message);
      
      // 全ての許可されたオリジンに送信
      ALLOWED_ORIGINS.forEach(origin => {
        window.parent.postMessage(message, origin);
      });
      
      console.log('✅ Message sent to all origins');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  }, []);

  // 実行結果を送信する関数
  const handleExecutionResult = useCallback((result: string | null, error?: string) => {
    const message: CodeExecutionMessage = {
      type: 'EXECUTION_RESULT',
      executionId,
      payload: {
        result: error ? undefined : (result || undefined),
        error,
        timestamp: Date.now()
      }
    };
    
    sendMessage(message);
    setLastMessage(error ? `Error: ${error}` : 'Execution completed successfully');
  }, [executionId, sendMessage]);

  // postMessage受信ハンドラー
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 Message received from:', event.origin);
      console.log('📨 Message data:', event.data);

      // 🔒 セキュリティ: オリジン検証
      if (!ALLOWED_ORIGINS.includes(event.origin)) {
        console.warn('🚨 Security: Untrusted origin blocked:', event.origin);
        console.warn('🔒 Expected origins:', ALLOWED_ORIGINS);
        return;
      }

      const { type, executionId: msgExecutionId, payload } = event.data;

      if (!msgExecutionId) {
        console.warn('🚨 Security: Invalid execution ID');
        return;
      }

      console.log('✅ Message accepted:', type, payload);

      switch (type) {
        case 'EXECUTE_CODE':
          if (payload?.code) {
            console.log('⚛️ Executing code...', payload.code.substring(0, 100) + '...');
            setCode(payload.code);
            setExecutionId(msgExecutionId);
            setLastMessage(`Executing code (ID: ${msgExecutionId.substring(0, 8)}...)`);
          }
          break;
        default:
          console.warn('⚠️ Unknown message type:', type);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // サンドボックス準備完了通知
    setIsReady(true);
    const readyMessage: CodeExecutionMessage = {
      type: 'SANDBOX_READY',
      executionId: generateId(),
      payload: { 
        timestamp: Date.now() 
      }
    };
    
    sendMessage(readyMessage);
    console.log('📤 Sandbox ready message sent');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [sendMessage]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">JS Sandbox</h1>
              <p className="text-gray-600 mt-1">Secure JavaScript execution environment</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isReady ? 'Ready' : 'Initializing...'}
              </span>
            </div>
          </div>
        </div>

        {/* ステータス */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">{lastMessage}</span>
          </div>
          {executionId && (
            <div className="mt-2 text-xs text-gray-500">
              Execution ID: {executionId}
            </div>
          )}
        </div>

        {/* コード実行エリア */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {code ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Executing Code</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-32">
                  <code>{code.substring(0, 500)}{code.length > 500 ? '...' : ''}</code>
                </pre>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Output</h3>
                <DynamicCodeExecutor
                  code={code}
                  onResult={handleExecutionResult}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Waiting for code...</h3>
              <p className="text-gray-500">Send JavaScript or React code via postMessage to execute</p>
            </div>
          )}
        </div>

        {/* セキュリティ情報 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Domain isolation: Cannot access parent domain cookies/localStorage</li>
                  <li>Origin verification: Only accepts messages from authorized domains</li>
                  <li>CSP headers: Strict Content Security Policy enforced</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunnerPage;