import React from 'react';
import { simpleMarkdown } from 'app/shared/lib/markdown';
import { formatDateTime } from 'app/shared/lib/formatDate';
import { useLanguage } from 'app/state/language';
import { MessageType, MessageFormat, Message } from 'app/state/chat';
import { getFileById } from 'app/state/uploaded';
import { AnyMedia } from 'app/shared/ui';
import { isImage } from 'app/shared/lib/utilities';

import styles from './Chat.module.css';
import downloadIcon from 'app/img/download.svg';

const downloadFile = async (file: number | File, fileName: string) => {
  try {
    let objectUrl = '';
    if ('number' === typeof file) {
      const result = await getFileById(file);
      if (!result) return;
      objectUrl = window.URL.createObjectURL(result.blob);
      fileName ||= result.filename;
    }
    else {
      objectUrl = window.URL.createObjectURL(file);
      fileName ||= file.name;
    }
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  }
  catch(error) {
    console.error('Ошибка при скачивании файла:', error);
  }
};


interface ChatMessageProps {
  message: Message;
  currentUserId: number;
  isBlacklisted?: boolean;
  authorName?: string;
  authorAvatar?: string;
  relatedMessage?: Message;
  scrollToMessage: (id: number) => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ChatMessage({
  message,
  currentUserId,
  isBlacklisted,
  authorAvatar,
  authorName,
  relatedMessage,
  scrollToMessage,
  onReply,
  onEdit,
  onDelete
}: ChatMessageProps) {
  const text = useLanguage();

  const isOwnMessage = ((message.type === MessageType.User || message.type === MessageType.Dispute) && message.from === currentUserId);
  const isSystemMessage = message.type === MessageType.System;
  const isAdministratorMessage = message.type === MessageType.Admin;
  const isTextMessage = message.format === MessageFormat.Text;
  const isAudioMessage = message.format === MessageFormat.Audio;
  const isFile = message.format === MessageFormat.File;
  const isInlineFile = isFile && (isImage(message.mediaType) || message.mediaType.startsWith('video/') || message.mediaType.startsWith('audio/'));
  const isAttachment = isFile && !isInlineFile;

  const avatarSrc = authorAvatar || '/img/user_avatar.png';
  const displayName = authorName || (isAdministratorMessage ? text('Administrator') : text('Unknown user'));

  const messageTime = message.modified
    ? message.modified.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : message.delivered
    ? message.delivered.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const messageContainerStyle = isOwnMessage ? styles.align_right : isSystemMessage ? styles.align_center : styles.align_left;
  const messageBubbleStyle = isOwnMessage ? styles.own_message : isAdministratorMessage ? styles.admin_message : styles.partner_message;

  return (
    <div
      className={`${styles.chat_message_container} ${messageContainerStyle}`}
      data-message={message.id}
    >
      {isSystemMessage ?
        <div className={styles.system_message_content}>
          <img src="/img/chat_img/span.png" alt="info" />
          <p>{message.text}</p>
          <span>{messageTime}</span>
        </div>
      :
        <div className={`${styles.message_bubble} ${messageBubbleStyle}`}>
          {!isOwnMessage && (
            <div className={styles.message_avatar}>
              <img src={avatarSrc} alt={displayName} />
            </div>
          )}
          <div className={styles.message_bubble_content}>
            <div className={styles.message_actions}>
              {!isBlacklisted && <button type="button" onClick={onReply}>{text('Reply')}</button>}
              {isOwnMessage && !isBlacklisted && message.isEditable && <button type="button" onClick={onEdit}>{text('Edit')}</button>}
              {isOwnMessage && !isBlacklisted && message.isDeletable && <button type="button" onClick={onDelete}>{text('Delete')}</button>}
            </div>
            {!isOwnMessage && (
              <div className={styles.message_author_info}>
                <span className={isAdministratorMessage ? styles.author_name_admin : styles.author_name}>{displayName}</span>
                {!!message.modified && <span className={isAdministratorMessage ? styles.modified_indicator_admin : styles.modified_indicator}>{text('modified at')}</span>}
                <span className={isAdministratorMessage ? styles.timestamp_admin : styles.timestamp}>{messageTime}</span>
              </div>
            )}
            {isOwnMessage && (
              <div className={styles.message_author_info_own}>
                {!!message.modified && <span className={styles.modified_indicator_own}>{text('modified at')}</span>}
                <span className={styles.timestamp_own}>{messageTime}</span>
                <span className={styles.author_name_own}>{text('You')}</span>
              </div>
            )}
            {relatedMessage &&
              <button type="button" className={styles.quoted_message} onClick={() => {scrollToMessage(relatedMessage.id)}}>{
                relatedMessage.format === MessageFormat.Text ? simpleMarkdown(relatedMessage.text, true) :
                relatedMessage.format === MessageFormat.Audio ? text('Audio') :
                simpleMarkdown(relatedMessage.caption || text('Attachment'), true)
              }</button>}
            {isTextMessage && <div className={styles.message_text}>{simpleMarkdown(message.text)}</div>}
            {isInlineFile && <div className={styles.message_media}><AnyMedia src={message.file} /><span>{simpleMarkdown(message.caption)}</span></div>}
            {isAttachment &&
              <div className={styles.message_attachment}>
                <div className={styles.download_properties}>
                  <div className={styles.download_icon} title={text('Download file')} onClick={() => downloadFile(message.file, message.fileName)}>
                    <img src={downloadIcon} alt={text('Download file')} />
                  </div>
                  <div>
                    <p title={text('File name')}>{message.fileName}</p>
                    <p title={text('File size')}>{message.fileSize} {text('bytes')}</p>
                  </div>
                </div>
                <div className={styles.download_caption}>{simpleMarkdown(message.caption)}</div>
              </div>
            }
            {isAudioMessage && <AnyMedia className={styles.message_audio} src={message.audio} mediaType="audio" />}
            {isOwnMessage && (
              message.isError ?
                <span className={styles.read_status}
                  title={text('Send message failed.') + (message.error ? ` ${text(message.error)}` : '')}
                >
                  <img width="24" height="24" src="/img/error.png" alt={text('Error')} />
                </span>
              :
              message.delivered ?
                <span className={styles.read_status}
                  title={message.partnerRead ? `${text('Прочитано')} ${formatDateTime(message.partnerRead)}` : ''}
                >
                  {message.partnerRead ? '✓✓' : '✓'}
                </span>
              : ''
            )}
          </div>
        </div>
      }
    </div>
  );
};
