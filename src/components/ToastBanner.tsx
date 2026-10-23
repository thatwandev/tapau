import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastBannerProps {
  message: string | null;
  messageKey?: string;
}

export default function ToastBanner({ message, messageKey }: ToastBannerProps) {
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!message || !messageKey) return;
    const timer = setTimeout(() => setDismissedKey(messageKey), 2800);
    return () => clearTimeout(timer);
  }, [message, messageKey]);

  const visible = Boolean(message && messageKey !== dismissedKey);

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          key={messageKey ?? message}
          className="fixed top-16 left-1/2 z-40 -translate-x-1/2 max-w-[90vw]"
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-felt-dark border border-felt-light/50 rounded-pill px-4 py-2 shadow-lg">
            <p className="font-body text-sm text-card text-center leading-snug max-w-[280px]">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
