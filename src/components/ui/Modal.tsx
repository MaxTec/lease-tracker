"use client";

import {
  Dialog,
  DialogTitle,
  DialogPanel
} from "@headlessui/react";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
        <DialogPanel className="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div className="p-6">
            <DialogTitle className="text-lg font-medium text-gray-900">
              {title}
            </DialogTitle>
            <div className="mt-2">{children}</div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
