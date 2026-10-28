import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Utensils,
  FileText,
  MapPin,
  User,
  Phone,
  Mail,
  ShieldCheck,
  LoaderCircle,
  CalendarDays,
  Clock,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function displayValue(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.full_name ||
      value.food_name ||
      value.title ||
      value.email ||
      value.phone ||
      fallback
    );
  }

  return String(value);
}

function firstValue(...values) {
  return values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );
}

// Display dates as DD/MM/YYYY.
function formatDate(value) {
  if (!value) return "Not provided";

  const text = String(value).trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  return text;
}

// Display all times in 24-hour format without AM/PM.

function formatTime(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  const text = String(value).trim();

  // Already formatted with AM/PM
  const ampmMatch = text.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i
  );

  if (ampmMatch) {
    return `${Number(ampmMatch[1])}:${ampmMatch[2]} ${ampmMatch[3].toUpperCase()}`;
  }

  // Handle datetime strings
  const dateTimeMatch = text.match(
    /^\d{4}-\d{2}-\d{2}[T ](\d{1,2}):(\d{2})/
  );

  // Handle normal time strings
  const timeMatch = text.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?$/
  );

  const match = dateTimeMatch || timeMatch;

  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours > 23 || minutes > 59) {
      return text;
    }

    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;

    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  return text;
}


function Detail({ label, value, icon }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-green-600">{icon}</span>
        )}

        <p className="text-sm font-semibold text-gray-600">
          {label}
        </p>
      </div>

      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {displayValue(value)}
      </p>
    </div>
  );
}

function ContactDetail({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="shrink-0 rounded-lg bg-green-50 p-2 text-green-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>

        <p className="break-words text-sm font-semibold text-gray-800">
          {displayValue(value)}
        </p>
      </div>
    </div>
  );
}

