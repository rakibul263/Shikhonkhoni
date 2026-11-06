"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "cn";
import React, { useEffect } from "react";
import { Toolbar } from "./Toolbar";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  minHeight?: string;
}

export function Editor({
  value = "",
  onChange,
  placeholder = "Write course description, syllabus, learning outcomes, and prerequisites...",
  editable = true,
  className,
  minHeight = "min-h-[180px]",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 cursor-pointer font-medium",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none p-3.5 text-sm leading-relaxed max-w-none text-foreground",
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mb-2 [&_h1]:mt-3",
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mb-2 [&_h2]:mt-2.5",
          "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-2",
          "[&_p]:mb-2.5 [&_p:last-child]:mb-0",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2.5 [&_li]:mb-1",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-muted-foreground",
          "[&_pre]:bg-muted/80 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-2.5 [&_code]:bg-muted/60 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
          "[&_hr]:border-border [&_hr]:my-4",
          "[&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child]:before:text-muted-foreground/45 [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:h-0",
          minHeight,
        ),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      // If editor only has empty paragraph, send empty string for cleaner validation
      if (html === "<p></p>") {
        onChange?.("");
      } else {
        onChange?.(html);
      }
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Compute character and word count
  const text = editor?.getText() || "";
  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div
      className={cn(
        "group/editor flex flex-col w-full rounded-lg border border-input bg-transparent text-sm transition-colors",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      {editable && <Toolbar editor={editor} />}

      <div className="flex-1 cursor-text" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      {editable && (
        <div className="flex items-center justify-between border-t border-border/50 px-3 py-1.5 text-[11px] text-muted-foreground/70 bg-muted/10 rounded-b-lg select-none">
          <span>Rich Text Mode (TipTap)</span>
          <div className="flex items-center gap-2">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{characterCount} characters</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Editor;
