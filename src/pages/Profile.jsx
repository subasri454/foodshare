
import { useEffect, useState } from "react";
import { Camera, X, UserRound, Pencil, LoaderCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () =>
    localStorage.getItem("foodshare_token") ||
    localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();

      if (!token) {
        setError("Please log in to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        const profile = data.user;

        setUser(profile);
        setDisplayName(profile.name || "");
        setUsername((profile.email || "").split("@")[0]);
      } catch (err) {
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();

    const cleanName = displayName.trim();

    if (!cleanName) {
      setError("Display name cannot be empty.");
      return;
    }

    if (cleanName.length > 100) {
      setError("Display name must be 100 characters or fewer.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your login session is missing. Please log in again.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save profile.");
      }

      const updatedUser = data.user || {
        ...user,
        name: cleanName,
      };

      setUser(updatedUser);
      setDisplayName(updatedUser.name || cleanName);
      setShowEditProfile(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex items-center gap-3 text-green-800">
          <LoaderCircle className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <UserRound className="mx-auto mb-3 h-12 w-12 text-green-700" />
          <h1 className="text-xl font-semibold text-gray-900">
            Profile unavailable
          </h1>
          <p className="mt-2 text-gray-600">
            {error || "Please log in to view your profile."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-5 text-gray-900 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-gray-500">
            Manage your FoodShare account information.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
          >
            {success}
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-green-100 text-3xl font-semibold text-green-800">
              {initials}
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold">
                {user.name}
              </h2>
              <p className="mt-1 text-gray-500">{user.email}</p>
              <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium capitalize text-green-800">
                {user.role}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setDisplayName(user.name || "");
                setError("");
                setSuccess("");
                setShowEditProfile(true);
              }}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 font-medium text-white hover:bg-green-800 sm:ml-auto sm:mt-0"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          </div>

          <div className="my-7 border-t border-gray-100" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Display name</p>
              <p className="mt-1 font-semibold">{user.name || "—"}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Username</p>
              <p className="mt-1 font-semibold">{username || "—"}</p>
              <p className="mt-1 text-xs text-gray-500">
                Derived from your email address.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Email address</p>
              <p className="mt-1 break-words font-semibold">
                {user.email || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Phone number</p>
              <p className="mt-1 font-semibold">
                {user.phone || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
              <p className="text-sm text-gray-500">Account type</p>
              <p className="mt-1 font-semibold capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <form
            onSubmit={handleSave}
            className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                Edit Profile
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowEditProfile(false);
                  setDisplayName(user.name || "");
                  setError("");
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close edit profile"
              >
                <X size={22} />
              </button>
            </div>

            <div className="my-8 flex justify-center">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-green-100 text-3xl font-semibold text-green-800">
                {initials}
                <span
                  title="Profile photo upload is not connected yet"
                  className="absolute bottom-0 right-0 rounded-full border border-gray-200 bg-white p-2 text-gray-500"
                >
                  <Camera size={18} />
                </span>
              </div>
            </div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Display name
            </label>

            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={100}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              placeholder="Enter your name"
            />

            <label className="mb-2 mt-5 block text-sm font-medium text-gray-700">
              Username
            </label>

            <input
              type="text"
              value={username}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 outline-none"
            />

            <p className="mt-1 text-xs text-gray-500">
              Username is currently derived from your email and cannot be changed here.
            </p>

            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 break-words font-medium text-gray-900">
                {user.email}
              </p>

              <p className="mt-4 text-sm text-gray-500">Account type</p>
              <p className="mt-1 capitalize font-medium text-gray-900">
                {user.role}
              </p>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowEditProfile(false);
                  setDisplayName(user.name || "");
                  setError("");
                }}
                className="rounded-full border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle size={17} className="animate-spin" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

