
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ReceiverSidebar from "../components/ReceiverSidebar";
import { useSettings } from "../context/SettingsContext";

export default function Layout() {
  const { settings } = useSettings();

  let user = {};

  try {
    user =
      JSON.parse(localStorage.getItem("foodshare_user") || "null") ||
      {};
  } catch {
    user = {};
  }

  const isReceiver =
    user?.role?.toLowerCase() === "receiver";

  return (
    <div
      className={`flex h-dvh min-h-0 w-full overflow-hidden transition-colors duration-300 ${
        settings.darkMode
          ? "bg-gray-900 text-gray-100"
          : "bg-[#f5f8f7] text-gray-800"
      }`}
    >
      {/* Sidebar: hidden space on mobile, fixed space on desktop */}
      <div className="relative z-30 h-full w-0 shrink-0 md:w-[280px]">
        {isReceiver ? <ReceiverSidebar /> : <Sidebar />}
      </div>

      {/* Main content */}
      <main
        className={`flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-colors duration-300 ${
          settings.darkMode
            ? "bg-gray-900 text-gray-100"
            : "bg-[#f5f8f7] text-gray-800"
        }`}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div className="min-h-full w-full min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
