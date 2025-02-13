"use client";

import type { FC } from 'react';
import { Milkdown, useEditor } from '@milkdown/react';
import { emoji } from '@milkdown/plugin-emoji';
import { Crepe } from '@milkdown/crepe';
import { listenerCtx } from '@milkdown/kit/plugin/listener';
import { useEffect, useRef } from 'react';

interface MilkdownEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
}

export const MilkdownEditor: FC<MilkdownEditorProps> = ({ markdown, onChange }) => {
  const lastMarkdown = useRef(markdown);

  // Initialize the editor only once.
  const editor = useEditor(
    (root) => {
      const instance = new Crepe({
        root,
        defaultValue: markdown,
        features: {
          [Crepe.Feature.Latex]: false,
        },
      });
      // Initialize plugins and create the editor instance
      instance.editor.use(emoji);
      instance.create();
      return instance;
    },
    []
  );

  useEffect(() => {
    if (!editor) return;
    const instance = editor.get();
    if (!instance) return;
    
    // Listen for markdown updates.
    instance.ctx.get(listenerCtx).markdownUpdated((ctx, currentMarkdown) => {
      if (currentMarkdown !== lastMarkdown.current) {
        lastMarkdown.current = currentMarkdown;
        onChange(currentMarkdown);
        // Optionally, update a hidden input so the editor's content is sent on form submission.
        const hiddenInput = document.getElementById("markdownContent") as HTMLInputElement;
        if (hiddenInput) {
          hiddenInput.value = currentMarkdown;
        }
      }
    });
  }, [editor, onChange]);

  return <Milkdown />;
};

export default MilkdownEditor;
