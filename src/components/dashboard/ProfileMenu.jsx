import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronDown, LogOut, User, HelpCircle } from "lucide-react";

const MenuItem = ({ icon: Icon, label, onClick }) => (
  <motion.button
    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg
      hover:bg-[#2C8C7C]/10 text-[#2C8C7C] transition-colors group"
    onClick={onClick}
    whileHover={{ x: 4 }}
  >
    <Icon className="w-4 h-4 opacity-60 group-hover:opacity-100" />
    <span className="text-sm">{label}</span>
  </motion.button>
);

const ProfileMenu = ({ user }) => {
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { icon: User, label: "Profile", onClick: () => console.log("Profile") },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => console.log("Settings"),
    },
    { icon: HelpCircle, label: "Help", onClick: () => console.log("Help") },
    { icon: LogOut, label: "Sign Out", onClick: () => console.log("Sign Out") },
  ];

  return (
    <div className="relative">
      {/* Profile Button */}
      <motion.button
        className="p-1.5 rounded-xl hover:bg-[#2C8C7C]/10 transition-colors
          flex items-center gap-2"
        onClick={() => setShowMenu(!showMenu)}
      >
        {/* Profile Picture */}
        <div
          className="w-8 h-8 rounded-lg overflow-hidden 
          bg-[#2C8C7C]/5 backdrop-blur-sm border border-[#2C8C7C]/20
          flex items-center justify-center"
        >
          <img src="/favicon.svg" alt="Profile" className="w-5 h-5" />
        </div>

        {/* Arrow */}
        <motion.div
          animate={{ rotate: showMenu ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-[#2C8C7C]" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-56 rounded-xl
              bg-white/10 backdrop-blur-md border border-[#2C8C7C]/20
              overflow-hidden"
          >
            <div className="p-2">
              {menuItems.map((item) => (
                <MenuItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => {
                    setShowMenu(false);
                    item.onClick();
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;
