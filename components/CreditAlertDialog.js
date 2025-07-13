// components/CreditAlertDialog.js
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

export default function CreditAlertDialog({ open, onClose }) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-w-md w-full -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6">
          <Dialog.Title className="text-xl font-semibold mb-2 text-center">
            🎉 Welcome!
          </Dialog.Title>
          <Dialog.Description className="text-gray-700 text-center mb-4">
            You’ve received <span className="font-bold">1000 free credits</span> to try out the app.
          </Dialog.Description>
          <div className="text-center">
            <Dialog.Close asChild>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Got it!
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
