
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  notifications: true,
  emailNotifications: true,
  darkMode: false,
  language: "English",
};

const translations = {
  English: {
    // Common navigation
    Settings: "Settings",
    Home: "Home",
    "Donor Dashboard": "Donor Dashboard",
    "Receiver Dashboard": "Receiver Dashboard",
    "Browse Food": "Browse Food",
    "My Requests": "My Requests",
    "Nearby Donations": "Nearby Donations",
    "My Donations": "My Donations",
    Requests: "Requests",
    Pickups: "Pickups",
    Chat: "Chat",
    Profile: "Profile",
    "My Profile": "My Profile",
    Logout: "Logout",
    Donor: "Donor",
    Receiver: "Receiver",

    // Profile
    Name: "Name",
    Email: "Email",
    Location: "Location",
    Phone: "Phone",
    "Edit Profile": "Edit Profile",
    "Save Profile": "Save Profile",
    "Change Password": "Change Password",
    Password: "Password",
    "Confirm Password": "Confirm Password",

    // Dashboard
    "Welcome back": "Welcome back",
    "Available Meals": "Available Meals",
    "My Donations": "My Donations",
    "My Requests": "My Requests",
    "Total Donations": "Total Donations",
    "Completed Donations": "Completed Donations",
    "Pending Donations": "Pending Donations",
    "Nearby Donors": "Nearby Donors",
    "Food Received": "Food Received",
    "Recent Donations": "Recent Donations",
    "Recent Requests": "Recent Requests",
    "Quick Actions": "Quick Actions",
    "View All": "View All",
    "View Details": "View Details",
    "View More": "View More",
    "Get Started": "Get Started",

    // Donations
    "Donate Food": "Donate Food",
    "Add Donation": "Add Donation",
    "Food Name": "Food Name",
    "Food Type": "Food Type",
    Quantity: "Quantity",
    Description: "Description",
    "Food Description": "Food Description",
    "Food Image": "Food Image",
    "Upload Image": "Upload Image",
    "Pickup Location": "Pickup Location",
    "Pickup Time": "Pickup Time",
    "Expiry Date": "Expiry Date",
    "Expiry Time": "Expiry Time",
    Submit: "Submit",
    "Submit Donation": "Submit Donation",
    Cancel: "Cancel",
    Delete: "Delete",
    Edit: "Edit",
    Search: "Search",
    "Search Food": "Search Food",
    Refresh: "Refresh",
    Filter: "Filter",
    "All Donations": "All Donations",
    "No Donations Found": "No Donations Found",
    "No Donations Available": "No Donations Available",
    "Donation Details": "Donation Details",
    "Delete Donation?": "Delete Donation?",
    "Are you sure?": "Are you sure?",
    "Donation Added Successfully": "Donation Added Successfully",
    "Donation Deleted Successfully": "Donation Deleted Successfully",

    // Requests
    "Request Food": "Request Food",
    "Send Request": "Send Request",
    "Food Requests": "Food Requests",
    "Request Details": "Request Details",
    "Request History": "Request History",
    "No Requests Found": "No Requests Found",
    "No Requests Yet": "No Requests Yet",
    "Request Date": "Request Date",
    "Requested Quantity": "Requested Quantity",
    "Requested Food": "Requested Food",
    "Accept Request": "Accept Request",
    "Reject Request": "Reject Request",
    "Cancel Request": "Cancel Request",
    "Request Submitted Successfully": "Request Submitted Successfully",
    "Request Accepted": "Request Accepted",
    "Request Rejected": "Request Rejected",

    // Pickups
    "Pickup Details": "Pickup Details",
    "Pickup Address": "Pickup Address",
    "Pickup Date": "Pickup Date",
    "Pickup Status": "Pickup Status",
    "Confirm Pickup": "Confirm Pickup",
    "Complete Pickup": "Complete Pickup",
    "No Pickups Found": "No Pickups Found",

    // Status
    Status: "Status",
    Pending: "Pending",
    Completed: "Completed",
    Available: "Available",
    Accepted: "Accepted",
    Rejected: "Rejected",
    Cancelled: "Cancelled",
    Reserved: "Reserved",
    Processing: "Processing",

    // Chat
    "Messages": "Messages",
    "Send Message": "Send Message",
    "Type a message": "Type a message",
    "No Messages": "No Messages",
    Online: "Online",
    Offline: "Offline",

    // Notifications
    Notifications: "Notifications",
    "No Notifications": "No Notifications",
    "Mark as Read": "Mark as Read",
    "Clear All": "Clear All",

    // Settings
    Appearance: "Appearance",
    "Dark Mode": "Dark Mode",
    "Dark Mode Description":
      "Use a dark appearance throughout the application.",
    "Light Mode": "Light Mode",
    "Light Mode Description":
      "Switch to light appearance.",
    "Notifications Description":
      "Manage your notification preferences.",
    "Email Notifications": "Email Notifications",
    "Email Description":
      "Receive important updates through email.",
    Language: "Language",
    "Language Description":
      "Choose your preferred language.",
    "Privacy & Security": "Privacy & Security",
    "Privacy Description":
      "Keep your account information safe and private.",
    "Saved Message":
      "Your preferences are saved automatically.",
    English: "English",
    Tamil: "Tamil",

    // General
    Loading: "Loading...",
    "Please Wait": "Please Wait",
    "Something went wrong": "Something went wrong",
    "Try Again": "Try Again",
    Back: "Back",
    "Go Back": "Go Back",
    Save: "Save",
    Update: "Update",
    Close: "Close",
    Yes: "Yes",
    No: "No",
    "No Data Found": "No Data Found",
    "No Results Found": "No Results Found",
    "Please Login": "Please Login",
    Success: "Success",
    Error: "Error",
  },

  Tamil: {
    // Common navigation
    Settings: "அமைப்புகள்",
    Home: "முகப்பு",
    "Donor Dashboard": "நன்கொடையாளர் முகப்பு",
    "Receiver Dashboard": "பெறுநர் முகப்பு",
    "Browse Food": "உணவுகளைப் பார்வையிடு",
    "My Requests": "எனது கோரிக்கைகள்",
    "Nearby Donations": "அருகிலுள்ள உணவு நன்கொடைகள்",
    "My Donations": "எனது நன்கொடைகள்",
    Requests: "கோரிக்கைகள்",
    Pickups: "உணவு பெறுதல்",
    Chat: "அரட்டை",
    Profile: "சுயவிவரம்",
    "My Profile": "எனது சுயவிவரம்",
    Logout: "வெளியேறு",
    Donor: "நன்கொடையாளர்",
    Receiver: "பெறுநர்",

    // Profile
    Name: "பெயர்",
    Email: "மின்னஞ்சல்",
    Location: "இருப்பிடம்",
    Phone: "தொலைபேசி",
    "Edit Profile": "சுயவிவரத்தைத் திருத்து",
    "Save Profile": "சுயவிவரத்தைச் சேமி",
    "Change Password": "கடவுச்சொல்லை மாற்று",
    Password: "கடவுச்சொல்",
    "Confirm Password": "கடவுச்சொல்லை உறுதிப்படுத்து",

    // Dashboard
    "Welcome back": "மீண்டும் வருக",
    "Available Meals": "கிடைக்கும் உணவுகள்",
    "Total Donations": "மொத்த நன்கொடைகள்",
    "Completed Donations": "நிறைவு செய்யப்பட்ட நன்கொடைகள்",
    "Pending Donations": "நிலுவையில் உள்ள நன்கொடைகள்",
    "Nearby Donors": "அருகிலுள்ள நன்கொடையாளர்கள்",
    "Food Received": "பெறப்பட்ட உணவுகள்",
    "Recent Donations": "சமீபத்திய நன்கொடைகள்",
    "Recent Requests": "சமீபத்திய கோரிக்கைகள்",
    "Quick Actions": "விரைவான செயல்கள்",
    "View All": "அனைத்தையும் பார்க்க",
    "View Details": "விவரங்களைப் பார்க்க",
    "View More": "மேலும் பார்க்க",
    "Get Started": "தொடங்கவும்",

    // Donations
    "Donate Food": "உணவு நன்கொடை",
    "Add Donation": "நன்கொடையைச் சேர்",
    "Food Name": "உணவின் பெயர்",
    "Food Type": "உணவு வகை",
    Quantity: "அளவு",
    Description: "விளக்கம்",
    "Food Description": "உணவு விளக்கம்",
    "Food Image": "உணவுப் படம்",
    "Upload Image": "படத்தைப் பதிவேற்று",
    "Pickup Location": "பெறும் இடம்",
    "Pickup Time": "பெறும் நேரம்",
    "Expiry Date": "காலாவதி தேதி",
    "Expiry Time": "காலாவதி நேரம்",
    Submit: "சமர்ப்பி",
    "Submit Donation": "நன்கொடையைச் சமர்ப்பி",
    Cancel: "ரத்து செய்",
    Delete: "நீக்கு",
    Edit: "திருத்து",
    Search: "தேடு",
    "Search Food": "உணவைத் தேடு",
    Refresh: "புதுப்பி",
    Filter: "வடிகட்டு",
    "All Donations": "அனைத்து நன்கொடைகள்",
    "No Donations Found": "நன்கொடைகள் எதுவும் இல்லை",
    "No Donations Available": "நன்கொடைகள் எதுவும் கிடைக்கவில்லை",
    "Donation Details": "நன்கொடை விவரங்கள்",
    "Delete Donation?": "நன்கொடையை நீக்கவா?",
    "Are you sure?": "நிச்சயமாகவா?",
    "Donation Added Successfully": "நன்கொடை வெற்றிகரமாகச் சேர்க்கப்பட்டது",
    "Donation Deleted Successfully": "நன்கொடை வெற்றிகரமாக நீக்கப்பட்டது",

    // Requests
    "Request Food": "உணவைக் கோரு",
    "Send Request": "கோரிக்கையை அனுப்பு",
    "Food Requests": "உணவுக் கோரிக்கைகள்",
    "Request Details": "கோரிக்கை விவரங்கள்",
    "Request History": "கோரிக்கை வரலாறு",
    "No Requests Found": "கோரிக்கைகள் எதுவும் இல்லை",
    "No Requests Yet": "இதுவரை கோரிக்கைகள் இல்லை",
    "Request Date": "கோரிக்கை தேதி",
    "Requested Quantity": "கோரப்பட்ட அளவு",
    "Requested Food": "கோரப்பட்ட உணவு",
    "Accept Request": "கோரிக்கையை ஏற்கவும்",
    "Reject Request": "கோரிக்கையை நிராகரிக்கவும்",
    "Cancel Request": "கோரிக்கையை ரத்து செய்",
    "Request Submitted Successfully": "கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது",
    "Request Accepted": "கோரிக்கை ஏற்கப்பட்டது",
    "Request Rejected": "கோரிக்கை நிராகரிக்கப்பட்டது",

    // Pickups
    "Pickup Details": "உணவு பெறும் விவரங்கள்",
    "Pickup Address": "பெறும் முகவரி",
    "Pickup Date": "பெறும் தேதி",
    "Pickup Status": "பெறும் நிலை",
    "Confirm Pickup": "உணவு பெற்றதை உறுதிப்படுத்து",
    "Complete Pickup": "உணவு பெறுதலை நிறைவு செய்",
    "No Pickups Found": "உணவு பெறுதல் எதுவும் இல்லை",

    // Status
    Status: "நிலை",
    Pending: "நிலுவையில்",
    Completed: "நிறைவு பெற்றது",
    Available: "கிடைக்கிறது",
    Accepted: "ஏற்கப்பட்டது",
    Rejected: "நிராகரிக்கப்பட்டது",
    Cancelled: "ரத்து செய்யப்பட்டது",
    Reserved: "ஒதுக்கப்பட்டது",
    Processing: "செயல்பாட்டில் உள்ளது",

    // Chat
    Messages: "செய்திகள்",
    "Send Message": "செய்தியை அனுப்பு",
    "Type a message": "செய்தியை உள்ளிடவும்",
    "No Messages": "செய்திகள் எதுவும் இல்லை",
    Online: "இணையத்தில் உள்ளார்",
    Offline: "இணையத்தில் இல்லை",

    // Notifications
    Notifications: "அறிவிப்புகள்",
    "No Notifications": "அறிவிப்புகள் எதுவும் இல்லை",
    "Mark as Read": "படித்ததாகக் குறி",
    "Clear All": "அனைத்தையும் நீக்கு",

    // Settings
    Appearance: "தோற்றம்",
    "Dark Mode": "இருண்ட பயன்முறை",
    "Dark Mode Description":
      "பயன்பாடு முழுவதும் இருண்ட தோற்றத்தைப் பயன்படுத்தவும்.",
    "Light Mode": "ஒளி பயன்முறை",
    "Light Mode Description":
      "வெளிச்சமான தோற்றத்திற்கு மாறவும்.",
    "Notifications Description":
      "உங்கள் அறிவிப்பு விருப்பங்களை நிர்வகிக்கவும்.",
    "Email Notifications": "மின்னஞ்சல் அறிவிப்புகள்",
    "Email Description":
      "முக்கியமான தகவல்களை மின்னஞ்சலில் பெறவும்.",
    Language: "மொழி",
    "Language Description":
      "உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்.",
    "Privacy & Security": "தனியுரிமை மற்றும் பாதுகாப்பு",
    "Privacy Description":
      "உங்கள் கணக்குத் தகவல்களைப் பாதுகாப்பாக வைத்திருங்கள்.",
    "Saved Message":
      "உங்கள் விருப்பங்கள் தானாகவே சேமிக்கப்படும்.",
    English: "ஆங்கிலம்",
    Tamil: "தமிழ்",

    // General
    Loading: "ஏற்றப்படுகிறது...",
    "Please Wait": "தயவுசெய்து காத்திருக்கவும்",
    "Something went wrong": "ஏதோ தவறு ஏற்பட்டுள்ளது",
    "Try Again": "மீண்டும் முயற்சி செய்",
    Back: "பின்செல்",
    "Go Back": "பின்செல்",
    Save: "சேமி",
    Update: "புதுப்பி",
    Close: "மூடு",
    Yes: "ஆம்",
    No: "இல்லை",
    "No Data Found": "தரவு எதுவும் இல்லை",
    "No Results Found": "முடிவுகள் எதுவும் இல்லை",
    "Please Login": "உள்நுழையவும்",
    Success: "வெற்றி",
    Error: "பிழை",
  },
};

