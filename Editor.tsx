'use client'

import React, { useState, useEffect, useRef } from 'react'
import { RefreshCw, Copy } from 'lucide-react'
// Uncomment to use shadcn toast...
// import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  code: string;
  onChange?: (code: string) => void;
  onRefresh?: () => void;
}

const customTheme = {
  colors: {
    surface1: "#18181C",
    surface2: "#313244",
    surface3: "#45475a",
    clickable: "#cdd6f4",
    base: "#cdd6f4",
    disabled: "#6c7086",
    hover: "#b4befe",
    accent: "#cba6f7",
    error: "#f38ba8",
    errorSurface: "#45475a",
  },
  syntax: {
    plain: "#cdd6f4",
    comment: "#6c7086",
    keyword: "#cba6f7",
    tag: "#89b4fa",
    punctuation: "#94e2d5",
    definition: "#f9e2af",
    property: "#a6e3a1",
    static: "#fab387",
    string: "#f9e2af",
    components: "#578FD6",
  },
  font: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    mono: "'Fira Code', 'Fira Mono', 'DejaVu Sans Mono', Menlo, Consolas, 'Liberation Mono', Monaco, 'Lucida Console', monospace",
    size: "14px",
    lineHeight: "24px",
  },
}

const syntaxHighlight = (code: string) => {
  const keywords = ['import', 'from', 'const', 'let', 'var', 'function', 'return', 'export', 'default', '=']
  const punctuation = ['{', '}', '(', ')', '[', ']', ',', ';']
  const htmlTags = ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'img', 'ul', 'ol', 'li', 'button', 'input', 'form', 'label']
  
  return code.split('\n').map((line, index) => (
    <div key={index}>
      {line.split(/(<[^>]+>|[^<]+)/).map((part, i) => {
        if (part.startsWith('<') && part.endsWith('>')) {
          // Handle HTML/JSX tags and custom components
          return (
            <span key={i}>
              {part.split(/(<\/?)([\w.]+)([\s\S]*?)(\/?>)/).map((tagPart, j) => {
                if (tagPart === '<' || tagPart === '</' || tagPart === '>' || tagPart === '/>') {
                  return <span key={j} style={{ color: customTheme.syntax.punctuation }}>{tagPart}</span>
                } else if (htmlTags.includes(tagPart.toLowerCase()) || /^[A-Z]/.test(tagPart) || tagPart.includes('.')) {
                  return <span key={j} style={{ color: customTheme.syntax.components }}>{tagPart}</span>
                } else if (tagPart.trim()) {
                  // Handle attributes
                  return tagPart.split(/(\s+\w+)(=)/).map((attrPart, k) => {
                    if (attrPart.trim().startsWith('=')) {
                      return <span key={k} style={{ color: customTheme.syntax.punctuation }}>{attrPart}</span>
                    } else if (attrPart.trim().startsWith('"') || attrPart.trim().startsWith("'")) {
                      return <span key={k} style={{ color: customTheme.syntax.string }}>{attrPart}</span>
                    } else if (attrPart.trim()) {
                      return <span key={k} style={{ color: customTheme.syntax.property }}>{attrPart}</span>
                    }
                    return attrPart
                  })
                }
                return tagPart
              })}
            </span>
          )
        } else {
          // Handle non-tag content
          return part.split(/(\s+)/).map((subPart, j) => {
            if (keywords.includes(subPart)) {
              return <span key={`${i}-${j}`} style={{ color: customTheme.syntax.keyword }}>{subPart}</span>
            } else if (punctuation.includes(subPart)) {
              return <span key={`${i}-${j}`} style={{ color: customTheme.syntax.punctuation }}>{subPart}</span>
            } else if (subPart.startsWith("'") || subPart.startsWith('"')) {
              return <span key={`${i}-${j}`} style={{ color: customTheme.syntax.string }}>{subPart}</span>
            } else if (subPart.startsWith('//')) {
              return <span key={`${i}-${j}`} style={{ color: customTheme.syntax.comment, fontStyle: 'italic' }}>{subPart}</span>
            } else {
              return <span key={`${i}-${j}`}>{subPart}</span>
            }
          })
        }
      })}
    </div>
  ))
}

export default function CodeEditor({ code: initialCode, onChange, onRefresh }: CodeEditorProps) {
  const [localCode, setLocalCode] = useState(initialCode)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const highlightedCodeRef = useRef<HTMLPreElement>(null)
  //const { toast } = useToast()

  useEffect(() => {
    setLocalCode(initialCode)
  }, [initialCode])

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setLocalCode(newCode)
    onChange?.(newCode)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(initialCode)
    //toast({
    //  title: 'Code copied to clipboard',
    //  description: 'Code has been copied to your clipboard.',
    //})
  }

  const refreshCode = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      setLocalCode(initialCode)
    }
  }

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current && highlightedCodeRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
      highlightedCodeRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const lines = localCode.split('\n')

  return (
    <div className="h-full" style={{
      backgroundColor: customTheme.colors.surface1,
      color: customTheme.colors.base,
      fontFamily: customTheme.font.mono,
      fontSize: customTheme.font.size,
      lineHeight: customTheme.font.lineHeight,
    }}>
      <div className="flex justify-end p-2">
        <button 
          onClick={refreshCode} 
          className="p-1 rounded hover:bg-surface3" 
          style={{ color: customTheme.colors.clickable }}
        >
          <RefreshCw size={16} />
        </button>
        <button 
          onClick={copyToClipboard} 
          className="p-1 rounded ml-2 hover:bg-surface3" 
          style={{ color: customTheme.colors.clickable }}
        >
          <Copy size={16} />
        </button>
      </div>
      <div className="relative h-[calc(100%-40px)] flex">
        <div 
          ref={lineNumbersRef}
          className="p-4 select-none pointer-events-none overflow-hidden"
          style={{ width: '3em', color: customTheme.colors.disabled }}
        >
          {lines.map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={localCode}
            onChange={handleCodeChange}
            onScroll={handleScroll}
            className="absolute top-0 left-0 h-full w-full bg-transparent outline-none p-4 resize-none"
            spellCheck="false"
            style={{ color: 'transparent', caretColor: customTheme.colors.base }}
          />
          <pre 
            ref={highlightedCodeRef}
            className="absolute top-0 left-0 h-full w-full overflow-hidden p-4"
            style={{ pointerEvents: 'none', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
          >
            {syntaxHighlight(localCode)}
          </pre>
        </div>
      </div>
    </div>
  )
}
