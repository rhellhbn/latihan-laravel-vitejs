import React, { useEffect, useRef } from 'react';
import 'trix';
import 'trix/dist/trix.css';

export default function TrixEditor({ value, onChange, placeholder = "Enter description..." }) {
  const editorRef = useRef(null);
  const inputId = useRef(`trix-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const editor = editorRef.current;
    
    if (editor) {
      // Paksa LTR pada editor
      editor.setAttribute('dir', 'ltr');
      
      // Set initial value
      if (value && editor.editor) {
        editor.editor.loadHTML(value);
      }

      // Handle changes
      const handleChange = (e) => {
        const content = editor.innerHTML;
        onChange(content);
      };

      // Handle initialize
      const handleInitialize = () => {
        if (editor.editor && editor.editor.element) {
          // Paksa LTR pada element editor
          editor.editor.element.setAttribute('dir', 'ltr');
          editor.editor.element.style.direction = 'ltr';
          editor.editor.element.style.textAlign = 'left';
        }
      };

      editor.addEventListener('trix-change', handleChange);
      editor.addEventListener('trix-initialize', handleInitialize);

      return () => {
        editor.removeEventListener('trix-change', handleChange);
        editor.removeEventListener('trix-initialize', handleInitialize);
      };
    }
  }, [onChange]);

  // Update editor when value changes externally
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.editor && value !== editor.innerHTML) {
      editor.editor.loadHTML(value || '');
    }
  }, [value]);

  return (
    <div dir="ltr" style={{ direction: 'ltr' }}>
      <input 
        id={inputId.current}
        type="hidden" 
        value={value || ''}
        readOnly
      />
      <trix-editor 
        ref={editorRef}
        input={inputId.current}
        placeholder={placeholder}
        dir="ltr"
        style={{ 
          direction: 'ltr !important', 
          textAlign: 'left !important',
          unicodeBidi: 'bidi-override'
        }}
        className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}