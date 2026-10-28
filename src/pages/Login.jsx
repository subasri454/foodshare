import React, { useState } from "react";
import API_URL from "../config/api";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Recycle,
  Users,
  Heart,
  Sprout,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
  email: "subasrisuba454@gmail.com",
  password: "",
  role: "Donor",
});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Save login information
    localStorage.setItem("foodshare_token", data.token);
    localStorage.setItem("foodshare_user", JSON.stringify(data.user));

    // Check selected role
    if (
      formData.role.toLowerCase() !== data.user.role.toLowerCase()
    ) {
      alert(`This account is registered as ${data.user.role}.`);
      return;
    }

    // Navigate according to actual user role
    if (data.user.role === "receiver") {
      navigate("/receiver-dashboard");
    } else {
      navigate("/donor-dashboard");
    }

  } catch (error) {
    console.error("Login Error:", error);
    alert("Unable to connect to FoodShare server.");
  }
};

  return (
    <div className="min-h-screen w-full bg-white flex overflow-hidden">

      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <div className="hidden lg:flex lg:w-[42%] bg-[#003f2f] text-white relative">

        <div className="w-full px-14 py-12 flex flex-col">

          {/* LOGO */}
          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">

              <Sprout
                size={27}
                className="text-[#064b3a]"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold tracking-tight">
                Food<span className="text-[#55d66b]">share</span>
              </h2>

              <p className="text-sm text-gray-300 mt-0.5">
                Share Food, Share Love
              </p>

            </div>

          </div>

          {/* MAIN LEFT CONTENT */}
          <div className="flex-1 flex items-center">

            <div className="max-w-[500px]">

              {/* SMALL BADGE */}
              <div className="inline-flex items-center gap-2 bg-[#075b46] border border-[#16735a] px-4 py-2 rounded-full mb-7">

                <Sprout
                  size={17}
                  className="text-[#55d66b]"
                />

                <span className="text-sm font-medium text-[#b9f5c2]">
                  Together We Can End Hunger
                </span>

              </div>

              {/* HEADING */}
              <h1 className="text-5xl xl:text-6xl font-bold leading-tight">

                Share Food,
                <br />

                <span className="text-[#55d66b]">
                  Share Love
                </span>

              </h1>

              {/* DESCRIPTION */}
              <p className="text-gray-200 text-lg leading-8 mt-7 max-w-[450px]">

                Join our community and help reduce food waste
                by sharing surplus meals with people who need them.

              </p>

              {/* FEATURES */}
              <div className="mt-10 space-y-6">

                {/* FEATURE 1 */}
                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-full bg-[#075b46] flex items-center justify-center">

                    <Recycle
                      size={23}
                      className="text-[#55d66b]"
                    />

                  </div>

                  <div>

                    <h3 className="text-lg font-bold">
                      Reduce Waste
                    </h3>

                    <p className="text-sm text-gray-300 mt-1">
                      Help reduce food waste and protect our planet.
                    </p>

                  </div>

                </div>

                {/* FEATURE 2 */}
                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-full bg-[#075b46] flex items-center justify-center">

                    <Users
                      size={23}
                      className="text-[#55d66b]"
                    />

                  </div>

                  <div>

                    <h3 className="text-lg font-bold">
                      Help Others
                    </h3>

                    <p className="text-sm text-gray-300 mt-1">
                      Share food and bring smiles to many faces.
                    </p>

                  </div>

                </div>

                {/* FEATURE 3 */}
                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-full bg-[#075b46] flex items-center justify-center">

                    <Heart
                      size={23}
                      className="text-[#55d66b]"
                    />

                  </div>

                  <div>

                    <h3 className="text-lg font-bold">
                      Create Impact
                    </h3>

                    <p className="text-sm text-gray-300 mt-1">
                      Your small act can create a big difference.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* NO BOTTOM LOGOS / IMAGES HERE */}

        </div>

      </div>


      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="w-full lg:w-[58%] min-h-screen flex items-center justify-center bg-white px-6 sm:px-10 lg:px-16 xl:px-24">

        <div className="w-full max-w-[500px]">

          {/* MOBILE LOGO */}
          <div className="flex lg:hidden items-center gap-3 mb-10">

            <div className="w-11 h-11 rounded-full bg-[#e8f5ef] flex items-center justify-center">

              <Sprout
                size={25}
                className="text-[#064b3a]"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-[#064b3a]">
                Food<span className="text-green-500">share</span>
              </h2>

              <p className="text-xs text-gray-500">
                Share Food, Share Love
              </p>

            </div>

          </div>


          {/* WELCOME */}
          <div className="mb-9">

            <h1 className="text-4xl xl:text-5xl font-bold text-[#064b3a]">
              Welcome Back!
            </h1>

            <p className="text-gray-500 text-base mt-3">
              Sign in to continue to your account
            </p>

          </div>


          {/* LOGIN FORM */}
          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >

            {/* EMAIL */}
            <div>

              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

<input
  type="email"
  name="email"
  autoComplete="new-email"
  autoCapitalize="none"
  spellCheck={false}
  value={formData.email}
  onChange={handleChange}
  placeholder="Enter your Gmail address"
  required
  className="w-full h-[58px] pl-12 pr-4 rounded-xl border border-gray-300 bg-white text-gray-800 outline-none transition focus:border-[#064b3a] focus:ring-2 focus:ring-[#064b3a]/10"
/>
              </div>

            </div>


            {/* PASSWORD */}
            <div>

              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full h-[58px] pl-12 pr-12 rounded-xl border border-gray-300 bg-white text-gray-800 outline-none transition focus:border-[#064b3a] focus:ring-2 focus:ring-[#064b3a]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#064b3a]"
                >
                 {showPassword ? (
  <Eye size={19} />
) : (
  <EyeOff size={19} />
)}
                </button>

              </div>

            </div>


            {/* FORGOT PASSWORD */}
            <div className="flex justify-end -mt-2">

              <button
                type="button"
                className="text-sm font-medium text-[#007b5e] hover:text-[#005c47]"
              >
                Forgot Password?
              </button>

            </div>


            {/* LOGIN AS */}
            <div>

              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Login As
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-[58px] px-4 rounded-xl border border-gray-300 bg-white text-gray-800 outline-none focus:border-[#064b3a] focus:ring-2 focus:ring-[#064b3a]/10 cursor-pointer"
              >

                <option value="Donor">
                  Donor
                </option>

                <option value="Receiver">
                  Receiver
                </option>

              </select>

            </div>


            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="w-full h-[58px] rounded-xl bg-[#07583f] text-white font-bold text-base hover:bg-[#064b3a] transition shadow-sm flex items-center justify-center gap-2"
            >
              Login

              <ArrowRight size={18} />

            </button>

          </form>


          {/* DIVIDER */}
          <div className="flex items-center gap-4 my-7">

            <div className="flex-1 h-px bg-gray-200"></div>

            <span className="text-sm text-gray-400">
              OR
            </span>

            <div className="flex-1 h-px bg-gray-200"></div>

          </div>


          {/* GOOGLE BUTTON */}
          <button
            type="button"
            className="w-full h-[56px] rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition flex items-center justify-center gap-3 font-semibold text-gray-800"
          >

            <span className="text-xl font-bold text-blue-600">
              G
            </span>

            Continue with Google

          </button>


          {/* SIGN UP */}
          <p className="text-center text-sm text-gray-500 mt-7">

            Don't have an account?

            <Link
              to="/signup"
              className="ml-1 font-bold text-[#007b5e] hover:text-[#005c47]"
            >
              Sign Up
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}
