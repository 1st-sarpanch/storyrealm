import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Eye, Bookmark } from "lucide-react";

interface RichTextEditorProps {
  initialValue?: string;
  onSave: (content: string) => void;
  wordCount?: boolean;
  placeholder?: string;
  title?: string;
  onTitleChange?: (title: string) => void;
  preview?: boolean;
}

export function RichTextEditor({
  initialValue = '',
  onSave,
  wordCount = true,
  placeholder = 'Start writing your story here...',
  title,
  onTitleChange,
  preview = true
}: RichTextEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [storyTitle, setStoryTitle] = useState(title || '');
  const [showPreview, setShowPreview] = useState(false);
  const [words, setWords] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Count words when content changes
  useEffect(() => {
    if (content && wordCount) {
      // Strip HTML tags and count words
      const text = content.replace(/<[^>]*>?/gm, '');
      const count = text.split(/\s+/).filter(word => word.length > 0).length;
      setWords(count);
    }
  }, [content, wordCount]);

  // Set up auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== initialValue) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(timer);
  }, [content, initialValue]);

  const handleSave = () => {
    onSave(content);
    setLastSaved(new Date());
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoryTitle(e.target.value);
    if (onTitleChange) {
      onTitleChange(e.target.value);
    }
  };

  const getTimeSinceLastSave = () => {
    if (!lastSaved) return '';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 60000);
    
    if (diff < 1) return 'just now';
    if (diff === 1) return '1 min ago';
    return `${diff} mins ago`;
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  return (
    <div className="bg-neutral p-6 rounded-xl shadow-2xl border border-secondary">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSave}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            <Save className="h-5 w-5" />
          </Button>
          {preview && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowPreview(!showPreview)}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <Eye className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {onTitleChange && (
        <div className="mb-4">
          <input
            type="text"
            value={storyTitle}
            onChange={handleTitleChange}
            placeholder="Enter story title..."
            className="w-full px-4 py-2 bg-primary/50 border border-secondary rounded-lg text-xl font-heading text-highlight focus:outline-none focus:ring-2 focus:ring-highlight"
          />
        </div>
      )}
      
      {showPreview ? (
        <Card className="mb-6 border-secondary">
          <CardContent className="p-6">
            <h2 className="text-2xl font-heading text-highlight mb-4">{storyTitle || 'Untitled Story'}</h2>
            <div 
              className="prose prose-invert prose-headings:font-heading prose-headings:text-highlight prose-p:text-gray-300 max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="bg-primary/50 rounded-lg border border-secondary mb-6 overflow-hidden">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder={placeholder}
              className="text-gray-300 h-64 overflow-y-auto scrollbar-custom"
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        {wordCount && (
          <div className="text-xs text-gray-400">
            <span>Words: {words}</span>
            {lastSaved && <span className="ml-3">Auto-saved {getTimeSinceLastSave()}</span>}
          </div>
        )}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="bg-secondary hover:bg-secondary/80 transition"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            className="bg-highlight hover:bg-accent transition text-neutral font-medium"
          >
            <Bookmark className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}