// Get the current logged-in user's role.
function getCurrentRole() {
  try {
    const user = JSON.parse(
      localStorage.getItem("foodshare_user") || "{}"
    );

    const role = user?.role?.toLowerCase();

    if (role === "donor" || role === "receiver") {
      return role;
    }
  } catch (error) {
    console.error("Could not read current user:", error);
  }

  return "guest";
}

// Store settings separately for each role.
function getSettingsKey(role) {
  return `foodshare_settings_${role}`;
}

function loadSettingsForRole(role) {
  try {
    const saved = localStorage.getItem(getSettingsKey(role));

    if (saved) {
      return {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(saved),
      };
    }

    // Migrate old settings to donor settings.
    if (role === "donor") {
      const oldSettings = localStorage.getItem(
        "foodshare_settings"
      );

      if (oldSettings) {
        const migrated = {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(oldSettings),
        };

        localStorage.setItem(
          getSettingsKey("donor"),
          JSON.stringify(migrated)
        );

        return migrated;
      }
    }
  } catch (error) {
    console.error("Could not load FoodShare settings:", error);
  }

  return { ...DEFAULT_SETTINGS };
}

export function SettingsProvider({ children }) {
  const [activeRole, setActiveRole] = useState(getCurrentRole);

  const [settings, setSettings] = useState(() =>
    loadSettingsForRole(getCurrentRole())
  );

  // Sync settings when the logged-in user or role changes.
  useEffect(() => {
    const syncRole = () => {
      const nextRole = getCurrentRole();

      setActiveRole((previousRole) => {
        if (previousRole !== nextRole) {
          setSettings(loadSettingsForRole(nextRole));
          return nextRole;
        }

        return previousRole;
      });
    };

    window.addEventListener("foodshare-user-changed", syncRole);
    window.addEventListener("storage", syncRole);

    return () => {
      window.removeEventListener("foodshare-user-changed", syncRole);
      window.removeEventListener("storage", syncRole);
    };
  }, []);

  // Persist settings and apply the theme.
  useEffect(() => {
    try {
      localStorage.setItem(
        getSettingsKey(activeRole),
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("Could not save FoodShare settings:", error);
    }

    document.documentElement.classList.toggle(
      "dark",
      settings.darkMode
    );

    document.documentElement.dataset.theme = settings.darkMode
      ? "dark"
      : "light";
  }, [settings, activeRole]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // Translate a text key using the currently selected language.
  const t = (key) => {
    const language = settings.language === "Tamil" ? "Tamil" : "English";

    return (
      translations[language]?.[key] ??
      translations.English[key] ??
      key
    );
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        t,
        translations,
        activeRole,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return context;
}
