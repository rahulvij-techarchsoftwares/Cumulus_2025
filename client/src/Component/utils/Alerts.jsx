import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Alert = ({ variant, title, message, showLink = false, linkHref = "#", linkText = "Learn more", onClose }) => {
  if (!title || !message) return null;

  const variantClasses = {
    success: {
      container: "border-green-500 bg-green-50 text-green-800",
      icon: "text-green-500",
      symbol: "✅",
    },
    error: {
      container: "border-red-500 bg-red-50 text-red-800",
      icon: "text-red-500",
      symbol: "❌",
    },
    warning: {
      container: "border-yellow-500 bg-yellow-50 text-yellow-800",
      icon: "text-yellow-500",
      symbol: "⚠️",
    },
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`fixed bottom-4 right-4 w-80 p-4 rounded-lg shadow-lg border-l-4 z-50 ${variantClasses[variant]?.container}`}
    >
      <div className="flex items-start">
        <span className={`mr-3 text-xl ${variantClasses[variant]?.icon}`}>{variantClasses[variant]?.symbol}</span>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm">{message}</p>
          {showLink && (
            <Link to={linkHref} className="text-blue-600 underline">
              {linkText}
            </Link>
          )}
        </div>
        <button
          className="ml-auto text-gray-500 hover:text-gray-700"
          onClick={onClose} // Manually close alert
        >
          ✖
        </button>
      </div>
    </motion.div>
  );
};

export default Alert;
