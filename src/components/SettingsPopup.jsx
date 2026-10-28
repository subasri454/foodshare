import { useState } from "react";
import {
  FaCog,
  FaBell,
  FaLock,
  FaGlobe,
  FaMoon,
  FaTimes,
} from "react-icons/fa";

export default function SettingsPopup({ onClose }) {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      {/* SETTINGS CARD */}
      <div
        className="w-[520px] max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ================= HEADER ================= */}
        <div className="bg-[#064B3A] px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <FaCog className="text-white text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Settings
              </h2>

              <p className="text-sm text-green-200 mt-1">
                Manage your FoodShare preferences
              </p>
            </div>

          </div>

          {/* CLOSE */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
          >
            <FaTimes />
          </button>

        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-6 space-y-4 overflow-y-auto">

          {/* NOTIFICATIONS */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <FaBell className="text-green-700" />
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Notifications
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Receive app notifications
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition ${
                notifications
                  ? "bg-green-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition ${
                  notifications
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>

          </div>

          {/* EMAIL NOTIFICATIONS */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FaGlobe className="text-blue-600" />
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Email Notifications
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Receive updates through email
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setEmailNotifications(!emailNotifications)
              }
              className={`w-12 h-6 rounded-full transition ${
                emailNotifications
                  ? "bg-green-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition ${
                  emailNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>

          </div>

          {/* PRIVACY */}
          <button
            type="button"
            className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-left"
          >

            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <FaLock className="text-purple-600" />
            </div>

            <div>
              <p className="font-semibold text-gray-900">
                Privacy & Security
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Manage your account security
              </p>
            </div>

          </button>

          {/* DARK MODE */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <FaMoon className="text-gray-700" />
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Dark Mode
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Change the appearance
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition ${
                darkMode
                  ? "bg-green-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition ${
                  darkMode
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>

          </div>

        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-[#064B3A] text-white font-semibold hover:bg-[#075a40] transition"
          >
            Done
          </button>

        </div>

      </div>
    </div>
  );
}