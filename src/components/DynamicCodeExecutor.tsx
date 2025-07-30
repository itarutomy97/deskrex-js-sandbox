import React, { useMemo, useCallback } from 'react';
import { Runner } from 'react-runner';
import * as ReactIcons from 'react-icons';
import * as Recharts from 'recharts';
import * as Mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DynamicCodeExecutorProps {
  code: string;
  onResult: (result: string | null, error?: string) => void;
}

const DynamicCodeExecutor: React.FC<DynamicCodeExecutorProps> = ({ code, onResult }) => {
  // ArtifactViewと同じscopeを定義
  const scope = useMemo(() => ({
    React,
    ReactIcons,
    Recharts,
    Mermaid,
    ReactMarkdown,
    remarkGfm,
    import: {
      react: React,
      "react-markdown": ReactMarkdown,
      "remark-gfm": remarkGfm,
      "react-icons": ReactIcons,
      recharts: Recharts,
      mermaid: Mermaid,
    },
  }), []);

  // react-runnerのレンダー結果ハンドラー
  const handleRendered = useCallback((error?: Error) => {
    if (error) {
      const errorMessage = `React execution error: ${error.message}`;
      console.error('❌ React execution failed:', error);
      onResult(null, errorMessage);
    } else {
      console.log('✅ React component rendered successfully');
      onResult('Component rendered successfully');
    }
  }, [onResult]);

  if (!code) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm text-yellow-800">
          No code to execute. Make sure your code contains a React component.
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-32 p-4 border border-gray-200 rounded-lg bg-white">
        <Runner 
          code={code} 
          scope={scope} 
          onRendered={handleRendered}
        />
      </div>
    );
  } catch (renderError) {
    const errorMessage = renderError instanceof Error ? renderError.message : 'Render error';
    console.error('❌ Component render failed:', renderError);
    
    // レンダーエラーを報告
    setTimeout(() => {
      onResult(null, `Render error: ${errorMessage}`);
    }, 100);
    
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-sm text-red-800">
          <strong>Render Error:</strong> {errorMessage}
        </div>
      </div>
    );
  }
};

export default DynamicCodeExecutor;