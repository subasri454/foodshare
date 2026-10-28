import { useState, useRef, useEffect } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="flex h-[80px] items-center justify-between border-b border-gray-200 bg-white px-8">

      {/* LEFT */}
      <div>
        <h2 className="text-xl font-bold text-[#063b2c]">
          FoodShare
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">

        {/* NOTIFICATION */}
        <Link
          to="/alerts"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100"
        >
          <Bell size={21} />

          {/* Notification dot */}
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-green-500" />
        </Link>


        {/* PROFILE */}
        <div
          ref={menuRef}
          className="relative"
        >

          {/* PROFILE BUTTON */}
          <button
            onClick={() => setOpen((previous) => !previous)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100"
          >
            <User size={21} />
          </button>


          {/* PROFILE POPUP */}
          {open && (
            <div className="absolute right-0 top-[58px] z-[100] w-[280px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

              {/* PROFILE HEADER */}
              <div className="border-b border-gray-100 px-5 py-5">

                <div className="flex items-center gap-3">

                  {/* PROFILE ICON */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#063b2c] text-white">
                    <User size={23} />
                  </div>

                  {/* USER DETAILS */}
                  <div>
                    <p className="font-bold text-gray-900">
                      Suba Sri
                    </p>

                    <p className="text-sm text-gray-500">
                      subasri@example.com
                    </p>
                  </div>

                </div>

              </div>


              {/* PROFILE BUTTON */}
              <button
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-5 py-4 text-gray-700 transition hover:bg-[#f4f7f5]"
              >
                <User size={19} />

                <span className="text-sm font-medium">
                  Profile
                </span>
              </button>


              {/* LOGOUT */}
              <div className="border-t border-gray-100">

                <button
                  onClick={() => {
                    setOpen(false);
                    alert("Logged out successfully!");
                  }}
                  className="flex w-full items-center gap-3 px-5 py-4 text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={19} />

                  <span className="text-sm font-medium">
                    Log out
                  </span>
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}