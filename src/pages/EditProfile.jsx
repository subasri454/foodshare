import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  Save,
  Camera,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState("Suba Sri");
  const [email, setEmail] = useState("subasri@example.com");
  const [phone, setPhone] = useState("+91 XXXXX XXXXX");

  const handleSave = () => {
    alert("Profile updated successfully!");
    navigate("/settings");
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f7f5]">

      {/* FIXED HEADER */}
      <div className="fixed top-0 left-[288px] right-0 z-50 h-[130px] border-b border-gray-200 bg-[#f4f7f5] px-8">

        <div className="flex h-full items-center gap-4">

          <Link
            to="/settings"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#063b2c] shadow-sm transition hover:bg-[#063b2c] hover:text-white"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-[#063b2c]">
              Edit Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update your personal information
            </p>
          </div>

        </div>

      </div>


      {/* PAGE CONTENT */}
      <div className="w-full px-8 pb-10 pt-[135px]">

        <div className="w-full rounded-2xl bg-white p-8 shadow-sm">

          {/* PROFILE PHOTO */}
          <div className="mb-8 flex flex-col items-center">

            <div className="relative">

              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#e8f5ef] text-[#063b2c]">
                <User size={55} strokeWidth={1.7} />
              </div>

              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#063b2c] text-white shadow-md hover:bg-[#07523e]"
              >
                <Camera size={18} />
              </button>

            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Profile Photo
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Click the camera icon to change your photo
            </p>

          </div>


          {/* FORM */}
          <div className="mx-auto w-full max-w-4xl space-y-6">

            {/* FULL NAME */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-800 outline-none transition focus:border-[#063b2c] focus:ring-2 focus:ring-[#063b2c]/10"
                  placeholder="Enter your full name"
                />

              </div>

            </div>


            {/* EMAIL */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-800 outline-none transition focus:border-[#063b2c] focus:ring-2 focus:ring-[#063b2c]/10"
                  placeholder="Enter your email"
                />

              </div>

            </div>


            {/* PHONE */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phone Number
              </label>

              <div className="relative">

                <Phone
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-800 outline-none transition focus:border-[#063b2c] focus:ring-2 focus:ring-[#063b2c]/10"
                  placeholder="Enter your phone number"
                />

              </div>

            </div>


            {/* BUTTONS */}
            <div className="flex justify-end gap-4 border-t border-gray-100 pt-7">

              <Link
                to="/settings"
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </Link>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-[#063b2c] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#07523e]"
              >
                <Save size={18} />
                Save Changes
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}