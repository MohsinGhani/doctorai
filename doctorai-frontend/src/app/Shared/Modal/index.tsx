"use client";

// CommonModal.tsx
import React from "react";
import { Modal, Button } from "antd";

interface CommonModalProps {
  title: string;
  visible: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
  isAddOrUpdate?: boolean;
}

const CommonModal = ({
  title,
  visible,
  onOk,
  onCancel,
  children,
  isAddOrUpdate = false,
}: CommonModalProps) => {
  return (
    <Modal
      title={title}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      footer={
        isAddOrUpdate
          ? null
          : [
              <>
                <Button key="back" onClick={onCancel}>
                  Cancel
                </Button>
                <Button key="submit" type="primary" onClick={onOk}>
                  OK
                </Button>
                ,
              </>,
            ]
      }
    >
      {children}
    </Modal>
  );
};

export default CommonModal;
