export default function NotificationModal({ type, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      {/* MODAL */}
      <div className="w-full max-w-[500px] rounded-2xl bg-white p-7 shadow-2xl">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-[#063b2c]">
            {type === "accepted" && "Request Accepted!"}
            {type === "reminder" && "Pickup Reminder"}
            {type === "completed" && "Donation Completed ✓"}
          </h2>

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>

        </div>


        {/* ================= ACCEPTED ================= */}
        {type === "accepted" && (
          <div>

            <p className="mb-5 text-gray-600">
              Your request has been accepted.
            </p>

            <div className="space-y-3 text-gray-700">

              <p>
                <b>Food:</b> Fresh Vegetable Pulav
              </p>

              <p>
                <b>Quantity:</b> 5 portions
              </p>

              <p>
                <b>Pickup by:</b> 7:00 PM
              </p>

              <p>
                <b>Pickup location:</b> Community Hall
              </p>

            </div>

          </div>
        )}


        {/* ================= REMINDER ================= */}
        {type === "reminder" && (
          <div>

            <p className="mb-5 text-gray-600">
              Don't forget to collect your requested food today.
            </p>

            <div className="space-y-3 text-gray-700">

              <p>
                <b>Food:</b> Birthday Party Snacks
              </p>

              <p>
                <b>Pickup time:</b> 8:00 PM
              </p>

              <p>
                <b>Pickup location:</b> Community Center
              </p>

            </div>

          </div>
        )}


        {/* ================= COMPLETED ================= */}
        {type === "completed" && (
          <div>

            <p className="mb-5 text-gray-600">
              Your food donation has been successfully picked up.
            </p>

            <div className="space-y-3 text-gray-700">

              <p>
                <b>Food:</b> Tandoori Platter
              </p>

              <p>
                <b>Quantity:</b> 10 portions
              </p>

              <p>
                <b>Status:</b> Completed ✓
              </p>

              <p>
                <b>Pickup:</b> Successfully completed
              </p>

            </div>

          </div>
        )}


        {/* BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-lg bg-[#063b2c] py-3 font-semibold text-white hover:bg-[#07513d]"
        >
          {type === "completed" ? "Done" : "Got it"}
        </button>

      </div>

    </div>
  );
}