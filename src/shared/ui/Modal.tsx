import React from 'react';
import { Modal as RsuiteModal } from 'rsuite';
import 'rsuite/Modal/styles/index.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
  backdrop?: boolean | 'static';
  className?: string;
  contentClassName?: string;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  size = 'sm',
  backdrop = true,
  className,
  contentClassName,
  title,
  footer,
  closeButton = true,
}) => {
  return (
    <RsuiteModal
      open={open}
      onClose={onClose}
      size={size}
      backdrop={backdrop}
      keyboard={true}
      className={className}
    >
      {(title || closeButton) && (
        <RsuiteModal.Header closeButton={closeButton}>
          {title && <RsuiteModal.Title>{title}</RsuiteModal.Title>}
        </RsuiteModal.Header>
      )}
      
      <RsuiteModal.Body className={contentClassName}>
        {children}
      </RsuiteModal.Body>
      
      {footer && (
        <RsuiteModal.Footer>
          {footer}
        </RsuiteModal.Footer>
      )}
    </RsuiteModal>
  );
};

export default Modal;
