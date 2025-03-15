import React, { useState } from "react";
import logo from "../../assets/logo.png";
import Cookies from "js-cookie";
import { ChevronDown, Eye, LogOut, Menu, X } from "lucide-react";
import { Navigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion
import { API_URL } from "./utiles/ApiConfig";
import { useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();
  const [landing, setLanding] = useState(false);
  const [mainweb, setMainweb] = useState(false);
  const [isClicked, setIsClicked] = useState(null);
  const [sidebar, setSidebar] = useState(false);

  const handleClick = (buttonId) => {
    setIsClicked(buttonId);
  };

     const logout = async () => {

      
      console.log("clickedddd")
      try {
        const token = localStorage.getItem("token");
  
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }
  
        const apiUrl = `${API_URL}/api/auth/signout`;
  
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
  
        const response = await fetch(apiUrl, { method: "POST", headers });
  
        if (!response.ok) {
          throw new Error("Failed to log out. Please try again.");
        }
  
        // Clear token from localStorage
        localStorage.removeItem("token");
        // localStorage.removeItem("googleDriveToken");
        // localStorage.removeItem("dropboxToken");
        // Clear cookies if used
        Cookies.remove("token");
  
        // Prevent cached pages from being accessed
        window.history.pushState(null, null, window.location.href);
        window.addEventListener("popstate", () => {
          window.history.pushState(null, null, window.location.href);
        });
  
        // Redirect to the login page
        navigate("/Login"); 
      } catch (error) {
        console.error(error);
        // Navigate("/Login");
      }
    }

  return (
    <>
     
      <div className="hidden md:flex flex-col w-64 min-h-screen bg-gray-100 p-3 justify-between">
        <div>
          <div className="mb-2 w-full">
            <img src={logo} alt="Cumulus Logo" className="w-full h-9 object-fit" />
          </div>

          
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-gray-700 my-2 text-md">Landing Page</h1>
            <button onClick={() => {
              setLanding(!landing)
              setMainweb(null);
            }
            }>
              <ChevronDown />
            </button>
          </div>

          <div className={`bg-white rounded transition-all duration-300 ${landing ? "block" : "hidden"}`}>
            <NavLink to="/admin/faq">
              <p
                onClick={() => handleClick("btn1")}
                className={`text-sm text-gray-500 ${isClicked === "btn1" ? "bg-blue-500 rounded text-white" : ""} p-3 font-semibold cursor-pointer`}
              >
                FAQ's
              </p>
            </NavLink>
          </div>

          
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-gray-700 my-2 text-md">Web Application</h1>
            <button onClick={() => {
              setMainweb(!mainweb)
              setLanding(null);
            }
            }>
              <ChevronDown />
            </button>
          </div>

          <div className={`bg-white rounded transition-all duration-300 ${mainweb ? "block" : "hidden"}`}>
            <NavLink to="/admin/SecurityQuestion">
              <p
                onClick={() => handleClick("btn2")}
                className={`text-sm text-gray-500 ${isClicked === "btn2" ? "bg-blue-500 rounded text-white" : ""} p-3 font-semibold cursor-pointer`}
              >
                Security Questions
              </p>
            </NavLink>
            <NavLink to="/admin/CumulusDefault">
              <p
                onClick={() => handleClick("btn3")}
                className={`text-sm text-gray-500 ${isClicked === "btn3" ? "bg-blue-500 rounded text-white" : ""} p-3 font-semibold cursor-pointer`}
              >
                Default files
              </p>
            </NavLink>
            <NavLink to="/admin/ManageUsers">
              <p
                onClick={() => handleClick("btn4")}
                className={`text-sm text-gray-500 ${isClicked === "btn4" ? "bg-blue-500 rounded text-white" : ""} p-3 font-semibold cursor-pointer`}
              >
                User Management
              </p>
            </NavLink>
          </div>
        </div>

        <div className="flex items-start p-1 flex-col justify-between">
          <button></button>
          <button 
          onClick={() => logout()}
          className="flex p-2 rounded"><LogOut className="mr-2 h-5 w-5 mt-1" />Logout</button>
        </div>
      </div>

      
      <div className="inline md:hidden z-50 fixed top-0 left-0">
        {!sidebar && (
          <button onClick={() => setSidebar(true)}>
            <Menu className="m-2" />
          </button>
        )}

     
        {sidebar && (
          <>
            
            <div
              className="fixed inset-0 bg-black opacity-30 z-40"
              onClick={() => setSidebar(false)}
            ></div>

            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-full w-64 bg-gray-100 p-3 shadow-lg z-50"
            >
              
              <div className="mb-2 flex w-full justify-between items-center">
                <img src={logo} alt="Cumulus Logo" className="h-9" />
                {/* <button onClick={() => setSidebar(false)}>
                  <X />
                </button> */}
              </div>

              
              <div className="flex justify-between items-center">
                <h1 className="font-bold text-gray-700 my-2 text-md">Landing Page</h1>
                <button onClick={() => {
                  setLanding(!landing)
                  setMainweb(null);
                }}>
                  <ChevronDown />
                </button>
              </div>

              <div className={`bg-white rounded transition-all duration-300 ${landing ? "block" : "hidden"}`}>
                <NavLink to="/admin/faq">
                  <p
                    onClick={() => {
                      setSidebar(false);
                      handleClick("btn1");
                    }}
                    className={`text-sm text-gray-500 ${isClicked === "btn1" ? "bg-blue-500 rounded text-white" : ""} p-3 font-semibold cursor-pointer`}
                  >
                    FAQ's
                  </p>
                </NavLink>
              </div>

              
              <div className="flex justify-between items-center">
                <h1 className="font-bold text-gray-700 my-2 text-md">Web Application</h1>
                <button onClick={() => {
                  setLanding(null)
                  setMainweb(!mainweb)}
                }>
                  <ChevronDown />
                </button>
              </div>

              <div className={`bg-white rounded transition-all duration-300 ${mainweb ? "block" : "hidden"}`}>
                <NavLink to="/admin/SecurityQuestion">
                  <p
                    onClick={() => {
                      setSidebar(false);
                      handleClick("btn2");
                    }}
                    className={`text-sm text-gray-500 ${isClicked === "btn2" ? "bg-blue-500 rounded text-white" : ""} p-3 font-semibold cursor-pointer`}
                  >
                    Security Questions
                  </p>
                </NavLink>
                <NavLink to="/admin/CumulusDefault">
                  <p
                    onClick={() => {
                      setSidebar(false);
                      handleClick("btn3");
                    }}
                    className={`text-sm text-gray-500 ${isClicked === "btn3" ? "bg-blue-500 rounded text-white" : ""} p-3 font-semibold cursor-pointer`}
                  >
                    Default files
                  </p>
                </NavLink>
                <NavLink to="/admin/ManageUsers">
                  <p
                    onClick={() => {
                      setSidebar(false);
                      handleClick("btn4");
                    }}
                    className={`text-sm text-gray-500 ${isClicked === "btn4" ? "bg-blue-500 rounded text-white" : ""} p-3 font-semibold cursor-pointer`}
                  >
                    User Management
                  </p>
                </NavLink>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </>
  );
}

export default Sidebar;
