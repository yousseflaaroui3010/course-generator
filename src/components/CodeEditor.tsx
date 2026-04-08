import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export default function CodeEditor({ value, onChange, language = 'javascript', readOnly = false }: CodeEditorProps) {
  const highlightWithPrism = (code: string) => {
    const grammar = Prism.languages[language] || Prism.languages.javascript;
    return Prism.highlight(code, grammar, language);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-[#2d2d2d] shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase">{language}</span>
      </div>
      <div className="p-4 overflow-auto max-h-[500px]">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={highlightWithPrism}
          padding={10}
          disabled={readOnly}
          style={{
            fontFamily: '"Fira Code", "JetBrains Mono", monospace',
            fontSize: 14,
            backgroundColor: 'transparent',
            minHeight: '200px',
            color: '#f8f8f2'
          }}
          className="editor-container focus:outline-none"
        />
      </div>
    </div>
  );
}
