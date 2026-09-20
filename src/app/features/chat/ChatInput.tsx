import type { FC } from 'react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from 'app/state/language';
import { UserProfile, UserRole, useUsersByIds } from 'app/state/user';
import { MessageFormat, useMessagesByIds } from 'app/state/chat';
import { AnyMedia, getKeyFor, Emoji } from 'app/shared/ui';
import { simpleMarkdown } from 'app/shared/lib/markdown';
import { isImage } from 'app/shared/lib/utilities';
import { AudioRecorder } from './AudioRecorder';

import styles from './Chat.module.css';

interface ChatInputProps {
  orderId: number;
  clientId: number;
  contractorId: number;
  currentUser: UserProfile;
  onSendMessage: (
    orderId: number,
    contractorId: number,
    message: string,
    files: File[],
    replyToMessage?: number,
  ) => Promise<void>;
  onSendAudio: (
    orderId: number,
    contractorId: number,
    audio: File,
    replyToMessage?: number,
  ) => Promise<void>;
  isBusy: boolean;
  replyTo?: number;
  onCancelReply: () => void;
}

const MAX_FILE_SIZE_MB = 50; // Maximum allowed file size in MB
const MAX_FILE_COUNT = 5; // Maximum number of files per message

const AttachIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 1 1-2.8-2.8l8.9-8.9" />
  </svg>
);

const MicrophoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="9" y="2" width="6" height="13" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
  </svg>
);

const EmojiIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22 2 11 13" />
    <path d="m22 2-7 20-4-9-9-4Z" />
  </svg>
);

