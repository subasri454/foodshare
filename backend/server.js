  const express = require("express");
  const cors = require("cors");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const multer = require("multer");
  const path = require("path");
  const fs = require("fs");
  require("dotenv").config();

const nodemailer = require("nodemailer");
const prisma = require("./prismaClient");

  const app = express();
  async function sendBrevoEmail({ to, subject, text }) {
  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        textContent: text,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo email error: ${error}`);
  }

  return response.json();
}

  // ==========================================
  // FOOD IMAGE UPLOAD CONFIGURATION
  // ==========================================

  const uploadDirectory = path.join(__dirname, "uploads");

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  // Multer storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDirectory);
    },

    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname);

      const uniqueName =
        "food-" +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1000000) +
        extension;

      cb(null, uniqueName);
    },
  });

  // Multer upload settings
  const upload = multer({
    storage: storage,

    limits: {
      fileSize: 5 * 1024 * 1024,
    },

    fileFilter: function (req, file, cb) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return cb(
          new Error("Only JPG and PNG images are allowed.")
        );
      }

      cb(null, true);
    },
  });

  // ==========================================
  // MIDDLEWARE
  // ==========================================

  app.use(cors());

  app.use(express.json());

  // Uploaded images can be accessed using /uploads/filename
  app.use(
    "/uploads",
    express.static(uploadDirectory)
  );

  // ==========================================
  // CONFIGURATION
  // ==========================================

  const JWT_SECRET =
    process.env.JWT_SECRET || "foodshare_secret_key";

  const PORT = process.env.PORT || 5000;


  // ==========================================
  // HELPER: SAFE USER DATA
  // ==========================================

  const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    profile_image: true,
    created_at: true,
  };

  // ==========================================
  // HOME
  // ==========================================

  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "FoodShare Backend is Running Successfully!",
    });
  });

  // ==========================================
  // TEST PRISMA + MYSQL
  // ==========================================

  app.get("/api/test-prisma", async (req, res) => {
    try {
      const users = await prisma.users.findMany({
        select: safeUserSelect,
      });

      res.json({
        success: true,
        message: "Prisma + MySQL connected successfully!",
        users,
      });
    } catch (error) {
      console.error("Prisma Error:", error);

      res.status(500).json({
        success: false,
        message: "Prisma database connection failed",
      });
    }
  });

 
   // ==========================================
  // REGISTER - DIRECT ACCOUNT CREATION (NO OTP)
  // ==========================================

  app.post("/api/register", async (req, res) => {
    try {
      const { name, email, password, phone, role } = req.body;

      // Validate required fields
      if (
        !name ||
        !email ||
        !password ||
        !role
      ) {
        return res.status(400).json({
          success: false,
          message: "Name, email, password and role are required",
        });
      }

      // Validate field types
      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        (phone != null && typeof phone !== "string") ||
        typeof role !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration details",
        });
      }

      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone =
        typeof phone === "string" ? phone.trim() : "";

      // Validate name and email
      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Please enter your name",
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address",
        });
      }

      // Validate password
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      // Validate role
      if (!["donor", "receiver"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be donor or receiver",
        });
      }

      // Check whether email is already registered
      const existingUser = await prisma.users.findUnique({
        where: {
          email: cleanEmail,
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered. Please log in.",
        });
      }

      // Hash password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the account directly in MySQL through Prisma
      const user = await prisma.users.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          phone: cleanPhone || null,
          role: role,
        },
        select: safeUserSelect,
      });

      return res.status(201).json({
        success: true,
        message: "Registration successful! You can now log in.",
        user,
      });
    } catch (error) {
      console.error("Registration Error:", error);

      // Handle duplicate email if two requests arrive together
      if (error.code === "P2002") {
        return res.status(409).json({
          success: false,
          message: "Email already registered. Please log in.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Registration failed. Please try again.",
      });
    }
  });

  // ==========================================
  // LOGIN
  // ==========================================

  app.post("/api/login", async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required",
        });
      }

      const cleanEmail =
        email.trim().toLowerCase();

      const user =
        await prisma.users.findUnique({
          where: {
            email: cleanEmail,
          },
        });

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile_image: user.profile_image,
      };

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: safeUser,
      });
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  });

  // ==========================================
  // AUTHENTICATION MIDDLEWARE
  // ==========================================

  const authenticateToken = (
    req,
    res,
    next
  ) => {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const parts =
      authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Use: Bearer <token>",
      });
    }

    const token = parts[1];

    try {
      const decoded =
        jwt.verify(
          token,
          JWT_SECRET
        );

      req.user = decoded;

      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }
  };

  // ==========================================
  // ROLE MIDDLEWARE
  // ==========================================

  const requireReceiver = (
    req,
    res,
    next
  ) => {
    if (
      req.user.role !==
      "receiver"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only receivers can perform this action",
      });
    }

    next();
  };

  const requireDonor = (
    req,
    res,
    next
  ) => {
    if (
      req.user.role !==
      "donor"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only donors can perform this action",
      });
    }

    next();
  };

  // ==========================================
  // CURRENT USER
  // ==========================================

  app.get(
    "/api/me",
    authenticateToken,
    async (req, res) => {
      try {
        const user =
          await prisma.users.findUnique({
            where: {
              id: req.user.id,
            },

            select: safeUserSelect,
          });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.json({
          success: true,
          user,
        });
      } catch (error) {
        console.error(
          "Me Error:",
          error
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to fetch current user",
        });
      }
    }
  );

  // ==========================================
  // PROFILE
  // ==========================================

  app.get(
    "/api/profile",
    authenticateToken,
    async (req, res) => {
      try {
        const user =
          await prisma.users.findUnique({
            where: {
              id: req.user.id,
            },

            select: safeUserSelect,
          });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.json({
          success: true,
          user,
        });
      } catch (error) {
        console.error(
          "Profile Error:",
          error
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to fetch profile",
        });
      }
    }
  );
  app.put(
  "/api/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const { name, email, location } = req.body;

      if (!name?.trim() || !email?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name and email are required",
        });
      }

      const updatedUser = await prisma.users.update({
        where: {
          id: req.user.id,
        },
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          location: location?.trim() || null,
        },
        select: safeUserSelect,
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Profile Update Error:", error);

      if (error.code === "P2002") {
        return res.status(409).json({
          success: false,
          message: "This email is already registered",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  }
);

  // ==========================================
  // CREATE FOOD REQUEST
  // ==========================================

  app.post(
    "/api/food-requests",
    authenticateToken,
    requireReceiver,
    async (req, res) => {
      try {
        const {
          food_name,
          quantity,
        } = req.body;

        if (
          typeof food_name !== "string" ||
          !food_name.trim() ||
          typeof quantity !== "string" ||
          !quantity.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Food name and quantity are required",
          });
        }

        if (
          food_name.trim().length > 150 ||
          quantity.trim().length > 100
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Food name or quantity is too long",
          });
        }

        const foodRequest =
          await prisma.food_requests.create({
            data: {
              food_name:
                food_name.trim(),

              quantity:
                quantity.trim(),

              receiver_id:
                req.user.id,
            },
          });

        res.status(201).json({
          success: true,
          message:
            "Food request created successfully",
          request:
            foodRequest,
        });
      } catch (error) {
        console.error(
          "Create Food Request Error:",
          error
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to create food request",
        });
      }
    }
  );

  // ==========================================
  // GET ALL FOOD REQUESTS
  // ==========================================

  app.get(
    "/api/food-requests",
    authenticateToken,
    requireReceiver,
    async (req, res) => {
      try {
        const requests =
          await prisma.food_requests.findMany({
            where: {
              receiver_id:
                req.user.id,
            },

            orderBy: {
              created_at: "desc",
            },
          });

        res.json({
          success: true,
          count:
            requests.length,
          requests,
        });
      } catch (error) {
        console.error(
          "Get Food Requests Error:",
          error
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to fetch food requests",
        });
      }
    }
  );

  // ==========================================
  // GET SINGLE FOOD REQUEST
  // ==========================================

  app.get(
    "/api/food-requests/:id",
    authenticateToken,
    async (req, res) => {
      try {
        const requestId =
          Number(req.params.id);

        if (
          !Number.isInteger(requestId) ||
          requestId <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid food request ID",
          });
        }

        const foodRequest =
          await prisma.food_requests.findUnique({
            where: {
              id: requestId,
            },

            include: {
              receiver: {
                select:
                  safeUserSelect,
              },
            },
          });

        if (!foodRequest) {
          return res.status(404).json({
            success: false,
            message:
              "Food request not found",
          });
        }

        if (
          req.user.role === "receiver" &&
          foodRequest.receiver_id !==
            req.user.id
        ) {
          return res.status(403).json({
            success: false,
            message:
              "You cannot access another receiver's request",
          });
        }

        res.json({
          success: true,
          request:
            foodRequest,
        });
      } catch (error) {
        console.error(
          "Get Food Request Error:",
          error
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to fetch food request",
        });
      }
    }
  );

  // ==========================================
  // CANCEL FOOD REQUEST
  // ==========================================

  app.patch(
    "/api/food-requests/:id/cancel",
    authenticateToken,
    requireReceiver,
    async (req, res) => {
      try {
        const requestId =
          Number(req.params.id);

        if (
          !Number.isInteger(requestId) ||
          requestId <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid food request ID",
          });
        }

        const foodRequest =
          await prisma.food_requests.findUnique({
            where: {
              id: requestId,
            },
          });

        if (!foodRequest) {
          return res.status(404).json({
            success: false,
            message:
              "Food request not found",
          });
        }

        if (
          foodRequest.receiver_id !==
          req.user.id
        ) {
          return res.status(403).json({
            success: false,
            message:
              "You cannot cancel another receiver's request",
          });
        }

        if (
          foodRequest.status !==
          "pending"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Only pending requests can be cancelled",
          });
        }

        const updatedRequest =
          await prisma.food_requests.update({
            where: {
              id: requestId,
            },

            data: {
              status:
                "cancelled",
            },
          });

        res.json({
          success: true,
          message:
            "Food request cancelled successfully",
          request:
            updatedRequest,
        });
      } catch (error) {
        console.error(
          "Cancel Food Request Error:",
          error
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to cancel food request",
        });
      }
    }
  );

  // ==========================================
  // FOOD DONATIONS
  // ==========================================

  // ==========================================
  // CREATE FOOD DONATION
  // ==========================================


app.post(
  "/api/donations",
  authenticateToken,
  requireDonor,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        food_name,
        description,
        detailed_description,
        food_type,
        food_condition,
        food_category,
        quantity,
        location,
        preparation_date,
        preparation_time,
        expiry_date,
        expiry_time,
        fresh_for,
        ingredients,
        allergens,
        pickup_date,
        pickup_time,
        pickup_instructions,
        contact_person,
        contact_phone,
        alternate_phone,
        email,
      } = req.body;

      if (
        typeof food_name !== "string" ||
        !food_name.trim() ||
        typeof quantity !== "string" ||
        !quantity.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Food name and quantity are required.",
        });
      }

      // Convert an optional date string to a valid Date object.
      const parseDate = (value) => {
        if (!value || typeof value !== "string") return null;

        const dateOnly = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!dateOnly) return null;

        const year = Number(dateOnly[1]);
        const month = Number(dateOnly[2]);
        const day = Number(dateOnly[3]);
        const date = new Date(Date.UTC(year, month - 1, day));

        if (
          date.getUTCFullYear() !== year ||
          date.getUTCMonth() !== month - 1 ||
          date.getUTCDate() !== day
        ) {
          return null;
        }

        return date;
      };

      const optionalText = (value) =>
        typeof value === "string" && value.trim()
          ? value.trim()
          : null;

      const imagePath = req.file
        ? `/uploads/${req.file.filename}`
        : null;

      const donation = await prisma.food_donations.create({
        data: {
          donor_id: req.user.id,
          food_name: food_name.trim(),
          description: optionalText(description),
          detailed_description: optionalText(detailed_description),
          food_type: optionalText(food_type),
          food_condition: optionalText(food_condition),
          food_category: optionalText(food_category),
          quantity: quantity.trim(),
          location: optionalText(location),
          image: imagePath,
          preparation_date: parseDate(preparation_date),
          preparation_time: optionalText(preparation_time),
          expiry_date: parseDate(expiry_date),
          expiry_time: optionalText(expiry_time),
          fresh_for: optionalText(fresh_for),
          ingredients: optionalText(ingredients),
          allergens: optionalText(allergens),
          pickup_date: parseDate(pickup_date),
          pickup_time: optionalText(pickup_time),
          pickup_instructions: optionalText(pickup_instructions),
          contact_person: optionalText(contact_person),
          contact_phone: optionalText(contact_phone),
          alternate_phone: optionalText(alternate_phone),
          email: optionalText(email),
        },
        include: {
          donor: {
            select: safeUserSelect,
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: "Food donation created successfully",
        donation,
      });
    } catch (error) {
      console.error("Create donation error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create food donation.",
      });
    }
  }
);

  // ==========================================
  // GET ALL AVAILABLE DONATIONS
  // ==========================================

  app.get(
    "/api/donations",
    authenticateToken,
    async (req, res) => {
      try {
        const donations =
          await prisma.food_donations.findMany({
            where: {
              status:
                "available",
            },

            include: {
              donor: {
                select:
                  safeUserSelect,
              },
            },

            orderBy: {
              created_at:
                "desc",
            },
          });

        res.json({
          success: true,
          count:
            donations.length,
          donations,
        });
      } catch (error) {
        console.error(
          "Get Donations Error:",
          error
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to fetch donations",
        });
      }
    }
  );

  // ==========================================
  // GET MY DONATIONS
  // ==========================================

  app.get(
    "/api/donations/my",
    authenticateToken,
    requireDonor,
    async (req, res) => {
      try {
        const donations =
          await prisma.food_donations.findMany({
            where: {
              donor_id:
                req.user.id,
            },

            orderBy: {
              created_at:
                "desc",
            },
          });

        res.json({
          success: true,
          count:
            donations.length,
          donations,
        });
      } catch (error) {
        console.error(
          "Get My Donations Error:",
          error
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to fetch your donations",
        });
      }
    }
  );

  // ==========================================
  // GET SINGLE DONATION
  // ==========================================

  app.get(
    "/api/donations/:id",
    authenticateToken,
    async (req, res) => {
      try {
        const donationId =
          Number(req.params.id);

        if (
          !Number.isInteger(donationId) ||
          donationId <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid donation ID",
          });
        }

        const donation =
          await prisma.food_donations.findUnique({
            where: {
              id: donationId,
            },

            include: {
              donor: {
                select:
                  safeUserSelect,
              },
            },
          });

        if (!donation) {
          return res.status(404).json({
            success: false,
            message:
              "Donation not found",
          });
        }

        res.json({
          success: true,
          donation,
        });
      } catch (error) {
        console.error(
          "Get Donation Error:",
          error
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to fetch donation",
        });
      }
    }
  );

  // ==========================================
  // UPDATE DONATION STATUS
  // ==========================================

  app.patch(
    "/api/donations/:id/status",
    authenticateToken,
    requireDonor,
    async (req, res) => {
      try {
        const donationId =
          Number(req.params.id);

        const {
          status,
        } = req.body;

        const allowedStatuses = [
          "available",
          "reserved",
          "completed",
          "cancelled",
        ];

        if (
          !Number.isInteger(donationId) ||
          donationId <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid donation ID",
          });
        }

        if (
          !allowedStatuses.includes(
            status
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid donation status",
          });
        }

        const donation =
          await prisma.food_donations.findUnique({
            where: {
              id: donationId,
            },
          });

        if (!donation) {
          return res.status(404).json({
            success: false,
            message:
              "Donation not found",
          });
        }

        if (
          donation.donor_id !==
          req.user.id
        ) {
          return res.status(403).json({
            success: false,
            message:
              "You cannot update another donor's donation",
          });
        }

        const updatedDonation =
          await prisma.food_donations.update({
            where: {
              id: donationId,
            },

            data: {
              status,
            },
          });

        res.json({
          success: true,
          message:
            "Donation status updated successfully",
          donation:
            updatedDonation,
        });
      } catch (error) {
        console.error(
          "Update Donation Status Error:",
          error
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to update donation status",
        });
      }
    }
  );
  // ==========================================
  // DELETE MY DONATION
  // ==========================================

  app.delete(
    "/api/donations/:id",
    authenticateToken,
    requireDonor,
    async (req, res) => {
      try {
        const donationId = Number(req.params.id);

        if (!Number.isInteger(donationId) || donationId <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid donation ID",
          });
        }

        // Check that this donation belongs to the logged-in donor
        const donation = await prisma.food_donations.findFirst({
          where: {
            id: donationId,
            donor_id: req.user.id,
          },
        });

        if (!donation) {
          return res.status(404).json({
            success: false,
            message: "Donation not found or you do not have permission to delete it",
          });
        }

        // Delete the donation from the database
        await prisma.food_donations.delete({
          where: {
            id: donationId,
          },
        });

        return res.json({
          success: true,
          message: "Donation deleted successfully",
          id: donationId,
        });
      } catch (error) {
        console.error("Delete Donation Error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to delete donation",
        });
      }
    }
  );

  // ==========================================
  // PICKUP REQUESTS
  // ==========================================

  // GET PICKUP REQUESTS FOR DONOR OR RECEIVER
  app.get(
    "/api/pickup-requests",
    authenticateToken,
    async (req, res) => {
      try {
        let where = {};

        if (req.user.role === "donor") {
          where = {
            donation: {
              donor_id: req.user.id,
            },
          };
        } else if (req.user.role === "receiver") {
          where = {
            receiver_id: req.user.id,
          };
        } else {
          return res.status(403).json({
            success: false,
            message: "Access denied",
          });
        }

        const requests = await prisma.pickup_requests.findMany({
          where,
          include: {
            donation: {
              include: {
                donor: {
                  select: safeUserSelect,
                },
              },
            },
            receiver: {
              select: safeUserSelect,
            },
          },
          orderBy: {
            created_at: "desc",
          },
        });

        return res.json({
          success: true,
          count: requests.length,
          requests,
        });
      } catch (error) {
        console.error("Get Pickup Requests Error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch pickup requests",
        });
      }
    }
  );

  
  // ==========================================
  // CREATE PICKUP REQUEST
  // ==========================================

  app.post(
    "/api/pickup-requests",
    authenticateToken,
    requireReceiver,
    async (req, res) => {
      try {
        const donationId = Number(req.body.donation_id);

        if (!Number.isInteger(donationId) || donationId <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid donation ID",
          });
        }

        const donation = await prisma.food_donations.findUnique({
          where: { id: donationId },
        });

        if (!donation || donation.status !== "available") {
          return res.status(404).json({
            success: false,
            message: "This food donation is no longer available",
          });
        }

        // Avoid creating another active request for the same donation.
        const existingRequest = await prisma.pickup_requests.findFirst({
          where: {
            donation_id: donationId,
            receiver_id: req.user.id,
            status: {
              in: ["pending", "accepted"],
            },
          },
        });

        if (existingRequest) {
          return res.status(409).json({
            success: false,
            message: "You have already requested this donation",
            request: existingRequest,
          });
        }

        const request = await prisma.pickup_requests.create({
          data: {
            donation_id: donationId,
            receiver_id: req.user.id,
            status: "pending",
          },
          include: {
            donation: {
              include: {
                donor: { select: safeUserSelect },
              },
            },
            receiver: { select: safeUserSelect },
          },
        });

        return res.status(201).json({
          success: true,
          message: "Pickup request created successfully",
          request,
        });
      } catch (error) {
        console.error("Create Pickup Request Error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to create pickup request",
        });
      }
    }
  );

  app.patch(
    "/api/pickup-requests/:id/status",
    authenticateToken,
    requireDonor,
    async (req, res) => {
      try {
        const id = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid pickup request ID",
          });
        }

        if (!["accepted", "rejected", "completed"].includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid status",
          });
        }

        const request = await prisma.pickup_requests.findUnique({
          where: { id },
          include: { donation: true },
        });

        if (!request) {
          return res.status(404).json({
            success: false,
            message: "Pickup request not found",
          });
        }

        if (request.donation.donor_id !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: "You cannot update this pickup request",
          });
        }

        const allowed =
          (request.status === "pending" &&
            ["accepted", "rejected"].includes(status)) ||
          (request.status === "accepted" && status === "completed");

        if (!allowed) {
          return res.status(400).json({
            success: false,
            message: "This status change is not allowed",
          });
        }

        const updatedRequest = await prisma.$transaction(async (tx) => {
          const updated = await tx.pickup_requests.update({
            where: { id },
            data: { status },
          });

          if (status === "completed") {
            await tx.food_donations.update({
              where: { id: request.donation_id },
              data: { status: "completed" },
            });
          }

          return updated;
        });

        return res.json({
          success: true,
          message: `Pickup request marked as ${status}`,
          request: updatedRequest,
        });
      } catch (error) {
        console.error("Update pickup status error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to update pickup status",
        });
      }
    }
  );

  // ==========================================
  // CHAT CONTACTS
  // ==========================================

  app.get(
    "/api/chat/contacts",
    authenticateToken,
    async (req, res) => {
      try {
        const currentUserId = Number(req.user.id);

        const oppositeRole =
          req.user.role === "donor" ? "receiver" : "donor";

        const contacts = await prisma.users.findMany({
          where: {
            role: oppositeRole,
            id: { not: currentUserId },
          },
          select: {
            id: true,
            name: true,
            role: true,
            profile_image: true,
          },
          orderBy: {
            name: "asc",
          },
        });

        return res.json(contacts);
      } catch (error) {
        console.error("Chat contacts error:", error);

        return res.status(500).json({
          success: false,
          message: "Could not load contacts.",
        });
      }
    }
  );
 
  // ==========================================
  // CHAT MESSAGES - GET AND SEND
  // Paste before the 404 ROUTE
  // ==========================================

  // GET: Load conversation messages
  app.get(
    "/api/chat/:contactId/messages",
    authenticateToken,
    async (req, res) => {
      try {
        const currentUserId = Number(req.user.id);
        const contactId = Number(req.params.contactId);

        if (
          !Number.isInteger(contactId) ||
          contactId <= 0 ||
          contactId === currentUserId
        ) {
          return res.status(400).json({
            message: "Invalid contact ID.",
          });
        }

        const contact = await prisma.users.findUnique({
          where: { id: contactId },
          select: { id: true, role: true },
        });

        if (!contact) {
          return res.status(404).json({
            message: "Contact not found.",
          });
        }

        // Allow conversations only between donor and receiver.
        if (
          !["donor", "receiver"].includes(req.user.role) ||
          !["donor", "receiver"].includes(contact.role) ||
          req.user.role === contact.role
        ) {
          return res.status(403).json({
            message: "Chat is available between donors and receivers only.",
          });
        }

        const messages = await prisma.messages.findMany({
          where: {
            OR: [
              {
                sender_id: currentUserId,
                receiver_id: contactId,
              },
              {
                sender_id: contactId,
                receiver_id: currentUserId,
              },
            ],
          },
          orderBy: {
            created_at: "asc",
          },
        });

        return res.json(messages);
      } catch (error) {
        console.error("Load chat messages error:", error);

        return res.status(500).json({
          message: "Could not load messages.",
        });
      }
    }
  );

  // POST: Save a new message
  app.post(
    "/api/chat/:contactId/messages",
    authenticateToken,
    async (req, res) => {
      try {
        const currentUserId = Number(req.user.id);
        const contactId = Number(req.params.contactId);
        const messageText =
          typeof req.body.message === "string"
            ? req.body.message.trim()
            : "";

        if (
          !Number.isInteger(contactId) ||
          contactId <= 0 ||
          contactId === currentUserId
        ) {
          return res.status(400).json({
            message: "Invalid contact ID.",
          });
        }

        if (!messageText) {
          return res.status(400).json({
            message: "Please enter a message.",
          });
        }

        if (messageText.length > 5000) {
          return res.status(400).json({
            message: "Message must be 5000 characters or fewer.",
          });
        }

        const contact = await prisma.users.findUnique({
          where: { id: contactId },
          select: { id: true, role: true },
        });

        if (!contact) {
          return res.status(404).json({
            message: "Contact not found.",
          });
        }

        if (
          !["donor", "receiver"].includes(req.user.role) ||
          !["donor", "receiver"].includes(contact.role) ||
          req.user.role === contact.role
        ) {
          return res.status(403).json({
            message: "Chat is available between donors and receivers only.",
          });
        }

        const savedMessage = await prisma.messages.create({
          data: {
            sender_id: currentUserId,
            receiver_id: contactId,
            message: messageText,
          },
        });

        return res.status(201).json(savedMessage);
      } catch (error) {
        console.error("Send chat message error:", error);

        return res.status(500).json({
          message: "Could not send message.",
        });
      }
    }
  );

  

  // ==========================================
  // 404 ROUTE
  // Keep this AFTER all API routes.
  // ==========================================

  app.use((req, res) => {
    return res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // ==========================================
  // GLOBAL ERROR HANDLER
  // ==========================================

  app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image must be 5 MB or smaller",
      });
    }

    if (err.message === "Only JPG and PNG images are allowed.") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  });

  // ==========================================
  // START SERVER
  // ==========================================



app.listen(PORT, "0.0.0.0", () => {
  console.log(`FoodShare Backend running on port ${PORT}`);
});