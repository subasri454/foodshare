import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, ArrowLeft, LoaderCircle } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    location.state?.email || localStorage.getItem("foodshare_pending_email") || ""
  );
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail || !/^\d{6}$/.test(cleanOtp)) {
      setError("Enter your email and the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Verification failed.");
        return;
      }

      localStorage.removeItem("foodshare_pending_email");
      setMessage(data.message || "Email verified successfully.");

      window.setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("Email verification error:", err);
      setError("Cannot connect to FoodShare server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7f5] flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <ShieldCheck size={32} className="text-[#08744f]" />
        </div>

        <h1 className="text-center text-3xl font-bold text-gray-900">
          Verify Your Email
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Enter the 6-digit code sent to your email. The code expires in 10 minutes.
        </p>

        <form onSubmit={handleVerify} className="mt-7 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
                className="h-12 w-full rounded-lg border border-gray-300 pl-10 pr-3 outline-none focus:border-[#08744f] focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              6-Digit OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter verification code"
              required
              className="h-12 w-full rounded-lg border border-gray-300 px-4 text-center text-xl tracking-[0.5em] outline-none focus:border-[#08744f] focus:ring-2 focus:ring-green-100"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#08744f] font-semibold text-white transition hover:bg-[#065c3d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        <Link
          to="/signup"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-[#08744f] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Sign Up
        </Link>
      </div>
    </div>
  );
}