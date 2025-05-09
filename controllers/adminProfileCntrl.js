const Profile = require("../models/adminProfileModel");
const generateCustomerId = require("../utlis/idGenerator.js");
const uploadSignature = require("../utlis/uploadSignature.js");
const { sendLoginPIN } = require("../utlis/sendOTP.js");
const jwt = require("jsonwebtoken");

const createProfile = async (req, res, profileType) => {
  try {
    console.log("📥 Incoming Request:");
    console.log("➡️ Profile Type:", profileType);
    console.log("➡️ Request Body:", req.body);
    console.log("➡️ Request User:", req.user);
    console.log("➡️ Files:", req.files);

    if (!req.files?.signature) {
      return res.status(400).json({ error: "No signature file uploaded" });
    }

    const signatureUrl = await uploadSignature(req.files.signature);

    const baseId = ["agent", "subagent", "user"].includes(profileType)
      ? req.user?.customerId
      : null;
    console.log("🆔 baseId used for ID generation:", baseId);

    const customerId = await generateCustomerId(profileType, baseId);
    console.log("✅ Generated customerId:", customerId);

    const pin = Math.floor(1000 + Math.random() * 9000);

    const amount =
      profileType === "customer"
        ? "100"
        : profileType === "agent"
          ? "250"
          : profileType === "subagent"
            ? "100"
            : "100";

    const profile = new Profile({
      profileType,
      customerId,
      ...req.body,
      amount,
      signatureUrl,
      pin,
    });

    await profile.save();

    if (req.body.email) {
      await sendLoginPIN(req.body.email, pin);
    }

    console.log("✅ Profile saved successfully:", customerId);

    return res.status(201).json({
      message: `${profileType} profile created successfully ✅`,
      customerId,
    });
  } catch (err) {
    console.error("❌ Error creating profile:", err);
    res.status(500).json({ error: "Server error occurred" });
  }
};

exports.createCustomerProfile = (req, res) =>
  createProfile(req, res, "customer");
exports.createShareholderProfile = (req, res) =>
  createProfile(req, res, "shareholder");
exports.createAgentProfile = (req, res) =>
  createProfile(req, res, "agent");

exports.createSubagentProfile = (req, res) =>
  createProfile(req, res, "subagent");
exports.createUserProfile = (req, res) => 
  createProfile(req, res, "user");

exports.fetchProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).send("Profile not found");

    res.json(profile);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.universalLogin = async (req, res) => {
  try {
    const { email, pin } = req.body;
    const profileType = req.path.split("-")[0].substring(1);

    if (!email || !pin) {
      return res.status(400).json({ error: "Email and PIN are required" });
    }

    const profileTypeMap = {
      subagent: "subagent",
      shareholder: "shareholder",
      agent: "agent",
      user: "user",
      customer: "customer", 
    };

    const user = await Profile.findOne({
      email,
      pin,
      profileType: profileTypeMap[profileType] || profileType,
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or PIN" });
    }

    const totalPaidAmount = user.paymentDetails?.reduce((sum, payment) => {
      return sum + (Number(payment.amount) || 0);
    }, 0);

    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        customerId: user.customerId,
        profileType: user.profileType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: `${user.profileType} login successful ✅`,
      token,
      user: {
        name: user.name,
        lastName: user.lastName,
        panNumber: user.panNumber,
        state: user.state,
        address: user.address,
        country: user.country,
        nominee: user.nominee,
        post_code: user.post_code,
        district: user.district,
        aadhaarNumber: user.aadhaarNumber,
        nominieeNumber: user.nominieeNumber,
        contactNumber: user.contactNumber,
        email: user.email,
        dob: user.dob,
        signatureUrl: user.signatureUrl,
        customerId: user.customerId,
        profileType: user.profileType,
        schemeType: user.schemeType,
        schemeDate: user.schemeDate,
        membershipFee: user.membershipFee,
        createdAt: user.createdAt,
        paymentDetails: user.paymentDetails,
        totalPaidAmount,
        paymentDetails: user.paymentDetails,
        totalPaidAmount,
      },
    });
    
    
  } catch (err) {
    console.error(`❌ ${req.path} Login error:`, err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getProfilesDetails = async (req, res) => {
  try {
    const { page = 1, limit = 10, profileType } = req.query;

    const query = {};

    if (profileType) {
      query.profileType = profileType;
    }

    const totalProfiles = await Profile.countDocuments(query);

    const profiles = await Profile.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      profiles,
      totalPages: Math.ceil(totalProfiles / limit),
      currentPage: Number(page),
      totalProfiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error while fetching profiles" });
  }
};


exports.getDetails = async (req, res) => {
  try {
    const { page = 1, limit = 10, profileType, customerId } = req.query;

    const query = {};
    if (profileType) {
      query.profileType = profileType;
    }

    if (customerId) {
      // Regex to match customerId like EMP33A24B1A, EMP33A24B2A etc.
      const regex = new RegExp(`^${customerId}\\d+[A-Z]$`);
      query.customerId = regex;

      const matchedProfiles = await Profile.find({ customerId: regex });

      if (!matchedProfiles.length) {
        return res.status(404).json({
          message: `No customerIds found matching pattern for base ID '${customerId}'`
        });
      }

      // Extract number-letter suffixes
      const suffixes = matchedProfiles.map(p => {
        const match = p.customerId.match(new RegExp(`^${customerId}(\\d+)([A-Z])$`));
        return match ? { num: parseInt(match[1]), letter: match[2] } : null;
      }).filter(Boolean);

      const letters = suffixes.map(s => s.letter);
      const highestLetter = letters.sort().reverse()[0];

      const nextLetter = String.fromCharCode(highestLetter.charCodeAt(0) + 1);
      const nextIdRegex = new RegExp(`^${customerId}\\d+${nextLetter}$`);
      const existsNext = await Profile.findOne({ customerId: nextIdRegex });

      // console.log("Matched full profiles:", matchedProfiles);

      if (existsNext) {
        return res.status(200).json({
          message: `Next ID with suffix '${nextLetter}' already exists. Stopping.`,
          stopAt: nextLetter,
          matchedProfiles
        });
      } else {
        return res.status(200).json({
          message: `Next ID can be with suffix '${nextLetter}'`,
          nextLetter,
          matchedProfiles
        });
      }
    }

    // Regular pagination logic
    const totalProfiles = await Profile.countDocuments(query);
    const profiles = await Profile.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      profiles,
      totalPages: Math.ceil(totalProfiles / limit),
      currentPage: Number(page),
      totalProfiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error while fetching profiles" });
  }
};
