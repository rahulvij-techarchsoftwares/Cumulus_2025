import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import { API_URL } from "../utils/Apiconfig";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/admin/admin/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setMessage(response.ok ? "✅ Admin created successfully!" : data.message || "❌ Signup failed");
    } catch (error) {
      setMessage("⚠️ An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-gradient-to-br from-gray-200 to-gray-400 shadow-xl rounded-xl p-10 w-full max-w-lg border border-gray-300">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Admin Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { name: "username", type: "text", placeholder: "Username", icon: <FaUser /> },
            { name: "email", type: "email", placeholder: "Email", icon: <FaEnvelope /> },
            { name: "password", type: "password", placeholder: "Password", icon: <FaLock /> },
            { name: "phoneNumber", type: "tel", placeholder: "Phone Number", icon: <FaPhone /> },
          ].map(({ name, type, placeholder, icon }) => (
            <div key={name} className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg">
                {icon}
              </span>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-400 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "⏳ Adding Admin..." : "🚀 Add Admin"}
          </button>
        </form>
        {message && (
          <p className="text-center mt-4 text-gray-800 text-lg font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
