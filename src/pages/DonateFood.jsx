import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100";

const labelClass = "mb-2 block text-sm font-semibold text-gray-800";

export default function DonateFood() {
  const navigate = useNavigate();

  const [foodImage, setFoodImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [foodTitle, setFoodTitle] = useState("");
  const [foodType, setFoodType] = useState("Vegetarian");
  const [foodCondition, setFoodCondition] = useState("");
  const [foodCategory, setFoodCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [freshFor, setFreshFor] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [allergens, setAllergens] = useState("");
  const [preparationDate, setPreparationDate] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [location, setLocation] = useState("");
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("foodshare_user") || "null"
      );

      if (user) {
        setContactPerson(user.name || "");
        setEmail(user.email || "");
        setContactPhone(user.phone || "");
      }
    } catch (error) {
      console.error("Unable to load user details:", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (foodImage) URL.revokeObjectURL(foodImage);
    };
  }, [foodImage]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setMessageType("error");
      setMessage("Please upload a JPG or PNG image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessageType("error");
      setMessage("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    if (foodImage) URL.revokeObjectURL(foodImage);

    setImageFile(file);
    setFoodImage(URL.createObjectURL(file));
    setMessage("");
  };

  const removeImage = () => {
    if (foodImage) URL.revokeObjectURL(foodImage);

    setFoodImage(null);
    setImageFile(null);

    const input = document.getElementById("foodImageInput");
    if (input) input.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (
      !foodTitle.trim() ||
      !foodCondition ||
      !foodCategory ||
      !quantity.trim() ||
      !description.trim() ||
      !freshFor ||
      !preparationDate ||
      !expiryDate ||
      !pickupDate ||
      !pickupTime ||
      !location.trim() ||
      !contactPerson.trim() ||
      !contactPhone.trim() ||
      !email.trim()
    ) {
      setMessageType("error");
      setMessage("Please fill in all required fields.");
      return;
    }

    if (preparationDate > expiryDate) {
      setMessageType("error");
      setMessage("Expiry date cannot be before preparation date.");
      return;
    }

    if (pickupDate < preparationDate || pickupDate > expiryDate) {
      setMessageType("error");
      setMessage(
        "Pickup date must be between the preparation date and expiry date."
      );
      return;
    }

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("foodshare_token");

    if (!token) {
      setMessageType("error");
      setMessage("Please log in again before submitting your donation.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      // The existing backend uses food_name for the donation title.
     
formData.append("food_name", foodTitle.trim());
formData.append("title", foodTitle.trim());
formData.append("food_type", foodType);
formData.append("food_condition", foodCondition);
formData.append("food_category", foodCategory);
formData.append("quantity", quantity.trim());
formData.append("description", description.trim());
formData.append("detailed_description", detailedDescription.trim());
formData.append("fresh_for", freshFor);
formData.append("ingredients", ingredients.trim());
formData.append("allergens", allergens.trim());

formData.append("preparation_date", preparationDate);
formData.append("preparation_time", preparationTime);

formData.append("expiry_date", expiryDate);
formData.append("expiry_time", expiryTime);

formData.append("pickup_date", pickupDate);
formData.append("pickup_time", pickupTime);

formData.append("location", location.trim());
formData.append("pickup_instructions", pickupInstructions.trim());
formData.append("contact_person", contactPerson.trim());
formData.append("contact_phone", contactPhone.trim());
formData.append("alternate_phone", alternatePhone.trim());
formData.append("email", email.trim());


      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(`${API_URL}/donations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to submit the donation."
        );
      }

      setMessageType("success");
      setMessage("Food donation submitted successfully!");

      setTimeout(() => {
        navigate("/my-donations");
      }, 1200);
    } catch (error) {
      console.error("Donation submission error:", error);
      setMessageType("error");
      setMessage(
        error.message ||
          "Could not submit the donation. Please check your backend server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f4f7f5]">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-[#f4f7f5] px-5 py-5 md:px-8">
        <h1 className="text-2xl font-bold text-[#063b2c]">
          Donate Food
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the details below to donate food and help those in need.
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-7"
        >
          {message && (
            <div
              className={`mb-6 rounded-lg border p-4 text-sm font-medium ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* PHOTO AND BASIC DETAILS */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className={labelClass}>
                Food Photo <span className="text-gray-500">(Optional)</span>
              </label>

              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-300 bg-green-50/40 p-4">
                {foodImage ? (
                  <div className="relative w-full">
                    <img
                      src={foodImage}
                      alt="Selected food"
                      className="h-40 w-full rounded-lg object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white"
                      aria-label="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="mb-2 text-green-600" />
                    <p className="font-semibold text-gray-800">
                      Upload Food Photo
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG (Max 5 MB)
                    </p>
                  </>
                )}

                <label className="mt-3 cursor-pointer rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700">
                  {foodImage ? "Change File" : "Choose File"}
                  <input
                    id="foodImageInput"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Food Type <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-wrap gap-3">
                {["Vegetarian", "Non-Vegetarian"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFoodType(type)}
                    className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                      foodType === type
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Food Condition <span className="text-red-500">*</span>
              </label>

              <select
                required
                value={foodCondition}
                onChange={(e) => setFoodCondition(e.target.value)}
                className={inputClass}
              >
                <option value="">Select condition</option>
                <option value="Fresh">Fresh</option>
                <option value="Good">Good</option>
                <option value="Packaged">Packaged</option>
              </select>
            </div>

            {/* FOOD TITLE - IMPORTANT */}

            <div>
              <label className={labelClass}>
                Food Title <span className="text-red-500">*</span>
              </label>

              <input
                required
                value={foodTitle}
                onChange={(e) => setFoodTitle(e.target.value)}
                placeholder="Enter food title, e.g. Vegetable Biryani"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Food Category <span className="text-red-500">*</span>
              </label>

              <select
                required
                value={foodCategory}
                onChange={(e) => setFoodCategory(e.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>
                <option value="Cooked Food">Cooked Food</option>
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Bakery">Bakery</option>
                <option value="Packaged Food">Packaged Food</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Quantity / Serves <span className="text-red-500">*</span>
              </label>

              <input
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="E.g. 20 servings or 5 kg"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Short Description <span className="text-red-500">*</span>
              </label>

              <input
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a short food description"
                className={inputClass}
              />
            </div>

            {/* FRESH DURATION - IMPORTANT */}

            <div>
              <label className={labelClass}>
                Fresh For <span className="text-red-500">*</span>
              </label>

              <select
                required
                value={freshFor}
                onChange={(e) => setFreshFor(e.target.value)}
                className={inputClass}
              >
                <option value="">Select duration</option>
                <option value="2 hours">2 hours</option>
                <option value="4 hours">4 hours</option>
                <option value="6 hours">6 hours</option>
                <option value="12 hours">12 hours</option>
                <option value="24 hours">24 hours</option>
                <option value="2 days">2 days</option>
                <option value="3 days">3 days</option>
              </select>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label className={labelClass}>
                Detailed Description{" "}
                <span className="text-gray-500">(Optional)</span>
              </label>

              <textarea
                rows={3}
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                placeholder="Describe ingredients, preparation, and packing..."
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>

          <div className="my-8 border-t border-gray-200" />

          {/* INGREDIENTS AND ALLERGENS */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className={labelClass}>
                Ingredients <span className="text-gray-500">(Optional)</span>
              </label>

              <textarea
                rows={3}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Mention the ingredients used in the food..."
                className={`${inputClass} resize-y`}
              />
            </div>

            <div>
              <label className={labelClass}>
                Allergens <span className="text-gray-500">(Optional)</span>
              </label>

              <input
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                placeholder="E.g. Nuts, Dairy, Gluten"
                className={inputClass}
              />

              <p className="mt-2 text-xs text-gray-500">
                Mention if the food contains any allergens.
              </p>
            </div>
          </div>

          <div className="my-8 border-t border-gray-200" />

          {/* DATES */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
  {/* Preparation Date */}
  <div className="min-w-0">
    <label className={labelClass}>
      Preparation Date <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      required
      value={preparationDate}
      onChange={(e) => setPreparationDate(e.target.value)}
      className={`${inputClass} w-full`}
    />
  </div>

  {/* Preparation Time */}
  <div className="min-w-0">
    <label className={labelClass}>
      Preparation Time <span className="text-red-500">*</span>
    </label>
   
<select
  value={preparationTime}
  onChange={(e) => setPreparationTime(e.target.value)}
  required
  className={`${inputClass} w-full`}
>
  <option value="">Select time</option>
  {Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 || 12;
    const timeValue = `${String(hour).padStart(2, "0")}:${minute}`;

    return (
      <option key={timeValue} value={timeValue}>
        {`${String(displayHour).padStart(2, "0")}:${minute} ${period}`}
      </option>
    );
  })}
</select>

  </div>

  {/* Expiry Date */}
  <div className="min-w-0">
    <label className={labelClass}>
      Expiry Date <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      required
      value={expiryDate}
      onChange={(e) => setExpiryDate(e.target.value)}
      className={`${inputClass} w-full`}
    />
  </div>

  {/* Expiry Time */}
  <div className="min-w-0">
    <label className={labelClass}>
      Expiry Time <span className="text-red-500">*</span>
    </label>
   
<select
  value={expiryTime}
  onChange={(e) => setExpiryTime(e.target.value)}
  required
  className={`${inputClass} w-full`}
>
  <option value="">Select expiry time</option>
  {Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 || 12;
    const timeValue = `${String(hour).padStart(2, "0")}:${minute}`;

    return (
      <option key={timeValue} value={timeValue}>
        {`${String(displayHour).padStart(2, "0")}:${minute} ${period}`}
      </option>
    );
  })}
</select>

  </div>
</div>

{/* Pickup Instructions */}
<div className="mt-6 mb-5">
  <label className={labelClass}>
    Pickup Instructions{" "}
    <span className="text-gray-400">(Optional)</span>
  </label>
  <input
    type="text"
    value={pickupInstructions}
    onChange={(e) => setPickupInstructions(e.target.value)}
    placeholder="Any instructions for pickup"
    className={`${inputClass} w-full`}
  />
</div>

{/* Pickup Details */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-6">

  
{/* Pickup Location */}
<div>
  <label className={labelClass}>
    Pickup Location <span className="text-red-500">*</span>
  </label>

  <div className="flex flex-col gap-3 sm:flex-row">
    <input
      type="text"
      required
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      placeholder="Enter complete pickup address"
      className={`${inputClass} w-full flex-1`}
    />

    <button
      type="button"
      onClick={() => {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
              );

              if (!response.ok) {
                throw new Error("Address lookup failed");
              }

              const data = await response.json();

              if (data.display_name) {
                setLocation(data.display_name);
              } else {
                alert("Address not found. Please enter it manually.");
              }
            } catch (error) {
              alert("Could not detect the address. Please enter it manually.");
            }
          },
          (error) => {
            if (error.code === 1) {
              alert("Location permission denied. Please allow location access.");
            } else {
              alert("Unable to detect your location. Please try again.");
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      }}
      className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#064B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#04382C]"
    >
      <span>📍</span>
      Use My Location
    </button>
  </div>

  <p className="mt-2 text-xs text-gray-500">
    Click Use My Location to detect your address, or enter it manually.
  </p>
</div>


  {/* Pickup Date */}
  <div>
    <label className={labelClass}>
      Pickup Date <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      required
      value={pickupDate}
      onChange={(e) => setPickupDate(e.target.value)}
      className={`${inputClass} w-full`}
    />
  </div>

  {/* Pickup Time */}
  <div>
    <label className={labelClass}>
      Pickup Time <span className="text-red-500">*</span>
    </label>
 
<select
  value={pickupTime}
  onChange={(e) => setPickupTime(e.target.value)}
  required
  className={`${inputClass} w-full`}
>
  <option value="">Select pickup time</option>
  {Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 || 12;
    const timeValue = `${String(hour).padStart(2, "0")}:${minute}`;

    return (
      <option key={timeValue} value={timeValue}>
        {`${String(displayHour).padStart(2, "0")}:${minute} ${period}`}
      </option>
    );
  })}
</select>

  </div>

  {/* Contact Person */}
  <div>
    <label className={labelClass}>
      Contact Person <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      required
      value={contactPerson}
      onChange={(e) => setContactPerson(e.target.value)}
      className={`${inputClass} w-full`}
    />
  </div>

  {/* Contact Phone */}
  <div>
    <label className={labelClass}>
      Contact Phone <span className="text-red-500">*</span>
    </label>
    <input
      type="tel"
      required
      value={contactPhone}
      onChange={(e) => setContactPhone(e.target.value)}
      className={`${inputClass} w-full`}
    />
  </div>

  {/* Alternate Phone */}
  <div>
    <label className={labelClass}>
      Alternate Phone <span className="text-gray-400">(Optional)</span>
    </label>
    <input
      type="tel"
      value={alternatePhone}
      onChange={(e) => setAlternatePhone(e.target.value)}
      placeholder="Enter alternate phone number"
      className={`${inputClass} w-full`}
    />
  </div>

  {/* Email */}
  <div>
    <label className={labelClass}>
      Email <span className="text-red-500">*</span>
    </label>
    <input
      type="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className={`${inputClass} w-full`}
    />
  </div>
</div>

          {/* FORM BUTTONS */}

          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">
            <Link
              to="/my-donations"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft size={17} />
              Back
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-green-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting ? "Submitting..." : "Submit Donation"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
