
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Utensils,
  MapPin,
  CalendarDays,
  Clock,
  User,
  Navigation,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getText = (value, fallback = "Not provided") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.full_name ||
      value.food_name ||
      value.foodName ||
      value.email ||
      fallback
    );
  }

  return String(value);
};

const firstValue = (...values) =>
  values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  ) ?? null;

const formatDate = (value) => {
  if (!value) return "Not provided";

  const text = String(value);
  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateOnly) {
    return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return text;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Display time using 12-hour format with AM/PM
const formatTime = (value) => {
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

  // 24-hour time: HH:mm or HH:mm:ss
  const timeMatch = text.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?$/
  );

  if (timeMatch) {
    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);

    if (hours > 23 || minutes > 59) return text;

    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;

    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  // Datetime string
  const dateTimeMatch = text.match(
    /^\d{4}-\d{2}-\d{2}[T ](\d{1,2}):(\d{2})/
  );

  if (dateTimeMatch) {
    const hours = Number(dateTimeMatch[1]);
    const minutes = Number(dateTimeMatch[2]);

    if (hours > 23 || minutes > 59) return text;

    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;

    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  return text;
};

export default function NearbyDonations() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("foodshare_token") ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first to view donations.");
      }

      const response = await fetch(`${API_URL}/donations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Unable to load donations (${response.status}).`
        );
      }

      const list = Array.isArray(result)
        ? result
        : result.donations || result.data || [];

      if (!Array.isArray(list)) {
        throw new Error("The server returned an invalid donations list.");
      }

      const availableDonations = list.filter(
        (item) =>
          String(item.status || "available").toLowerCase() === "available"
      );

      setDonations(availableDonations);
    } catch (err) {
      console.error("Nearby donations error:", err);
      setError(err.message || "Could not load donations.");
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleViewDetails = (donation) => {
    const food = {
      ...donation,

      id: donation.id,

      foodName: getText(
        firstValue(
          donation.food_name,
          donation.foodName,
          donation.name
        ),
        "Food donation"
      ),

      donor: getText(
        firstValue(
          donation.donor?.name,
          donation.donor?.full_name,
          donation.donor?.email,
          donation.donor_name
        ),
        "FoodShare Donor"
      ),

      location: getText(
        firstValue(
          donation.location,
          donation.address,
          donation.pickup_location
        )
      ),

      quantity: getText(donation.quantity),

      preparationDate: firstValue(
        donation.preparation_date,
        donation.preparationDate,
        donation.prepared_date,
        donation.preparedDate
      ),

      preparationTime: firstValue(
        donation.preparation_time,
        donation.preparationTime,
        donation.prepared_time,
        donation.preparedTime
      ),

      expiryDate: firstValue(
        donation.expiry_date,
        donation.expiryDate,
        donation.expiry_at,
        donation.expiryAt
      ),

      expiryTime: firstValue(
        donation.expiry_time,
        donation.expiryTime
      ),

      pickupDate: firstValue(
        donation.pickup_date,
        donation.pickupDate,
        donation.date
      ),

      pickupTime: firstValue(
        donation.pickup_time,
        donation.pickupTime,
        donation.time
      ),

      date: formatDate(
        firstValue(
          donation.pickup_date,
          donation.pickupDate,
          donation.preparation_date,
          donation.preparationDate,
          donation.created_at
        )
      ),

      time: formatTime(
        firstValue(
          donation.pickup_time,
          donation.pickupTime,
          donation.preparation_time,
          donation.preparationTime
        )
      ),

      foodType: getText(
        firstValue(
          donation.foodType,
          donation.food_type,
          donation.food_category,
          donation.category
        ),
        "Food"
      ),

      description: getText(
        donation.description,
        "No description provided."
      ),

      contactPerson: firstValue(
        donation.contact_person,
        donation.contactPerson,
        donation.donor?.name
      ),

      contactPhone: firstValue(
        donation.contact_phone,
        donation.contactPhone,
        donation.donor?.phone
      ),

      alternatePhone: firstValue(
        donation.alternate_phone,
        donation.alternatePhone
      ),

      email: firstValue(
        donation.email,
        donation.donor?.email
      ),
    };

    console.log("Food details passed to PickupRequest:", food);

    navigate("/pickup-request", {
      state: { food },
    });
  };

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[#f4f7f5]">
      {/* Fixed header */}
      <header className="relative z-20 flex shrink-0 items-center border-b border-gray-200 bg-[#f4f7f5] px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-[#063b2c]">
            Nearby Donations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Find available food donations near your location
          </p>
        </div>
      </header>

      {/* Scrollable content */}
      <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#063b2c]">
              Available Donations
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Loading donations from the database..."
                : `${donations.length} available donation(s)`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:px-5">
              <Navigation size={19} className="text-[#064b3a]" />
              <div>
                <p className="text-xs text-gray-400">Your Location</p>
                <p className="text-sm font-semibold text-gray-700">
                  Not configured
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchDonations}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#064b3a] px-4 py-3 text-white transition hover:bg-[#053b2e] disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <RefreshCw
              size={30}
              className="mx-auto mb-3 animate-spin text-[#064b3a]"
            />
            <p className="font-semibold text-gray-700">
              Loading available donations...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="font-semibold text-red-600">{error}</p>
            <p className="mt-2 text-sm text-gray-500">
              Check that your backend is running on port 5000 and your login is valid.
            </p>
            <button
              type="button"
              onClick={fetchDonations}
              className="mt-4 rounded-lg bg-[#064b3a] px-5 py-2 text-white hover:bg-[#053b2e]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && donations.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Utensils
              size={42}
              className="mx-auto mb-4 text-[#064b3a]"
            />
            <h3 className="text-lg font-bold text-gray-800">
              No donations available
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Food donations added by donors will appear here when they are available.
            </p>
            <button
              type="button"
              onClick={fetchDonations}
              className="mt-5 rounded-lg bg-[#064b3a] px-5 py-2.5 text-white hover:bg-[#053b2e]"
            >
              Refresh Donations
            </button>
          </div>
        )}

        {/* Donations from database */}
        {!loading && !error && donations.length > 0 && (
          <div className="space-y-5">
            {donations.map((donation, index) => {
              const foodName = getText(
                firstValue(
                  donation.food_name,
                  donation.foodName,
                  donation.name
                ),
                "Food donation"
              );

              const donorName = getText(
                firstValue(
                  donation.donor?.name,
                  donation.donor?.full_name,
                  donation.donor?.email,
                  donation.donor_name
                ),
                "FoodShare Donor"
              );

              const location = getText(
                firstValue(
                  donation.location,
                  donation.address,
                  donation.pickup_location
                )
              );

              const quantity = getText(donation.quantity);

              const foodType = getText(
                firstValue(
                  donation.foodType,
                  donation.food_type,
                  donation.food_category,
                  donation.category
                ),
                "Food"
              );

              const pickupDate = firstValue(
                donation.pickup_date,
                donation.pickupDate,
                donation.preparation_date,
                donation.preparationDate,
                donation.created_at
              );

              const pickupTime = firstValue(
                donation.pickup_time,
                donation.pickupTime,
                donation.preparation_time,
                donation.preparationTime
              );

              return (
                <div
                  key={donation.id ?? index}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#e8f3ef]">
                        <Utensils
                          size={28}
                          className="text-[#064b3a]"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words text-xl font-bold text-gray-800">
                          {foodName}
                        </h3>

                        <div className="mt-2 flex items-center gap-2">
                          <User size={15} className="text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Donated by{" "}
                            <span className="font-semibold text-gray-700">
                              {donorName}
                            </span>
                          </p>
                        </div>

                        <div className="mt-3 flex items-start gap-2 text-sm text-gray-500">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0 text-[#064b3a]"
                          />
                          <span>{location}</span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Utensils size={15} />
                            <span>{quantity}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <CalendarDays size={15} />
                            <span>{formatDate(pickupDate)}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock size={15} />
                            <span>{formatTime(pickupTime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-4">
                      <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
                        {foodType}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleViewDetails(donation)}
                        className="flex items-center gap-2 rounded-lg bg-[#064b3a] px-5 py-2.5 font-semibold text-white transition hover:bg-[#053b2e]"
                      >
                        View Details
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500">
                      {getText(
                        donation.description,
                        "No description provided."
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

