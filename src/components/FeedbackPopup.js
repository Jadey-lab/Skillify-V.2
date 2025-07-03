
import { motion, AnimatePresence } from "framer-motion";

const FeedbackPopup = ({ message, visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-3 rounded-xl shadow-lg z-50 text-center font-semibold"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackPopup;