export const ChatInput: FC<ChatInputProps> = ({
  orderId,
  clientId,
  contractorId,
  currentUser,
  onSendMessage,
  onSendAudio,
  isBusy,
  replyTo,
  onCancelReply,
}) => {
  const text = useLanguage();
  const [message, setMessage] = useState('');
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioFile, setAudioFile] = useState<File|null>(null);
  const [audioObjectURL, setAudioObjectURL] = useState<string>('');
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isAttachmentMenuVisible, setIsAttachmentMenuVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const partnerId = currentUser.role === UserRole.Contractor ? contractorId : clientId;
  const { users } = useUsersByIds(partnerId ? [partnerId] : []);
  const chatPartner = users[0];

  const { messages } = useMessagesByIds(replyTo ? [replyTo] : []);
  const replyToMessage = messages[0];

  // Проверяем, заблокировал ли текущий пользователь собеседника или наоборот.
  const currentUserBlockedPartner = currentUser.blackList?.includes(chatPartner?.id);
  const partnerBlockedCurrentUser = chatPartner?.blackList?.includes(currentUser.id);
  const isBlocked = currentUserBlockedPartner || partnerBlockedCurrentUser;

  // Adjust textarea height dynamically
  const updateMessage = (message: string) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      textareaRef.current.value = message;
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseFloat(getComputedStyle(textareaRef.current).lineHeight);
      const maxRows = 8; // Max 8 lines
      const maxHeight = Math.round(lineHeight * maxRows + 20);
      const borderHeight = textareaRef.current.offsetHeight - textareaRef.current.clientHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + borderHeight + 'px';
    }
    setMessage(message);
  };

  // Handler for text input
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateMessage(e.target.value);
  };

  const handleAudioFile = (audio: File | null) => {
    if (audioObjectURL) window.URL.revokeObjectURL(audioObjectURL);
    setAudioFile(audio);
    if (audio) setAudioObjectURL(window.URL.createObjectURL(audio));
    else setAudioObjectURL('');
  };

  // Handler for emoji selection
  const addEmojiToMessage = (emoji: string) => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const strPre = el.value.substring(0, start);
      const strPost = el.value.substring(end);
      if (strPre && strPre.slice(-1) !== ' ') emoji = ` ${emoji}`;
      if (strPost && strPost.substring(0, 1) !== ' ') emoji = `${emoji} `;
      updateMessage(strPre + emoji + strPost);
      el.selectionStart = el.selectionEnd = start + emoji.length;
      el.focus();
    }
    else {
      updateMessage(message + emoji);
    }
  };

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
  const handleRemoveFile = (fileToRemove: File) => {
    setPreviewFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  // Handler for sending message
  const handleSendMessage = async () => {
    try {
      if (audioFile) {
        await onSendAudio(orderId, contractorId, audioFile, replyTo);
        handleAudioFile(null);
      }
      else {
        const trimmedMessage = message.trim();
        if (!trimmedMessage && previewFiles.length === 0) return;

        await onSendMessage(orderId, contractorId, trimmedMessage, previewFiles, replyTo);
        updateMessage('');
        setPreviewFiles([]);
        setIsEmojiPickerVisible(false);
        setIsAttachmentMenuVisible(false);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'; // Reset textarea height
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(text('Failed to send message. Please try again.'));
    }
  };

  // Handler for Ctrl+Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isBusy) handleSendMessage();
    }
  };

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

  // todo: проверить эту логику. Лучше использовать CSS здесь
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const measureFooter = () => {
      setFooterHeight(footerRef.current?.offsetHeight || 0);
    };
    measureFooter();
    window.addEventListener('resize', measureFooter);
    return () => {
      window.removeEventListener('resize', measureFooter);
      if (audioObjectURL) {
        window.URL.revokeObjectURL(audioObjectURL);
      }
    }
  }, []);

  return (
    <div className={styles.chat_input_area} ref={footerRef} onDragOver={handleDragOver} onDrop={handleDrop}>
      {replyToMessage && (
        <div className={styles.reply_preview}>
          <div>
            <strong>{text('Reply')}</strong>
            <span>{
              replyToMessage.format === MessageFormat.Text ? simpleMarkdown(replyToMessage.text, true) :
              replyToMessage.format === MessageFormat.Audio ? text('Audio') :
              simpleMarkdown(replyToMessage.caption || text('Attachment'), true)
            }</span>
          </div>
          <button type="button" onClick={onCancelReply}>×</button>
        </div>
      )}
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

        {
          // Audio player
          (isRecording || audioFile) &&
          <div className={styles.message_voiceinput}>
            <audio src={isRecording ? '' : audioObjectURL} controls />
            <button
              type="button"
              disabled={isRecording}
              title={text('Clear voice message')}
              onClick={() => handleAudioFile(null)}
            >×</button>
          </div>
        }

        {/* Textarea */}
        {/* Не удаляем элемент из DOM, чтобы не терять размер и содержимое. */}
        <textarea
          ref={textareaRef}
          className={styles.message_textarea}
          style={isRecording || audioFile ? {display: 'none'} : undefined}
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
            <AttachIcon />
          </button>
          <AudioRecorder
            className={styles.action_button}
            disabled={isBlocked}
            MicrophoneIcon={MicrophoneIcon}
            onStartRecording={() => setIsRecording(true)}
            onFinishRecording={() => setIsRecording(false)}
            setAudioFile={handleAudioFile}
          />
          <div className={styles.emoji_picker_wrap}>
            {isEmojiPickerVisible && (
              <div className={styles.emoji_picker_container} style={{ bottom: footerHeight + 20 }}>
                <Emoji onSelect={addEmojiToMessage} />
              </div>
            )}
            <button
              type="button"
              className={styles.action_button}
              onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
              title={text(isEmojiPickerVisible ? 'Close emoji picker' : 'Open emoji picker')}
              disabled={isBlocked}
            >
              <EmojiIcon />
            </button>
          </div>
          <button
            type="button"
            className={`${styles.action_button} ${styles.send_button}`}
            onClick={handleSendMessage}
            title={text('Send message')}
            disabled={isBusy || isBlocked || isRecording || (!message.trim() && previewFiles.length === 0 && !audioFile)}
          >
            <SendIcon />
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
