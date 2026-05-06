import type { FC } from 'react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from 'app/state/language';
import type { UserProfile } from 'app/state/user';
import { AnyMedia, getKeyFor } from 'app/shared/ui';
import { isImage } from 'app/shared/lib/utilities'; // For basic file type check

import styles from './Chat.module.css';

interface ChatInputProps {
  orderId: number;
  contractorId: number;
  currentUser: UserProfile;
  onSendMessage: (
    orderId: number,
    contractorId: number,
    message: string,
    files: File[],
  ) => Promise<void>;
  isBlocked: boolean;
}

const MAX_FILE_SIZE_MB = 10; // Maximum allowed file size in MB
const MAX_FILE_COUNT = 5; // Maximum number of files per message

export const ChatInput: FC<ChatInputProps> = ({
  orderId,
  contractorId,
  currentUser,
  onSendMessage,
  isBlocked,
}) => {
  const text = useLanguage();
  const [message, setMessage] = useState('');
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isAttachmentMenuVisible, setIsAttachmentMenuVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lazy load EmojiPicker
  const EmojiPickerLazy = React.lazy(() => import('emoji-picker-react'));

  // Handler for text input
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Handler for emoji selection
  const addEmojiToMessage = useCallback((emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
  }, []);

  // Handler for file selection (from input)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => file.size / (1024 * 1024) <= MAX_FILE_SIZE_MB);
      const updatedFiles = [...previewFiles, ...validFiles].slice(0, MAX_FILE_COUNT);
      setPreviewFiles(updatedFiles);

      if (newFiles.length !== validFiles.length) {
        alert(text(`Some files were too large (max ${MAX_FILE_SIZE_MB}MB) and were not added.`));
      }
      if (updatedFiles.length < newFiles.length) {
        alert(text(`Only up to ${MAX_FILE_COUNT} files can be attached.`));
      }

      e.target.value = ''; // Clear input to allow re-selection of same files
      setIsAttachmentMenuVisible(false);
    }
  };

  // Handler for removing a file from preview
  const handleRemoveFile = useCallback((fileToRemove: File) => {
    setPreviewFiles((prev) => prev.filter((file) => file !== fileToRemove));
  }, []);

  // Handler for sending message
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && previewFiles.length === 0) return;

    try {
      await onSendMessage(orderId, contractorId, trimmedMessage, previewFiles);
      setMessage('');
      setPreviewFiles([]);
      setIsEmojiPickerVisible(false);
      setIsAttachmentMenuVisible(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset textarea height
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(text('Failed to send message. Please try again.'));
    }
  }, [message, previewFiles, onSendMessage, orderId, contractorId, text]);

  // Handler for Ctrl+Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseFloat(getComputedStyle(textareaRef.current).lineHeight);
      const maxRows = 4; // Max 4 lines
      const maxHeight = lineHeight * maxRows;
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [message]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBlocked) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, [isBlocked]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBlocked) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles = newFiles.filter(file => file.size / (1024 * 1024) <= MAX_FILE_SIZE_MB);
      const updatedFiles = [...previewFiles, ...validFiles].slice(0, MAX_FILE_COUNT);
      setPreviewFiles(updatedFiles);

      if (newFiles.length !== validFiles.length) {
        alert(text(`Some files were too large (max ${MAX_FILE_SIZE_MB}MB) and were not added.`));
      }
      if (updatedFiles.length < newFiles.length) {
        alert(text(`Only up to ${MAX_FILE_COUNT} files can be attached.`));
      }
    }
  }, [isBlocked, previewFiles, text]);

  // TODO: Implement audio recording logic later

  // Position emoji picker dynamically if needed, similar to Kirill.tsx
  // todo: проверить эту логику
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const measureFooter = () => {
      setFooterHeight(footerRef.current?.offsetHeight || 0);
    };
    measureFooter();
    window.addEventListener('resize', measureFooter);
    return () => window.removeEventListener('resize', measureFooter);
  }, []);

  // For visual consistency, using a placeholder for the actual emoji picker component
  const EmojiPickerPlaceholder = () => (
    <div style={{ padding: '10px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '8px' }}>
      {text('Emoji picker will be here')}
    </div>
  );

  return (
    <div className={styles.chat_input_area} ref={footerRef} onDragOver={handleDragOver} onDrop={handleDrop}>
      {/* File previews */}
      {previewFiles.length > 0 && (
        <div className={styles.file_preview_container}>
          {previewFiles.map((file) => (
            <div key={getKeyFor(file)} className={styles.file_preview_item}>
              <button
                type="button"
                className={styles.remove_file_button}
                onClick={() => handleRemoveFile(file)}
                title={text('Remove')}
              >
                ✕
              </button>
              {isImage(file.type) ? (
                <AnyMedia
                  src={file}
                  mediaType='image'
                  imageProps={{ alt: file.name }}
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
              ) : (
                <div className={styles.non_image_preview}>
                  <img src="/img/icons/file.png" alt="file icon" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className={styles.input_row}>
        {/* Attachment menu */}
        {isAttachmentMenuVisible && (
            <div className={styles.attachment_menu} style={{ bottom: footerHeight + 20 }}>
                <label className={styles.attachment_option}>
                    <img src="/img/chat_img/img.png" alt="" />
                    <span>{text('Photo or video')}</span>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className={styles.hidden_file_input}
                        onChange={handleFileChange}
                    />
                </label>
                <label className={styles.attachment_option}>
                    <img src="/img/chat_img/folder.png" alt="" />
                    <span>{text('Document')}</span>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.csv,application/*,text/*"
                        multiple
                        className={styles.hidden_file_input}
                        onChange={handleFileChange}
                    />
                </label>
            </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className={styles.message_textarea}
          placeholder={text('Enter a message...')}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isBlocked}
        />

        {/* Action buttons */}
        <div className={styles.input_actions}>
          <button
            type="button"
            className={styles.action_button}
            onClick={() => setIsAttachmentMenuVisible((prev) => !prev)}
            title={text('Attach file')}
            disabled={isBlocked || previewFiles.length >= MAX_FILE_COUNT}
          >
            <img src="/img/chat_img/clip.png" alt="Attach" />
          </button>
          <button
            type="button"
            className={styles.action_button}
            onClick={() => console.log('Audio recording started/stopped')} // TODO: Implement audio
            title={text('Record voice message')}
            disabled={isBlocked}
          >
            <img src="/img/icons/micro.png" alt="Mic" />
          </button>
          <div className={styles.emoji_picker_wrap}>
            {isEmojiPickerVisible && (
              <div className={styles.emoji_picker_container} style={{ bottom: footerHeight + 20 }}>
                <React.Suspense fallback={<div className="emoji-loading">{text('Loading Emojis...')}</div>}>
                  <EmojiPickerLazy onEmojiClick={addEmojiToMessage} />
                </React.Suspense>
              </div>
            )}
            <button
              type="button"
              className={styles.action_button}
              onClick={() => setIsEmojiPickerVisible((prev) => !prev)}
              title={text('Open emoji picker')}
              disabled={isBlocked}
            >
              <img src="/img/chat_img/emoji.png" alt="Emoji" />
            </button>
          </div>
          <button
            type="button"
            className={`${styles.action_button} ${styles.send_button}`}
            onClick={handleSendMessage}
            title={text('Send message')}
            disabled={isBlocked || (!message.trim() && previewFiles.length === 0)}
          >
            <img src="/img/chat_img/plane.png" alt="Send" />
          </button>
        </div>
      </div>
       {isBlocked && (
        <div className={styles.blocked_message_overlay}>
          <img src="/img/icons/chat_block.png" alt="" />
          <p>{text('You cannot contact this user because you have blocked them or they have blocked you.')}</p>
        </div>
      )}
    </div>
  );
};
