
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout
import Layout from "./Layouts/Layout";

// Authentication
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Donor Pages
import DonorDashboard from "./pages/DonorDashboard";
import MyDonations from "./pages/MyDonations";
import Requests from "./pages/Requests";
import Pickups from "./pages/Pickups";
import DonateFood from "./pages/DonateFood";
import Alerts from "./pages/Alerts";

// Receiver Pages
import ReceiverDashboard from "./pages/ReceiverDashboard";
import MyRequests from "./pages/MyRequests";
import NearbyDonations from "./pages/NearbyDonations";
import BrowseFood from "./pages/BrowseFood";
import PickupRequest from "./pages/PickupRequest";
import RequestDetails from "./pages/RequestDetails";

// Common Pages
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ============================= */}
        {/* PUBLIC PAGES                  */}
        {/* ============================= */}

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* ============================= */}
        {/* DASHBOARD LAYOUT              */}
        {/* SIDEBAR IS ADDED HERE         */}
        {/* ============================= */}

        <Route element={<Layout />}>

          {/* DONOR PAGES */}

          <Route
            path="/donor-dashboard"
            element={<DonorDashboard />}
          />

          <Route
            path="/my-donations"
            element={<MyDonations />}
          />

          <Route
            path="/requests"
            element={<Requests />}
          />

          <Route
            path="/pickups"
            element={<Pickups />}
          />

          <Route
            path="/donate-food"
            element={<DonateFood />}
          />

          <Route
            path="/alerts"
            element={<Alerts />}
          />

          {/* RECEIVER PAGES */}

          <Route
            path="/receiver-dashboard"
            element={<ReceiverDashboard />}
          />

          <Route
            path="/my-requests"
            element={<MyRequests />}
          />

          <Route
            path="/nearby-donations"
            element={<NearbyDonations />}
          />

          <Route
            path="/browse"
            element={<BrowseFood />}
          />

          <Route
            path="/pickup-request"
            element={<PickupRequest />}
          />

          <Route
            path="/request-details"
            element={<RequestDetails />}
          />

          {/* COMMON PAGES */}

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/chat"
            element={<Chat />}
          />

        </Route>

        {/* ============================= */}
        {/* UNKNOWN ROUTES                */}
        {/* ============================= */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;