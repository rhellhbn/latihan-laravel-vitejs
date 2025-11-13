import React, { useEffect, useRef } from 'react';
import 'trix';
import 'trix/dist/trix.css';

export default function TrixEditor({ value, onChange, placeholder = "Enter description..." }) {
  const editorRef = useRef(null);
  const inputId = useRef(`trix-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const editor = editorRef.current;
    
    if (editor) {
      // Force LTR direction
      editor.style.direction = 'ltr';
      editor.style.textAlign = 'left';
      
      // Set initial value
      if (value && editor.editor) {
        editor.editor.loadHTML(value);
      }

      // Handle changes
      const handleChange = (e) => {
        const content = e.target.innerHTML;
        onChange(content);
      };

      editor.addEventListener('trix-change', handleChange);

      return () => {
        editor.removeEventListener('trix-change', handleChange);
      };
    }
  }, [onChange]);

  // Update editor when value changes externally
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.editor) {
      const currentHTML = editor.innerHTML;
      if (value !== currentHTML) {
        editor.editor.loadHTML(value || '');
      }
    }
  }, [value]);

  return (
    <div>
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
        className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ direction: 'ltr', textAlign: 'left' }}
      />
    </div>
  );
}