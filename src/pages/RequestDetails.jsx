
import React from "react";
import { formatTime } from "../utils/formatTime";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Utensils,
  MapPin,
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const displayValue = (
  value,
  fallback = "Not specified",
  preferredKey = "name"
) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    const preferred = value[preferredKey];

    if (
      typeof preferred === "string" ||
      typeof preferred === "number"
    ) {
      return String(preferred);
    }

    return fallback;
  }

  return fallback;
};

export default function RequestDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const request = location.state?.request;

  if (!request || typeof request !== "object") {
    return (
      <div className="min-h-screen w-full overflow-y-auto bg-[#f4f7f5] px-6 py-10">
        <div className="mx-auto flex min-h-[350px] max-w-3xl flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle size={48} className="text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-[#063b2c]">
            No Request Selected
          </h1>

          <p className="mt-2 text-gray-500">
            Please select a request from My Requests to view its details.
          </p>

          <button
            type="button"
            onClick={() => navigate("/my-requests")}
            className="mt-6 rounded-xl bg-[#064b3a] px-6 py-3 font-semibold text-white hover:bg-[#053b2e]"
          >
            Back to My Requests
          </button>
        </div>
      </div>
    );
  }

  const foodName = displayValue(
    request.foodName ?? request.food_name ?? request.title,
    "Food Item"
  );

  const donorName = displayValue(
    request.donor ?? request.donorName ?? request.donor_name,
    "FoodShare Donor"
  );

  const donorPhone = displayValue(
    request.phone ?? request.contact_phone ?? request.donor?.phone,
    "Not provided",
    "phone"
  );

  const donorEmail = displayValue(
    request.email ?? request.donor?.email,
    "Not provided",
    "email"
  );

  const status = displayValue(request.status, "Unknown");
  const normalizedStatus = status.toLowerCase();

  const statusStyle =
    normalizedStatus === "accepted"
      ? "bg-green-100 text-green-700"
      : normalizedStatus === "rejected"
      ? "bg-red-100 text-red-700"
      : normalizedStatus === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-600";

  const statusMessage =
    normalizedStatus === "accepted"
      ? "Your request has been accepted by the donor. You can proceed with the pickup."
      : normalizedStatus === "rejected"
      ? "The donor has rejected your food request."
      : normalizedStatus === "pending"
      ? "Your request has been sent to the donor. Waiting for the donor to respond."
      : "Request status is currently unavailable.";

  const date = displayValue(
    request.date ?? request.pickup_date ?? request.pickupDate
  );

 const rawTime =
  request.time ?? request.pickup_time ?? request.pickupTime;

const time =
  rawTime == null || rawTime === ""
    ? "Not specified"
    : formatTime(rawTime);

  const quantity = displayValue(request.quantity);

  const foodDetails = [
    { label: "Food Name", value: foodName },
    { label: "Quantity", value: quantity },
  ];

  const pickupDetails = [
    {
      label: "Location",
      value: displayValue(request.location ?? request.pickup_location),
      icon: MapPin,
    },
    { label: "Date", value: date, icon: CalendarDays },
    { label: "Time", value: time, icon: Clock },
  ];

  const donorDetails = [
    { label: "Donor", value: donorName, icon: User },
    { label: "Phone", value: donorPhone, icon: Phone },
    { label: "Email", value: donorEmail, icon: Mail },
  ];

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#f4f7f5]">
      {/* Fixed Header */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-gray-200 bg-[#f4f7f5] px-5 py-5 sm:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/my-requests")}
            aria-label="Back to My Requests"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#064b3a] hover:bg-white"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#063b2c]">
              Request Details
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View the details of your food request
            </p>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-6 sm:px-8"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="mx-auto max-w-5xl">
          {/* Food and Status */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#e8f3ef]">
                  <Utensils size={30} className="text-[#064b3a]" />
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-xl font-bold text-gray-800 sm:text-2xl">
                    {foodName}
                  </h2>

                  <p className="mt-1 break-words text-gray-500">
                    Request sent to{" "}
                    <span className="font-semibold text-gray-700">
                      {donorName}
                    </span>
                  </p>
                </div>
              </div>

              <span
                className={`w-fit shrink-0 rounded-full px-5 py-2.5 text-sm font-bold ${statusStyle}`}
              >
                {status}
              </span>
            </div>
          </section>

          {/* Status Message */}
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {normalizedStatus === "accepted" ? (
                <CheckCircle
                  size={25}
                  className="mt-1 shrink-0 text-green-600"
                />
              ) : normalizedStatus === "rejected" ? (
                <AlertCircle
                  size={25}
                  className="mt-1 shrink-0 text-red-600"
                />
              ) : (
                <Clock
                  size={25}
                  className="mt-1 shrink-0 text-yellow-600"
                />
              )}

              <div>
                <h3 className="font-bold text-gray-800">
                  Request Status
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {statusMessage}
                </p>
              </div>
            </div>
          </section>

          {/* Food Details */}
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h3 className="text-xl font-bold text-[#063b2c]">
              Food Details
            </h3>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {foodDetails.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-[#f7faf8] p-5"
                >
                  <p className="text-sm text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-2 break-words font-semibold text-gray-800">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Pickup Details */}
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h3 className="text-xl font-bold text-[#063b2c]">
              Pickup Details
            </h3>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pickupDetails.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl bg-[#f7faf8] p-5"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={19} className="text-[#064b3a]" />
                      <p className="text-sm text-gray-500">
                        {item.label}
                      </p>
                    </div>

                    <p className="mt-3 break-words font-semibold text-gray-800">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Donor Details */}
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h3 className="text-xl font-bold text-[#063b2c]">
              Donor Details
            </h3>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {donorDetails.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl bg-[#f7faf8] p-5"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={19} className="text-[#064b3a]" />
                      <p className="text-sm text-gray-500">
                        {item.label}
                      </p>
                    </div>

                    <p className="mt-3 break-words font-semibold text-gray-800">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Back Button */}
          <div className="mt-6 flex justify-end pb-4">
            <button
              type="button"
              onClick={() => navigate("/my-requests")}
              className="flex items-center gap-2 rounded-xl bg-[#064b3a] px-6 py-3 font-semibold text-white transition hover:bg-[#053b2e]"
            >
              <ArrowLeft size={18} />
              Back to My Requests
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
