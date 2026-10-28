import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
Recycle,
Users,
Heart,
Sprout,
ArrowRight,
User,
Mail,
Phone,
Lock,
Eye,
EyeOff,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function SignUp() {
const navigate = useNavigate();

const [role, setRole] = useState("donor");
const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [loading, setLoading] = useState(false);

const handleSignUp = async (e) => {
e.preventDefault();

const cleanName = fullName.trim();
const cleanEmail = email.trim().toLowerCase();
const cleanPhone = phone.trim();

if (!cleanName || !cleanEmail || !cleanPhone) {
  alert("Please fill in all required fields.");
  return;
}

if (password.length < 8) {
  alert("Password must contain at least 8 characters.");
  return;
}

if (password !== confirmPassword) {
  alert("Passwords do not match!");
  return;
}

try {
  setLoading(true);

  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "Registration failed. Please try again.");
    return;
  }

  alert("Account created successfully! Please login.");

  // Remember the selected role for the login page.
  localStorage.setItem("userRole", role);

  navigate("/login", {
    state: {
      email: cleanEmail,
      role,
    },
  });
} catch (error) {
  console.error("Signup Error:", error);
  alert(
    "Unable to connect to FoodShare server. Please check whether the backend is running."
  );
} finally {
  setLoading(false);
}

};

return (
<div className="min-h-screen w-full bg-white flex overflow-hidden">
{/* LEFT SIDE */}
<div className="hidden lg:flex lg:w-[42%] bg-[#003f2f] text-white">
<div className="w-full px-14 py-12 flex flex-col">
<div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
<Sprout size={27} className="text-[#064b3a]" />
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

      <div className="flex-1 flex items-center">
        <div className="max-w-[500px]">
          <div className="inline-flex items-center gap-2 bg-[#075b46] border border-[#16735a] px-4 py-2 rounded-full mb-7">
            <Sprout size={17} className="text-[#55d66b]" />
            <span className="text-sm font-medium text-[#b9f5c2]">
              Together We Can End Hunger
            </span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold leading-tight">
            Share Food,
            <br />
            <span className="text-[#55d66b]">Share Love</span>
          </h1>

          <p className="text-gray-200 text-lg leading-8 mt-7 max-w-[450px]">
            Join our community and help reduce food waste by sharing
            surplus meals with people who need them.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#075b46] flex items-center justify-center">
                <Recycle size={23} className="text-[#55d66b]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Reduce Waste</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Help reduce food waste and protect our planet.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#075b46] flex items-center justify-center">
                <Users size={23} className="text-[#55d66b]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Help Others</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Share food and bring smiles to many faces.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#075b46] flex items-center justify-center">
                <Heart size={23} className="text-[#55d66b]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Create Impact</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Your small act can create a big difference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* RIGHT SIDE */}
  <div className="w-full lg:w-[58%] min-h-screen bg-white flex items-center justify-center px-6 py-8 md:px-10 lg:px-12 overflow-y-auto">
    <div className="w-full max-w-3xl">
      <div className="mb-5">
        <h2 className="text-4xl font-bold text-gray-900">
          Create Your Account
        </h2>
        <p className="text-gray-500 mt-2">
          Sign up to get started
        </p>
      </div>

      {/* ROLE SELECTION */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          I am a
        </label>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole("donor")}
            className={`relative h-36 rounded-xl border-2 flex flex-col items-center justify-center transition ${
              role === "donor"
                ? "border-[#08744f] bg-[#f1faf5]"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {role === "donor" && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#08744f] text-white flex items-center justify-center text-sm">
                ✓
              </div>
            )}

            <div className="w-14 h-14 rounded-full bg-[#08744f] text-white flex items-center justify-center mb-2">
              <Heart size={25} />
            </div>

            <h3 className="font-bold text-lg text-[#08744f]">Donor</h3>
            <p className="text-sm text-gray-700">
              I want to donate food
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRole("receiver")}
            className={`relative h-36 rounded-xl border-2 flex flex-col items-center justify-center transition ${
              role === "receiver"
                ? "border-[#5b3bb5] bg-[#f7f5ff]"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {role === "receiver" && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#5b3bb5] text-white flex items-center justify-center text-sm">
                ✓
              </div>
            )}

            <div className="w-14 h-14 rounded-full bg-[#5b3bb5] text-white flex items-center justify-center mb-2">
              <Users size={25} />
            </div>

            <h3 className="font-bold text-lg text-[#5b3bb5]">
              Receiver
            </h3>
            <p className="text-sm text-gray-700">
              I want to receive food
            </p>
          </button>
        </div>
      </div>

      {/* SIGNUP FORM */}
      <form onSubmit={handleSignUp}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg outline-none focus:border-[#08744f] focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg outline-none focus:border-[#08744f] focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="tel"
                autoComplete="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg outline-none focus:border-[#08744f] focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                className="w-full h-12 pl-11 pr-12 border border-gray-300 rounded-lg outline-none focus:border-[#08744f] focus:ring-2 focus:ring-green-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#08744f]"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use at least 8 characters.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-12 pl-11 pr-12 border border-gray-300 rounded-lg outline-none focus:border-[#08744f] focus:ring-2 focus:ring-green-100"
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#08744f]"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-5 bg-[#08744f] text-white rounded-lg font-semibold hover:bg-[#065c3d] transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? "Creating Account..."
            : `Sign Up as ${role === "donor" ? "Donor" : "Receiver"}`}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="flex items-center gap-4 my-5">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-gray-500 text-sm">or sign up with</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          className="h-11 border border-gray-300 rounded-lg flex items-center justify-center gap-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          <span className="text-lg font-bold text-blue-600">G</span>
          Google
        </button>

        <button
          type="button"
          className="h-11 border border-gray-300 rounded-lg flex items-center justify-center gap-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          <span className="text-lg font-bold text-blue-600">f</span>
          Facebook
        </button>

        <button
          type="button"
          className="h-11 border border-gray-300 rounded-lg flex items-center justify-center gap-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          <span className="text-lg font-bold text-black"></span>
          Apple
        </button>
      </div>

      <div className="text-center mt-5 text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#08744f] font-semibold hover:underline"
        >
          Login
        </Link>
      </div>

      <p className="text-center text-xs text-gray-500 mt-4 pb-4">
        By signing up, you agree to our{" "}
        <span className="text-[#08744f]">Terms & Conditions</span> and{" "}
        <span className="text-[#08744f]">Privacy Policy</span>.
      </p>
    </div>
  </div>
</div>

);
}
