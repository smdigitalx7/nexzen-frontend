import React, { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * GlobalProgress provides senior-grade visual feedback during navigation.
 * It uses the 'useNavigation' hook from React Router to detect when a new route
 * is being loaded (especially useful for slow 4G on lazy-loaded chunks).
 */
export const GlobalProgress: React.FC = () => {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const isLoading = navigation.state === "loading";

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setProgress(10); // Start with a small jump
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // Don't reach 100 until finished
          return prev + Math.random() * 5; // Random progressive movement
        });
      }, 200);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 400); // Reset after fade
      return () => clearTimeout(timeout);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none">
          <motion.div
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: `${progress}%`, opacity: 1 }}
            exit={{ width: "100%", opacity: 0 }}
            transition={{
              width: { type: "spring", stiffness: 100, damping: 20 },
              opacity: { duration: 0.2 },
            }}
            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalProgress;
