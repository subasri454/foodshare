
import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaBoxOpen,
  FaUsers,
  FaTruck,
  FaComments,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaCamera,
} from "react-icons/fa";

import { HandHeart } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, updateSetting, t } = useSettings();

  /* =========================================
     PROFILE
     ========================================= */

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const fileInputRef = useRef(null);

  const darkMode = settings.darkMode;
  const language = settings.language;

  /* =========================================
     GET USER
     ========================================= */

  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("foodshare_user") || "null"
    ) || {};
  } catch {
    user = {};
  }

  const [profile, setProfile] = useState({
    name: user.name || "User",
    email: user.email || "user@example.com",
    location: user.location || "Chennai, Tamil Nadu",
  });

  /* =========================================
     DONOR MENU
     ========================================= */

  const menuItems = [
    {
      name: "Home",
      path: "/donor-dashboard",
      icon: <FaHome />,
    },
    {
      name: "My Donations",
      path: "/my-donations",
      icon: <FaBoxOpen />,
    },
    {
      name: "Requests",
      path: "/requests",
      icon: <FaUsers />,
    },
    {
      name: "Pickups",
      path: "/pickups",
      icon: <FaTruck />,
    },
    {
      name: "Chat",
      path: "/chat",
      icon: <FaComments />,
    },
  ];

  /* =========================================
     CLOSE MENUS
     ========================================= */

  const closeMenus = () => {
    setShowProfileMenu(false);
    setShowProfilePage(false);
  };

  /* =========================================
     LOGOUT
     ========================================= */

 