export default function PickupRequest() {
  const location = useLocation();
  const navigate = useNavigate();

  const food = location.state?.food;

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  let savedUser = {};

  try {
    savedUser = JSON.parse(
      localStorage.getItem("foodshare_user") || "{}"
    );
  } catch {
    savedUser = {};
  }

  const userRole = String(
    location.state?.userRole ||
      savedUser.role ||
      localStorage.getItem("userRole") ||
      "receiver"
  ).toLowerCase();

  const isDonor = userRole === "donor";

  const foodName = firstValue(
    food?.foodName,
    food?.food_name,
    food?.title,
    food?.name
  ) || "Food";

  const handleBack = () => {
    navigate(isDonor ? "/my-donations" : "/nearby-donations");
  };

  // Preparation date and time.
  const preparationDate = firstValue(
    food?.preparationDate,
    food?.preparation_date,
    food?.preparedDate,
    food?.prepared_date
  );

  const preparationTime = firstValue(
    food?.preparationTime,
    food?.preparation_time,
    food?.preparedTime,
    food?.prepared_time
  );

  // Expiry date and time.
  const expiryDate = firstValue(
    food?.expiryDate,
    food?.expiry_date,
    food?.expiryAt,
    food?.expiry_at,
    food?.expiry
  );

  const expiryTime = firstValue(
    food?.expiryTime,
    food?.expiry_time
  );

  // Pickup date and time.
  const pickupDate = firstValue(
    food?.pickupDate,
    food?.pickup_date,
    food?.date
  );

  const pickupTime = firstValue(
    food?.pickupTime,
    food?.pickup_time,
    food?.time
  );

  // Send pickup request to the backend.
  const handleSendRequest = async () => {
    if (sending) return;

    setError("");

    const token =
      localStorage.getItem("foodshare_token") ||
      localStorage.getItem("token");

    if (!token) {
      setError("Your login session is missing. Please login again.");
      return;
    }

    if (
      !food ||
      !Number.isInteger(Number(food.id)) ||
      Number(food.id) <= 0
    ) {
      setError("Invalid food donation. Please select a donation again.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch(`${API_URL}/pickup-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          donation_id: Number(food.id),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to send pickup request."
        );
      }

      setShowConfirm(false);
      setShowSuccess(true);
    } catch (err) {
      console.error("Pickup request error:", err);

      setError(
        err.message || "Unable to connect to the FoodShare server."
      );
    } finally {
      setSending(false);
    }
  };

  // Fixed page header.
  const pageHeader = (
    <header className="fixed left-[280px] right-0 top-0 z-40 flex h-[90px] items-center border-b border-gray-200 bg-[#f4f7f5] px-4 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-[#063b2c]">
          Food Details
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review the food donation and pickup information.
        </p>
      </div>
    </header>
  );

  if (!food) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f4f7f5]">
        {pageHeader}

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-10 pt-[110px] sm:px-6 lg:px-8">
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-[#063b2c]">
              No Food Selected
            </h2>

            <p className="mt-3 text-gray-500">
              Please select a donation from Nearby Donations first.
            </p>

            <button
              type="button"
              onClick={handleBack}
              className="mt-6 rounded-lg bg-[#064b3a] px-6 py-3 font-semibold text-white hover:bg-[#053b2e]"
            >
              Back to Donations
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f4f7f5]">
      {pageHeader}

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-10 pt-[110px] sm:px-6 lg:px-8">
        {/* FOOD DETAILS */}
        <section className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-5">
            <div className="rounded-lg bg-green-50 p-2">
              <Utensils size={23} className="text-green-600" />
            </div>

            <h2 className="text-xl font-bold text-[#092b3a]">
              Food Details
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {/* FOOD PHOTO */}
            <div className="min-w-0 lg:row-span-2">
              <p className="text-sm font-semibold text-gray-600">
                Food Photo
              </p>

              <div className="mt-3 flex h-[190px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {food.image ? (
                  <img
                    src={
                      String(food.image).startsWith("http")
                        ? food.image
                        : `http://localhost:5000${
                            String(food.image).startsWith("/")
                              ? food.image
                              : `/${food.image}`
                          }`
                    }
                    alt={foodName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Utensils
                      size={45}
                      className="mx-auto text-green-600"
                    />

                    <p className="mt-2 text-sm text-gray-500">
                      No food image available
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Detail label="Food Title" value={foodName} />

            <Detail
              label="Food Type"
              value={firstValue(food.foodType, food.food_type)}
            />

            <Detail
              label="Food Category"
              value={firstValue(
                food.food_category,
                food.foodCategory,
                food.category
              )}
            />

            <Detail
              label="Food Condition"
              value={firstValue(
                food.food_condition,
                food.foodCondition,
                food.condition
              )}
            />

            <Detail
              label="Quantity"
              value={
                food.serves
                  ? `${food.serves} Servings`
                  : food.quantity
              }
            />

            <Detail
              label="Storage Required"
              value={food.storage}
            />

            <Detail
              label="Preparation Date"
              value={formatDate(preparationDate)}
              icon={<CalendarDays size={16} />}
            />

            <Detail
              label="Preparation Time"
              value={formatTime(preparationTime)}
              icon={<Clock size={16} />}
            />

            <Detail
              label="Expiry Date"
              value={formatDate(expiryDate)}
              icon={<CalendarDays size={16} />}
            />

            <Detail
              label="Expiry Time"
              value={formatTime(expiryTime)}
              icon={<Clock size={16} />}
            />

            <Detail
              label="Allergens"
              value={food.allergens}
            />
          </div>

          {/* FOOD DESCRIPTION */}
          <div className="mt-7">
            <div className="mb-3 flex items-center gap-2">
              <FileText size={20} className="text-green-600" />

              <h3 className="font-bold text-[#092b3a]">
                Food Description
              </h3>
            </div>

            <div className="break-words rounded-lg bg-[#f1f8f4] p-4 text-sm text-gray-700">
              {displayValue(
                firstValue(food.foodDescription, food.description),
                "No description provided."
              )}
            </div>
          </div>
        </section>

        {/* PICKUP AND CONTACT */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* PICKUP INFORMATION */}
          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
              <div className="rounded-lg bg-green-50 p-2">
                <MapPin size={21} className="text-green-600" />
              </div>

              <h2 className="text-xl font-bold text-[#092b3a]">
                Pickup Information
              </h2>
            </div>

            <div className="mt-5">
              <Detail
                label="Pickup Location"
                value={firstValue(
                  food.pickupLocation,
                  food.pickup_location,
                  food.location
                )}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Detail
                label="Pickup Date"
                value={formatDate(pickupDate)}
                icon={<CalendarDays size={16} />}
              />

              <Detail
                label="Pickup Time"
                value={formatTime(pickupTime)}
                icon={<Clock size={16} />}
              />
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-600">
                Pickup Instructions
              </p>

              <div className="mt-2 break-words rounded-lg bg-[#f1f8f4] p-4 text-sm text-gray-700">
                {displayValue(
                  firstValue(
                    food.pickupInstructions,
                    food.pickup_instructions
                  ),
                  "Please bring suitable containers for collecting the food."
                )}
              </div>
            </div>
          </section>

          {/* CONTACT INFORMATION */}
          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
              <div className="rounded-lg bg-green-50 p-2">
                <User size={21} className="text-green-600" />
              </div>

              <h2 className="text-xl font-bold text-[#092b3a]">
                Contact Information
              </h2>
            </div>

            <div className="mt-5 space-y-5">
              <ContactDetail
                icon={<User size={18} />}
                label="Contact Person"
                value={firstValue(
                  food.contactPerson,
                  food.contact_person,
                  food.donor?.name,
                  food.donor?.full_name,
                  food.donor?.email,
                  food.donor_name,
                  food.donor
                )}
              />

              <ContactDetail
                icon={<Phone size={18} />}
                label="Contact Phone"
                value={firstValue(
                  food.contact_phone,
                  food.contactPhone,
                  food.phone,
                  food.donor?.phone
                )}
              />

              <ContactDetail
                icon={<Mail size={18} />}
                label="Email"
                value={firstValue(
                  food.email,
                  food.donor?.email
                )}
              />
            </div>
          </section>
        </div>

        {/* FOOD SAFETY */}
        <section className="mt-5 rounded-xl border border-green-100 bg-green-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck
              size={25}
              className="mt-1 shrink-0 text-green-600"
            />

            <div>
              <h3 className="font-bold text-green-800">
                Food Safety Information
              </h3>

              <p className="mt-1 text-sm text-green-700">
                Please verify the preparation date, preparation time,
                expiry date and expiry time before collecting the food.
              </p>
            </div>
          </div>
        </section>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mt-5 break-words rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="mt-5 flex flex-wrap justify-end gap-4 pb-2">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Donations
          </button>

          {!isDonor && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setShowConfirm(true);
              }}
              className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Request Food
            </button>
          )}
        </div>
      </main>

      {/* CONFIRMATION POPUP */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Utensils size={30} className="text-green-700" />
            </div>

            <h2 className="mt-5 text-center text-xl font-bold text-[#063b2c]">
              Send Food Request?
            </h2>

            <p className="mt-3 text-center text-gray-600">
              Do you want to request{" "}
              <span className="font-bold text-gray-800">
                {foodName}
              </span>
              ?
            </p>

            <p className="mt-2 text-center text-sm text-gray-500">
              Your request will be saved to the database with Pending status.
            </p>

            {error && (
              <p className="mt-3 break-words text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={sending}
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={sending}
                onClick={handleSendRequest}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending && (
                  <LoaderCircle size={18} className="animate-spin" />
                )}

                {sending ? "Sending..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <ShieldCheck size={34} className="text-green-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#063b2c]">
              Request Sent Successfully!
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              Your request has been saved to the FoodShare database.
              You can track its status in My Requests.
            </p>

            <button
              type="button"
              onClick={() => navigate("/my-requests")}
              className="mt-6 w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              View My Requests
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                navigate("/nearby-donations");
              }}
              className="mt-3 w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Nearby Donations
            </button>
          </div>
        </div>
      )}
    </div>
  );
}