const handleLogout = () => {
  localStorage.removeItem("foodshare_token");
  localStorage.removeItem("foodshare_user");
  localStorage.removeItem("userRole");

  // Notify SettingsContext that the logged-in user changed.
  window.dispatchEvent(new Event("foodshare-user-changed"));

  closeMenus();
  navigate("/login");
};


  /* =========================================
     PROFILE IMAGE
     ========================================= */

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  /* =========================================
     THEME CLASSES
     ========================================= */

  const popupBackground = darkMode
    ? "bg-gray-800 text-gray-100"
    : "bg-white text-gray-800";

  const popupBorder = darkMode
    ? "border-gray-700"
    : "border-gray-100";

  const popupText = darkMode
    ? "text-gray-200"
    : "text-gray-700";

  const mutedText = darkMode
    ? "text-gray-400"
    : "text-gray-500";

  const inputStyle = `
    w-full rounded-xl border px-4 py-3 outline-none
    focus:border-[#064B3A]
    ${
      darkMode
        ? "border-gray-600 bg-gray-700 text-white"
        : "border-gray-200 bg-white text-gray-800"
    }
  `;

  return (
    <>
      {/* =====================================
          SIDEBAR
         ===================================== */}

      <aside
        className="
          fixed
          left-0
          top-0
          z-[900]
          flex
          h-screen
          w-[280px]
          flex-col
          bg-[#064B3A]
          text-white
          shadow-xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            h-[80px]
            items-center
            border-b
            border-white/10
            px-5
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-white/10
              "
            >
              <HandHeart size={22} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-lg font-bold">
                FoodShare
              </h1>

              <p className="text-xs text-green-100/70">
                Share Food, Share Love
              </p>
            </div>
          </div>
        </div>

        {/* MENU */}

        <nav
          className="
            flex-1
            space-y-2
            overflow-y-auto
            px-3
            py-5
          "
        >
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowProfilePage(false);
                }}
                className={`
                  flex
                  items-center
                  gap-4
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-white text-[#064B3A] shadow-sm"
                      : "text-green-50 hover:bg-white/10"
                  }
                `}
              >
                <span
                  className="
                    flex
                    w-5
                    items-center
                    justify-center
                    text-lg
                  "
                >
                  {item.icon}
                </span>

                <span>{t(item.name)}</span>
              </Link>
            );
          })}
        </nav>

        {/* PROFILE AREA */}

        <div className="relative border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu((previous) => !previous);
            }}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              p-3
              text-left
              transition
              hover:bg-white/10
            "
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white/15
                "
              >
                <FaUser />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {profile.name}
              </p>

              <p className="text-xs text-green-100/70">
                {t("Donor")}
              </p>
            </div>

            <span className="text-lg text-green-100/60">
              ⋮
            </span>
          </button>

          {/* PROFILE MENU */}

          {showProfileMenu && (
            <div
              className={`
                absolute
                bottom-[75px]
                left-3
                right-3
                z-[1000]
                overflow-hidden
                rounded-2xl
                shadow-2xl
                ${popupBackground}
              `}
            >
              <div className={`border-b px-4 py-4 ${popupBorder}`}>
                <div className="flex items-center gap-3">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-[#064B3A]
                        text-white
                      "
                    >
                      <FaUser />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {profile.name}
                    </p>

                    <p className={`truncate text-xs ${mutedText}`}>
                      {profile.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* PROFILE */}

              <button
                type="button"
                onClick={() => {
                  setShowProfilePage(true);
                  setShowProfileMenu(false);
                }}
                className={`
                  flex w-full items-center gap-3 px-4 py-3
                  text-left text-sm transition
                  ${
                    darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                <FaUser />
                <span>{t("Profile")}</span>
              </button>

              {/* SETTINGS */}

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/settings");
                }}
                className={`
                  flex w-full items-center gap-3 px-4 py-3
                  text-left text-sm transition
                  ${
                    darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                <FaCog />
                <span>{t("Settings")}</span>
              </button>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className={`
                  flex w-full items-center gap-3 border-t
                  px-4 py-3 text-left text-sm text-red-500
                  transition
                  ${popupBorder}
                  ${
                    darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-red-50"
                  }
                `}
              >
                <FaSignOutAlt />
                <span>{t("Logout")}</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =====================================
          PROFILE PAGE
         ===================================== */}

      {showProfilePage && (
        <div
          className="
            fixed
            inset-0
            z-[1100]
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowProfilePage(false);
            }
          }}
        >
          <div
            className={`
              w-full max-w-lg rounded-2xl shadow-2xl
              ${popupBackground}
            `}
          >
            <div
              className={`
                flex items-center justify-between
                border-b px-6 py-5 ${popupBorder}
              `}
            >
              <h2 className="text-xl font-bold text-[#16845D]">
                {t("My Profile")}
              </h2>

              <button
                type="button"
                onClick={() => setShowProfilePage(false)}
                className={`text-2xl ${mutedText}`}
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* PHOTO */}

              <div className="flex flex-col items-center">
                <div className="relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex h-24 w-24 items-center justify-center
                        rounded-full bg-[#064B3A] text-3xl text-white
                      "
                    >
                      <FaUser />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="
                      absolute bottom-0 right-0 flex h-9 w-9
                      items-center justify-center rounded-full
                      bg-[#064B3A] text-white shadow
                    "
                  >
                    <FaCamera />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </div>

              {/* NAME */}

              <div>
                <label className={`mb-1 block text-sm font-medium ${popupText}`}>
                  {t("Name")}
                </label>

                <input
                  type="text"
                  value={profile.name}
                  disabled={!isEditingProfile}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      name: event.target.value,
                    })
                  }
                  className={inputStyle}
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className={`mb-1 block text-sm font-medium ${popupText}`}>
                  {t("Email")}
                </label>

                <input
                  type="email"
                  value={profile.email}
                  disabled={!isEditingProfile}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      email: event.target.value,
                    })
                  }
                  className={inputStyle}
                />
              </div>

              {/* LOCATION */}

              <div>
                <label className={`mb-1 block text-sm font-medium ${popupText}`}>
                  {t("Location")}
                </label>

                <input
                  type="text"
                  value={profile.location}
                  disabled={!isEditingProfile}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      location: event.target.value,
                    })
                  }
                  className={inputStyle}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isEditingProfile) {
                    const updatedUser = {
                      ...user,
                      ...profile,
                    };

                    localStorage.setItem(
                      "foodshare_user",
                      JSON.stringify(updatedUser)
                    );
                  }

                  setIsEditingProfile((previous) => !previous);
                }}
                className="
                  w-full rounded-xl bg-[#064B3A] px-4 py-3
                  font-semibold text-white transition hover:bg-[#075a40]
                "
              >
                {isEditingProfile
                  ? t("Save Profile")
                  : t("Edit Profile")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
