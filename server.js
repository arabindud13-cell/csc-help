// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// src/server/storage.ts
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// src/data/defaults.ts
var DEFAULT_SHOP_SETTINGS = {
  shopName: "",
  shopNameBn: "",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  gstinOrReg: "",
  receiptFooterMessage: "Thank you for your visit! Please visit again.",
  currencySymbol: "\u20B9",
  upiId: "",
  smsSettings: {
    smsEnabled: true,
    smsLanguage: "both",
    gatewayProvider: "fast2sms",
    senderId: "RDMCTR"
  }
};
var DEFAULT_CATEGORIES = [
  { id: "cat-xerox", name: "Xerox", nameBn: "\u099C\u09C7\u09B0\u0995\u09CD\u09B8", icon: "Copy", color: "blue", isDefault: true },
  { id: "cat-print", name: "Print", nameBn: "\u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F", icon: "Printer", color: "indigo", isDefault: true },
  { id: "cat-photo", name: "Photo", nameBn: "\u09AB\u099F\u09CB", icon: "Camera", color: "cyan", isDefault: true },
  { id: "cat-online-form", name: "Online Form", nameBn: "\u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09AB\u09B0\u09CD\u09AE", icon: "FileText", color: "emerald", isDefault: true },
  { id: "cat-recharge", name: "Recharge", nameBn: "\u09B0\u09BF\u099A\u09BE\u09B0\u09CD\u099C", icon: "Smartphone", color: "violet", isDefault: true },
  { id: "cat-money-transfer", name: "Money Transfer", nameBn: "\u09AE\u09BE\u09A8\u09BF \u099F\u09CD\u09B0\u09BE\u09A8\u09CD\u09B8\u09AB\u09BE\u09B0", icon: "ArrowRightLeft", color: "amber", isDefault: true },
  { id: "cat-banking", name: "Banking Service", nameBn: "\u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09BF\u0982 \u09B8\u09C7\u09AC\u09BE (AEPS)", icon: "Building2", color: "teal", isDefault: true },
  { id: "cat-ticket", name: "Ticket Booking", nameBn: "\u099F\u09BF\u0995\u09BF\u099F \u09AC\u09C1\u0995\u09BF\u0982", icon: "Ticket", color: "orange", isDefault: true },
  { id: "cat-lamination", name: "Lamination", nameBn: "\u09B2\u09C7\u09AE\u09BF\u09A8\u09C7\u09B6\u09A8", icon: "Layers", color: "purple", isDefault: true },
  { id: "cat-scan", name: "Scan", nameBn: "\u09B8\u09CD\u0995\u09CD\u09AF\u09BE\u09A8", icon: "Scan", color: "sky", isDefault: true },
  { id: "cat-passport-photo", name: "Passport Photo", nameBn: "\u09AA\u09BE\u09B8\u09AA\u09CB\u09B0\u09CD\u099F \u09AB\u099F\u09CB", icon: "UserCheck", color: "rose", isDefault: true },
  { id: "cat-pancard", name: "PAN Card Service", nameBn: "\u09AA\u09CD\u09AF\u09BE\u09A8 \u0995\u09BE\u09B0\u09CD\u09A1 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8", icon: "CreditCard", color: "amber", isDefault: true },
  { id: "cat-aadhaar-voter", name: "Aadhaar & Voter", nameBn: "\u0986\u09A7\u09BE\u09B0 \u0993 \u09AD\u09CB\u099F\u09BE\u09B0 \u09B8\u09C7\u09AC\u09BE", icon: "FileCheck", color: "emerald", isDefault: true },
  { id: "cat-electricity-bill", name: "Electricity / Bill Pay", nameBn: "\u09AC\u09BF\u09A6\u09CD\u09AF\u09C1\u09CE \u09AC\u09BF\u09B2 \u0993 \u09B0\u09BF\u099A\u09BE\u09B0\u09CD\u099C", icon: "Zap", color: "yellow", isDefault: true },
  { id: "cat-pvc-card", name: "PVC Card Print", nameBn: "\u09AA\u09BF\u09AD\u09BF\u09B8\u09BF \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F \u0995\u09BE\u09B0\u09CD\u09A1", icon: "CreditCard", color: "blue", isDefault: true },
  { id: "cat-certificates", name: "Certificates Apply", nameBn: "\u09B8\u09BE\u09B0\u09CD\u099F\u09BF\u09AB\u09BF\u0995\u09C7\u099F \u0986\u09AC\u09C7\u09A6\u09A8", icon: "Award", color: "cyan", isDefault: true },
  { id: "cat-other", name: "Other", nameBn: "\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09C7\u09AC\u09BE", icon: "MoreHorizontal", color: "slate", isDefault: true }
];
function getTodayDateString() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function generateInitialData() {
  const today = getTodayDateString();
  const initialDailyBalance = {
    id: today,
    date: today,
    openingCash: 0,
    openingBank: 0,
    note: "Initial setup opening balance",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    userId: "user_default"
  };
  return {
    version: 1,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    shopSettings: { ...DEFAULT_SHOP_SETTINGS },
    categories: DEFAULT_CATEGORIES,
    dailyBalances: {
      [today]: initialDailyBalance
    },
    transactions: [],
    receipts: [],
    khataParties: [],
    khataEntries: [],
    smsLogs: [],
    users: [],
    simSmsQueue: []
  };
}
function generateCleanShopData(customSettings, userId) {
  const today = getTodayDateString();
  const uid = userId || "user_default";
  const initialDailyBalance = {
    id: today,
    date: today,
    openingCash: 0,
    openingBank: 0,
    note: "Initial setup opening balance",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    userId: uid
  };
  const name = customSettings?.shopName || "";
  const nameBn = customSettings?.shopNameBn || name;
  const owner = customSettings?.ownerName || name;
  const phone = customSettings?.phone || "";
  return {
    version: 1,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    shopSettings: {
      ...DEFAULT_SHOP_SETTINGS,
      shopName: name,
      shopNameBn: nameBn,
      ownerName: owner,
      phone,
      email: customSettings?.email || (phone ? `${phone}@shop.local` : ""),
      address: customSettings?.address || "",
      gstinOrReg: customSettings?.gstinOrReg || "",
      receiptFooterMessage: customSettings?.receiptFooterMessage || (name ? `Thank you for visiting ${name}! Please visit again.` : "Thank you for your visit! Please visit again."),
      currencySymbol: "\u20B9",
      upiId: customSettings?.upiId || "",
      ...customSettings || {}
    },
    categories: DEFAULT_CATEGORIES,
    dailyBalances: {
      [today]: initialDailyBalance
    },
    transactions: [],
    receipts: [],
    khataParties: [],
    khataEntries: [],
    smsLogs: [],
    simSmsQueue: [],
    users: uid !== "user_default" ? [
      {
        id: uid,
        email: customSettings?.email || (phone ? `${phone}@shop.local` : "owner@shop.local"),
        name: owner || name || "Shop Owner",
        shopName: name,
        role: "owner",
        phone,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ] : []
  };
}

// src/server/storage.ts
var DATA_DIR = path.resolve(process.cwd(), "data");
var DATA_FILE = path.join(DATA_DIR, "shop_data.json");
var USERS_FILE = path.join(DATA_DIR, "users.json");
function cleanMobile(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits.slice(-10);
}
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1e3, 32, "sha256").toString("hex");
}
function verifyPassword(password, salt, storedHash) {
  const hash = hashPassword(password, salt);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return hash === storedHash;
  }
}
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}
function getAllUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading users.json:", e);
    return [];
  }
}
function saveAllUsers(users) {
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error saving users.json:", e);
    return false;
  }
}
function findUserByMobile(mobile) {
  const normalized = cleanMobile(mobile);
  return getAllUsers().find((u) => cleanMobile(u.mobile) === normalized);
}
function findUserById(id) {
  return getAllUsers().find((u) => u.id === id);
}
function registerShopUser(shopName, mobile, password) {
  const trimmedName = shopName?.trim();
  const normalizedMobile = cleanMobile(mobile);
  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: "Please enter a valid Shop Name (at least 2 characters)." };
  }
  if (!normalizedMobile || normalizedMobile.length !== 10) {
    return { success: false, error: "Please enter a valid 10-digit Mobile Number." };
  }
  if (!password || password.length < 4) {
    return { success: false, error: "Password must be at least 4 characters long." };
  }
  const existing = findUserByMobile(normalizedMobile);
  if (existing) {
    return {
      success: false,
      error: `Mobile number ${normalizedMobile} is already registered to "${existing.shopName}". Please login instead.`
    };
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const newUserId = "user_" + normalizedMobile + "_" + Date.now().toString(36);
  const newAccount = {
    id: newUserId,
    shopName: trimmedName,
    mobile: normalizedMobile,
    salt,
    passwordHash,
    role: "owner",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const users = getAllUsers();
  users.push(newAccount);
  saveAllUsers(users);
  const initialShopData = generateCleanShopData({
    shopName: trimmedName,
    shopNameBn: trimmedName,
    ownerName: trimmedName,
    phone: normalizedMobile,
    email: `${normalizedMobile}@shop.local`,
    address: "",
    gstinOrReg: "",
    receiptFooterMessage: `Thank you for visiting ${trimmedName}! Please visit again.`,
    upiId: ""
  });
  saveShopData(initialShopData, newUserId);
  const userProfile = {
    id: newAccount.id,
    name: newAccount.shopName,
    shopName: newAccount.shopName,
    email: `${normalizedMobile}@shop.local`,
    phone: newAccount.mobile,
    role: newAccount.role,
    createdAt: newAccount.createdAt,
    token: `token_${newAccount.id}_${crypto.randomBytes(16).toString("hex")}`
  };
  return {
    success: true,
    user: userProfile,
    token: userProfile.token,
    shopData: initialShopData
  };
}
function loginShopUser(mobile, password) {
  const normalizedMobile = cleanMobile(mobile);
  if (!normalizedMobile || normalizedMobile.length !== 10) {
    return { success: false, error: "Please enter a valid 10-digit Mobile Number." };
  }
  if (!password) {
    return { success: false, error: "Please enter your password." };
  }
  const userAccount = findUserByMobile(normalizedMobile);
  if (!userAccount) {
    return {
      success: false,
      error: 'No account found with this Mobile Number. Please click "Register" to create an account.'
    };
  }
  const isValid = verifyPassword(password, userAccount.salt, userAccount.passwordHash);
  if (!isValid) {
    return { success: false, error: "Incorrect password. Please verify and try again." };
  }
  const userData = getShopData(userAccount.id);
  let needsSave = false;
  if (userData.shopSettings.shopName !== userAccount.shopName) {
    userData.shopSettings.shopName = userAccount.shopName;
    userData.shopSettings.shopNameBn = userData.shopSettings.shopNameBn || userAccount.shopName;
    needsSave = true;
  }
  if (!userData.shopSettings.phone || userData.shopSettings.phone !== userAccount.mobile) {
    userData.shopSettings.phone = userAccount.mobile;
    needsSave = true;
  }
  if (needsSave) {
    saveShopData(userData, userAccount.id);
  }
  const userProfile = {
    id: userAccount.id,
    name: userAccount.shopName,
    shopName: userAccount.shopName,
    email: `${normalizedMobile}@shop.local`,
    phone: userAccount.mobile,
    role: userAccount.role,
    createdAt: userAccount.createdAt,
    token: `token_${userAccount.id}_${crypto.randomBytes(16).toString("hex")}`
  };
  return {
    success: true,
    user: userProfile,
    token: userProfile.token,
    shopData: userData
  };
}
function getUserDataFilePath(userId) {
  ensureDataDir();
  if (!userId || userId === "default") {
    return DATA_FILE;
  }
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(DATA_DIR, `user_data_${safeId}.json`);
}
function getShopData(userId) {
  ensureDataDir();
  const filePath = getUserDataFilePath(userId);
  try {
    if (!fs.existsSync(filePath)) {
      if (userId && userId !== "default") {
        const userAccount = findUserById(userId);
        const initial2 = generateCleanShopData({
          shopName: userAccount?.shopName || "Online Center",
          shopNameBn: userAccount?.shopName || "\u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09B8\u09C7\u09A8\u09CD\u099F\u09BE\u09B0",
          ownerName: userAccount?.shopName || "Shop Owner",
          phone: userAccount?.mobile || ""
        }, userId);
        fs.writeFileSync(filePath, JSON.stringify(initial2, null, 2), "utf-8");
        return initial2;
      }
      const initial = generateInitialData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    if (!parsed.khataParties) {
      parsed.khataParties = [];
      parsed.khataEntries = [];
      saveShopData(parsed, userId);
    }
    if (userId) {
      const userAccount = findUserById(userId);
      if (userAccount && userAccount.shopName && parsed.shopSettings) {
        parsed.shopSettings.shopName = userAccount.shopName;
      }
    }
    return parsed;
  } catch (err) {
    console.error(`Error reading ${filePath}, falling back to initial data:`, err);
    return generateInitialData();
  }
}
function saveShopData(data, userId) {
  ensureDataDir();
  const filePath = getUserDataFilePath(userId);
  try {
    data.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    if (!userId || userId === "default") {
      if (filePath !== DATA_FILE) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
      }
    }
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}
function formatSimSmsMessage(templateLang, customerName, shopName, dueAmount) {
  const formattedAmt = dueAmount.toLocaleString("en-IN");
  if (templateLang === "bn") {
    return `\u09AA\u09CD\u09B0\u09BF\u09AF\u09BC ${customerName}, \u0986\u09AA\u09A8\u09BE\u09B0 ${shopName} \u09A6\u09CB\u0995\u09BE\u09A8\u09C7 \u20B9${formattedAmt} \u099F\u09BE\u0995\u09BE \u09A7\u09BE\u09B0 \u09AC\u09BE\u0995\u09BF \u09B0\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09B8\u09AE\u09AF\u09BC\u09AE\u09A4\u09CB \u099F\u09BE\u0995\u09BE \u09AA\u09B0\u09BF\u09B6\u09CB\u09A7 \u0995\u09B0\u09C1\u09A8\u0964 \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6\u0964`;
  }
  if (templateLang === "hi") {
    return `\u092A\u094D\u0930\u093F\u092F ${customerName}, ${shopName} \u092E\u0947\u0902 \u0906\u092A\u0915\u093E \u20B9${formattedAmt} \u092C\u0915\u093E\u092F\u093E \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u0938\u092E\u092F \u092A\u0930 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0930\u0947\u0902\u0964 \u0927\u0928\u094D\u092F\u0935\u093E\u0926\u0964`;
  }
  return `Dear ${customerName}, you have \u20B9${formattedAmt} pending at ${shopName}. Please make the payment at your earliest convenience. Thank you.`;
}
function createSimSmsRequest(params) {
  const userId = params.userId || "default";
  const shopData = getShopData(userId);
  const normalizedMobile = cleanMobile(params.customerMobile);
  if (!normalizedMobile || normalizedMobile.length !== 10) {
    return { success: false, error: "Invalid 10-digit customer mobile number." };
  }
  const effectiveShopName = params.shopName || shopData.shopSettings?.shopName || "Online Center";
  const effectiveLang = params.language || "bn";
  const effectiveAmount = Math.max(0, Number(params.dueAmount) || 0);
  const effectiveType = params.transactionType || "Due";
  const effectiveDateTime = params.dateTime || (/* @__PURE__ */ new Date()).toISOString();
  const generatedMessage = params.message && params.message.trim().length > 0 ? params.message.trim() : formatSimSmsMessage(effectiveLang, params.customerName, effectiveShopName, effectiveAmount);
  const queue = shopData.simSmsQueue || [];
  const isDuplicate = queue.some(
    (q) => q.status === "Pending" && q.customerMobile === normalizedMobile && Math.abs(Number(q.dueAmount) - effectiveAmount) < 0.01 && Date.now() - new Date(q.createdAt).getTime() < 3e4
  );
  if (isDuplicate) {
    const existing = queue.find((q) => q.status === "Pending" && q.customerMobile === normalizedMobile);
    return { success: true, request: existing };
  }
  const newRequestId = "sim_sms_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const newRequest = {
    id: newRequestId,
    userId,
    partyId: params.partyId,
    entryId: params.entryId,
    customerName: params.customerName.trim(),
    customerMobile: normalizedMobile,
    shopName: effectiveShopName,
    dueAmount: effectiveAmount,
    remainingBalance: params.remainingBalance !== void 0 ? params.remainingBalance : effectiveAmount,
    transactionType: effectiveType,
    dateTime: effectiveDateTime,
    status: "Pending",
    language: effectiveLang,
    message: generatedMessage,
    createdAt: now,
    updatedAt: now
  };
  shopData.simSmsQueue = [newRequest, ...queue];
  saveShopData(shopData, userId);
  return { success: true, request: newRequest };
}
function getSimSmsRequests(userId) {
  const shopData = getShopData(userId || "default");
  return shopData.simSmsQueue || [];
}
function updateSimSmsStatus(params) {
  const userId = params.userId || "default";
  const shopData = getShopData(userId);
  const queue = shopData.simSmsQueue || [];
  const index = queue.findIndex((q) => q.id === params.requestId);
  if (index === -1) {
    return { success: false, error: "SMS request not found." };
  }
  const existing = queue[index];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const updated = {
    ...existing,
    status: params.status,
    message: params.editedMessage || existing.message,
    sentAt: params.status === "Sent" ? params.sentAt || now : existing.sentAt,
    failedReason: params.failedReason || existing.failedReason,
    simSlot: params.simSlot !== void 0 ? params.simSlot : existing.simSlot,
    updatedAt: now
  };
  queue[index] = updated;
  shopData.simSmsQueue = queue;
  if (params.status === "Sent") {
    const newLog = {
      id: "sms_sim_" + Date.now(),
      transactionId: existing.entryId,
      partyId: existing.partyId,
      recipientName: existing.customerName,
      recipientPhone: existing.customerMobile,
      message: updated.message,
      type: existing.transactionType === "Due" ? "manual_reminder" : "payment_received",
      status: "delivered",
      amount: existing.dueAmount,
      balance: existing.remainingBalance,
      gateway: `Shopkeeper Phone SIM (SIM ${params.simSlot || 1})`,
      createdAt: now
    };
    shopData.smsLogs = [newLog, ...shopData.smsLogs || []];
  }
  saveShopData(shopData, userId);
  return { success: true, request: updated };
}
function deleteSimSmsRequest(requestId, userId) {
  const effectiveUserId = userId || "default";
  const shopData = getShopData(effectiveUserId);
  const queue = shopData.simSmsQueue || [];
  const filtered = queue.filter((q) => q.id !== requestId);
  if (filtered.length === queue.length) return false;
  shopData.simSmsQueue = filtered;
  saveShopData(shopData, effectiveUserId);
  return true;
}

// src/server/smsService.ts
var otpStore = /* @__PURE__ */ new Map();
function normalizePhoneNumber(input) {
  if (!input) return "";
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits.slice(-10);
}
function formatE164(phone) {
  const norm = normalizePhoneNumber(phone);
  return norm ? `+91${norm}` : "";
}
function getEffectiveSmsSettings() {
  const shopData = getShopData();
  const dbSettings = shopData.shopSettings?.smsSettings || {
    smsEnabled: true,
    smsLanguage: "both",
    gatewayProvider: "fast2sms",
    senderId: "RDMCTR"
  };
  return {
    smsEnabled: dbSettings.smsEnabled ?? true,
    smsLanguage: dbSettings.smsLanguage || "both",
    gatewayProvider: process.env.SMS_GATEWAY_PROVIDER || dbSettings.gatewayProvider || "fast2sms",
    senderId: dbSettings.senderId || "RDMCTR",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || dbSettings.twilioAccountSid || "",
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || dbSettings.twilioAuthToken || "",
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || dbSettings.twilioPhoneNumber || "",
    fast2smsApiKey: process.env.FAST2SMS_API_KEY || dbSettings.fast2smsApiKey || "",
    msg91AuthKey: process.env.MSG91_AUTH_KEY || dbSettings.msg91AuthKey || "",
    msg91TemplateId: process.env.MSG91_TEMPLATE_ID || dbSettings.msg91TemplateId || ""
  };
}
async function sendSmsDirect(phone, message, customSettings) {
  const cleanPhone = normalizePhoneNumber(phone);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return {
      success: false,
      gateway: "none",
      status: "failed",
      error: `Invalid 10-digit mobile number: "${phone}"`
    };
  }
  const settings = {
    ...getEffectiveSmsSettings(),
    ...customSettings || {}
  };
  const provider = settings.gatewayProvider;
  if (provider === "fast2sms") {
    const apiKey = settings.fast2smsApiKey?.trim();
    if (!apiKey) {
      return {
        success: false,
        gateway: "Fast2SMS",
        status: "failed",
        error: "Fast2SMS API Key is not configured. Please enter your API key in Settings > SMS Gateway or set FAST2SMS_API_KEY."
      };
    }
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          route: "q",
          message,
          language: /[\u0980-\u09FF]/.test(message) ? "unicode" : "english",
          numbers: cleanPhone
        })
      });
      const result = await response.json();
      if (response.ok && (result.return === true || result.status_code === 200)) {
        return {
          success: true,
          gateway: "Fast2SMS",
          messageId: result.request_id || `f2s-${Date.now()}`,
          status: "delivered"
        };
      }
      return {
        success: false,
        gateway: "Fast2SMS",
        status: "failed",
        error: result.message || (Array.isArray(result.message) ? result.message.join(", ") : "Fast2SMS API rejected request")
      };
    } catch (err) {
      return {
        success: false,
        gateway: "Fast2SMS",
        status: "failed",
        error: `Fast2SMS network failure: ${err.message}`
      };
    }
  }
  if (provider === "twilio") {
    const sid = settings.twilioAccountSid?.trim();
    const token = settings.twilioAuthToken?.trim();
    const fromPhone = settings.twilioPhoneNumber?.trim();
    if (!sid || !token || !fromPhone) {
      return {
        success: false,
        gateway: "Twilio",
        status: "failed",
        error: "Twilio credentials missing. Please set Account SID, Auth Token, and Twilio Phone Number in Settings > SMS Gateway or .env."
      };
    }
    try {
      const e164To = formatE164(cleanPhone);
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const basicAuth = Buffer.from(`${sid}:${token}`).toString("base64");
      const params = new URLSearchParams();
      params.append("To", e164To);
      params.append("From", fromPhone);
      params.append("Body", message);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });
      const result = await response.json();
      if (response.ok && result.sid) {
        return {
          success: true,
          gateway: "Twilio",
          messageId: result.sid,
          status: "sent"
        };
      }
      return {
        success: false,
        gateway: "Twilio",
        status: "failed",
        error: result.message || `Twilio error code: ${result.code || response.status}`
      };
    } catch (err) {
      return {
        success: false,
        gateway: "Twilio",
        status: "failed",
        error: `Twilio network failure: ${err.message}`
      };
    }
  }
  if (provider === "msg91") {
    const authKey = settings.msg91AuthKey?.trim();
    if (!authKey) {
      return {
        success: false,
        gateway: "MSG91",
        status: "failed",
        error: "MSG91 Auth Key is not configured. Please enter your Auth Key in Settings > SMS Gateway or set MSG91_AUTH_KEY."
      };
    }
    try {
      const response = await fetch("https://api.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: {
          authkey: authKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          flow_id: settings.msg91TemplateId || "default",
          sender: settings.senderId || "RDMCTR",
          mobiles: `91${cleanPhone}`,
          message
        })
      });
      const result = await response.json();
      if (response.ok && (result.type === "success" || result.status === "success")) {
        return {
          success: true,
          gateway: "MSG91",
          messageId: result.message_id || `msg91-${Date.now()}`,
          status: "sent"
        };
      }
      return {
        success: false,
        gateway: "MSG91",
        status: "failed",
        error: result.message || "MSG91 rejected request"
      };
    } catch (err) {
      return {
        success: false,
        gateway: "MSG91",
        status: "failed",
        error: `MSG91 network failure: ${err.message}`
      };
    }
  }
  return {
    success: false,
    gateway: provider || "Unknown",
    status: "failed",
    error: `Unsupported gateway provider: ${provider}`
  };
}
function recordSmsLog(entry) {
  const shopData = getShopData();
  const id = "sms-log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
  const newLog = {
    ...entry,
    id,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const existingLogs = shopData.smsLogs || [];
  shopData.smsLogs = [newLog, ...existingLogs];
  saveShopData(shopData);
  return newLog;
}
function updateSmsLog(logId, updates) {
  const shopData = getShopData();
  const existingLogs = shopData.smsLogs || [];
  const index = existingLogs.findIndex((l) => l.id === logId);
  if (index === -1) return null;
  const updated = {
    ...existingLogs[index],
    ...updates,
    retriedAt: (/* @__PURE__ */ new Date()).toISOString(),
    retryCount: (existingLogs[index].retryCount || 0) + 1
  };
  existingLogs[index] = updated;
  shopData.smsLogs = existingLogs;
  saveShopData(shopData);
  return updated;
}
var OTP_EXPIRY_MS = 5 * 60 * 1e3;
var OTP_RESEND_COOLDOWN_MS = 45 * 1e3;
var MAX_VERIFICATION_ATTEMPTS = 5;
async function sendRegistrationOtp(phone, name) {
  const cleanPhone = normalizePhoneNumber(phone);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return {
      success: false,
      message: "Invalid mobile number. Please enter a valid 10-digit Indian phone number.",
      error: "INVALID_PHONE"
    };
  }
  const shopData = getShopData();
  const existingUser = (shopData.users || []).find(
    (u) => u.phone && normalizePhoneNumber(u.phone) === cleanPhone
  );
  if (existingUser) {
    return {
      success: false,
      message: `Mobile number ${cleanPhone} is already registered to user "${existingUser.name}". Please sign in instead.`,
      error: "DUPLICATE_MOBILE"
    };
  }
  const existingOtp = otpStore.get(cleanPhone);
  const now = Date.now();
  if (existingOtp && now < existingOtp.resendAfter) {
    const remainingSeconds = Math.ceil((existingOtp.resendAfter - now) / 1e3);
    return {
      success: false,
      message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
      resendCooldown: remainingSeconds,
      error: "RESEND_COOLDOWN"
    };
  }
  const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
  otpStore.set(cleanPhone, {
    phone: cleanPhone,
    otp: otpCode,
    expiresAt: now + OTP_EXPIRY_MS,
    resendAfter: now + OTP_RESEND_COOLDOWN_MS,
    attempts: 0,
    createdAt: now,
    name: name?.trim()
  });
  const smsSettings = getEffectiveSmsSettings();
  const shopName = shopData.shopSettings?.shopName || "Radha Madhab Online Center";
  let message = "";
  if (smsSettings.smsLanguage === "bn") {
    message = `${shopName} \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u09AA\u09A8\u09BE\u09B0 \u0993\u099F\u09BF\u09AA\u09BF (OTP) \u09B9\u09B2\u09CB ${otpCode}\u0964 \u09AE\u09C7\u09AF\u09BC\u09BE\u09A6 \u09EB \u09AE\u09BF\u09A8\u09BF\u099F\u0964 \u0995\u09BE\u0989\u0995\u09C7 \u098F\u099F\u09BF \u09B6\u09C7\u09AF\u09BC\u09BE\u09B0 \u0995\u09B0\u09AC\u09C7\u09A8 \u09A8\u09BE\u0964`;
  } else if (smsSettings.smsLanguage === "en") {
    message = `Your verification OTP for ${shopName} registration is ${otpCode}. Valid for 5 minutes. Do not share with anyone.`;
  } else {
    message = `Your verification OTP for ${shopName} registration is ${otpCode}. Valid for 5 mins.

${shopName} \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u09AD\u09C7\u09B0\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u0993\u099F\u09BF\u09AA\u09BF: ${otpCode} (\u09AE\u09C7\u09AF\u09BC\u09BE\u09A6 \u09EB \u09AE\u09BF\u09A8\u09BF\u099F)`;
  }
  const sendRes = await sendSmsDirect(cleanPhone, message, smsSettings);
  const logEntry = recordSmsLog({
    recipientPhone: cleanPhone,
    recipientName: name?.trim() || "New User Registration",
    type: "otp_registration",
    message,
    status: sendRes.status,
    gateway: sendRes.gateway,
    error: sendRes.error
  });
  return {
    success: sendRes.success,
    message: sendRes.success ? `Verification OTP sent to +91 ${cleanPhone}. Please verify within 5 minutes.` : `Failed to deliver OTP SMS via ${sendRes.gateway}: ${sendRes.error}`,
    resendCooldown: 45,
    logId: logEntry.id,
    error: sendRes.error
  };
}
async function verifyRegistrationOtp(phone, otp, name, _password) {
  const cleanPhone = normalizePhoneNumber(phone);
  const cleanOtp = otp?.trim();
  if (!cleanPhone || cleanPhone.length !== 10) {
    return {
      success: false,
      message: "Invalid mobile number.",
      error: "INVALID_PHONE"
    };
  }
  const record = otpStore.get(cleanPhone);
  if (!record) {
    return {
      success: false,
      message: 'No active OTP found for this number. Please click "Resend OTP".',
      error: "OTP_NOT_FOUND"
    };
  }
  const now = Date.now();
  if (now > record.expiresAt) {
    otpStore.delete(cleanPhone);
    return {
      success: false,
      message: "OTP has expired (validity is 5 minutes). Please request a new OTP.",
      error: "OTP_EXPIRED"
    };
  }
  record.attempts += 1;
  if (record.attempts > MAX_VERIFICATION_ATTEMPTS) {
    otpStore.delete(cleanPhone);
    return {
      success: false,
      message: "Maximum verification attempts exceeded. Please request a new OTP.",
      error: "MAX_ATTEMPTS_EXCEEDED"
    };
  }
  if (record.otp !== cleanOtp) {
    const remaining = MAX_VERIFICATION_ATTEMPTS - record.attempts;
    return {
      success: false,
      message: `Incorrect OTP. ${remaining} attempt(s) remaining.`,
      error: "INVALID_OTP"
    };
  }
  otpStore.delete(cleanPhone);
  const shopData = getShopData();
  const userName = (name || record.name || `User ${cleanPhone.slice(-4)}`).trim();
  const userEmail = `${cleanPhone}@radhamadhab.center`;
  const newUser = {
    id: "user-" + Date.now(),
    name: userName,
    shopName: shopData.shopSettings?.shopName || "Radhamadhab Online Center",
    email: userEmail,
    phone: cleanPhone,
    role: !shopData.users || shopData.users.length === 0 ? "owner" : "staff",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  shopData.users = [...shopData.users || [], newUser];
  saveShopData(shopData);
  return {
    success: true,
    message: "Mobile verification successful! Welcome to Radha Madhab Online Center.",
    user: newUser,
    token: "session-" + Date.now()
  };
}
function formatKhataTransactionSms(params, language = "both") {
  const { partyName, type, amount, currentBalance } = params;
  const formattedAmount = `\u20B9${Math.round(amount).toLocaleString("en-IN")}`;
  const formattedBalance = `\u20B9${Math.round(Math.abs(currentBalance)).toLocaleString("en-IN")}`;
  const customerName = partyName || "Customer";
  if (type === "you_got") {
    const enText = `Dear ${customerName}, we have received your payment of ${formattedAmount}. Your remaining due balance is ${formattedBalance}. Thank you for your payment. \u2013 Radha Madhab Online Center`;
    const bnText = `\u09AA\u09CD\u09B0\u09BF\u09AF\u09BC ${customerName}, \u0986\u09AE\u09B0\u09BE \u0986\u09AA\u09A8\u09BE\u09B0 ${formattedAmount} \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0997\u09CD\u09B0\u09B9\u09A3 \u0995\u09B0\u09C7\u099B\u09BF\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09AC\u09B6\u09BF\u09B7\u09CD\u099F \u09AC\u0995\u09C7\u09AF\u09BC\u09BE ${formattedBalance}\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6\u0964 \u2013 \u09B0\u09BE\u09A7\u09BE \u09AE\u09BE\u09A7\u09AC \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09B8\u09C7\u09A8\u09CD\u099F\u09BE\u09B0`;
    let text = enText;
    if (language === "bn") text = bnText;
    else if (language === "both") text = `${enText}

${bnText}`;
    return {
      subject: `Payment Received: ${formattedAmount}`,
      text
    };
  } else {
    const enText = `Dear ${customerName}, ${formattedAmount} has been added to your account. Your updated balance is ${formattedBalance}. Please check your account details. \u2013 Radha Madhab Online Center`;
    const bnText = `\u09AA\u09CD\u09B0\u09BF\u09AF\u09BC ${customerName}, \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09C7 ${formattedAmount} \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09AC\u0995\u09C7\u09AF\u09BC\u09BE ${formattedBalance}\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AC\u09BF\u09AC\u09B0\u09A3\u09C0 \u099A\u09C7\u0995 \u0995\u09B0\u09C1\u09A8\u0964 \u2013 \u09B0\u09BE\u09A7\u09BE \u09AE\u09BE\u09A7\u09AC \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09B8\u09C7\u09A8\u09CD\u099F\u09BE\u09B0`;
    let text = enText;
    if (language === "bn") text = bnText;
    else if (language === "both") text = `${enText}

${bnText}`;
    return {
      subject: `Account Updated: ${formattedAmount}`,
      text
    };
  }
}
async function sendKhataTransactionSms(params) {
  const { entryId, partyMobile, partyName, type, amount, currentBalance } = params;
  const cleanPhone = normalizePhoneNumber(partyMobile);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return {
      success: false,
      skipped: true,
      reason: `Customer phone number "${partyMobile}" is invalid or missing.`
    };
  }
  const shopData = getShopData();
  const smsSettings = getEffectiveSmsSettings();
  if (!smsSettings.smsEnabled) {
    return {
      success: false,
      skipped: true,
      reason: "Automatic SMS notifications are disabled in Settings."
    };
  }
  const existingLog = (shopData.smsLogs || []).find(
    (l) => l.transactionId === entryId && (l.status === "sent" || l.status === "delivered")
  );
  if (existingLog) {
    return {
      success: true,
      skipped: true,
      reason: "SMS already sent for this transaction entry.",
      log: existingLog
    };
  }
  const { text } = formatKhataTransactionSms(params, smsSettings.smsLanguage);
  const sendRes = await sendSmsDirect(cleanPhone, text, smsSettings);
  const logType = type === "you_got" ? "payment_received" : "payment_given";
  const logEntry = recordSmsLog({
    transactionId: entryId,
    partyId: params.partyId,
    recipientName: partyName,
    recipientPhone: cleanPhone,
    type: logType,
    amount,
    balance: currentBalance,
    message: text,
    status: sendRes.status,
    gateway: sendRes.gateway,
    error: sendRes.error
  });
  return {
    success: sendRes.success,
    log: logEntry,
    error: sendRes.error
  };
}
async function retrySmsDelivery(logId) {
  const shopData = getShopData();
  const log = (shopData.smsLogs || []).find((l) => l.id === logId);
  if (!log) {
    return {
      success: false,
      error: `SMS log entry "${logId}" not found.`
    };
  }
  const settings = getEffectiveSmsSettings();
  const sendRes = await sendSmsDirect(log.recipientPhone, log.message, settings);
  const updatedLog = updateSmsLog(logId, {
    status: sendRes.status,
    gateway: sendRes.gateway,
    error: sendRes.error || void 0
  });
  return {
    success: sendRes.success,
    log: updatedLog || log,
    error: sendRes.error
  };
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
app.use(express.json({ limit: "10mb" }));
app.get("/api/download-project-zip", (_req, res) => {
  try {
    const scriptPath = path2.resolve(__dirname, "scripts", "create_project_zip.py");
    const zipPath = path2.resolve(__dirname, "public", "radhamadhab-online-center-full-website.zip");
    if (fs2.existsSync(scriptPath)) {
      try {
        execSync("python3 scripts/create_project_zip.py", { cwd: __dirname, stdio: "ignore" });
      } catch (e) {
        console.warn("Zip script generation warning:", e);
      }
    }
    if (fs2.existsSync(zipPath)) {
      res.download(zipPath, "radhamadhab-online-center-full-website.zip");
    } else {
      res.status(404).json({ error: "Zip file not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to generate zip: " + err.message });
  }
});
app.use(express.static(path2.resolve(__dirname, "public")));
var extractUserId = (req) => {
  const queryUser = req.query.userId;
  if (queryUser) return queryUser;
  const headerUser = req.headers["x-user-id"];
  if (headerUser) return headerUser;
  const auth = req.headers["authorization"];
  if (typeof auth === "string" && auth.startsWith("Bearer token_")) {
    const raw = auth.replace("Bearer token_", "");
    const parts = raw.split("_");
    if (parts.length > 0) return parts[0];
  }
  if (req.body?.userId) return req.body.userId;
  return void 0;
};
app.get("/api/data", (req, res) => {
  const userId = extractUserId(req);
  const data = getShopData(userId);
  res.json({ success: true, data });
});
app.post("/api/data", (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: "Missing data payload" });
  }
  const userId = extractUserId(req);
  saveShopData(data, userId);
  res.json({ success: true, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/auth/register", (req, res) => {
  const { shopName, mobile, password } = req.body;
  if (!shopName || !mobile || !password) {
    return res.status(400).json({ success: false, error: "Shop Name, Mobile Number, and Password are required." });
  }
  const result = registerShopUser(shopName, mobile, password);
  return res.status(result.success ? 200 : 400).json(result);
});
app.post("/api/auth/login", (req, res) => {
  const { mobile, password, email } = req.body;
  const mobileInput = mobile || email;
  if (!mobileInput || !password) {
    return res.status(400).json({ success: false, error: "Mobile number and password are required." });
  }
  const result = loginShopUser(mobileInput, password);
  return res.status(result.success ? 200 : 400).json(result);
});
app.post("/api/backup/import", (req, res) => {
  const { backup } = req.body;
  if (!backup || !backup.shopSettings) {
    return res.status(400).json({ error: "Invalid backup" });
  }
  saveShopData(backup);
  res.json({ success: true, message: "Backup restored successfully" });
});
app.post("/api/reset", (req, res) => {
  const { mode } = req.body || {};
  const current = getShopData();
  const resetData = mode === "demo" ? generateInitialData() : generateCleanShopData(current?.shopSettings);
  saveShopData(resetData);
  res.json({ success: true, data: resetData });
});
app.get("/api/status", (_req, res) => {
  const current = getShopData();
  res.json({
    status: "online",
    shopName: current.shopSettings.shopName,
    lastUpdated: current.lastUpdated,
    totalTransactions: current.transactions.length
  });
});
app.post("/api/auth/send-registration-otp", async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: "Mobile number is required" });
  }
  try {
    const result = await sendRegistrationOtp(phone, name);
    return res.status(result.success ? 200 : result.error === "RESEND_COOLDOWN" ? 429 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/auth/verify-registration-otp", async (req, res) => {
  const { phone, otp, name, password } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: "Phone and OTP are required" });
  }
  try {
    const result = await verifyRegistrationOtp(phone, otp, name, password);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/sms/send-khata-transaction", async (req, res) => {
  const body = req.body;
  if (!body?.entryId || !body?.partyMobile) {
    return res.status(400).json({ success: false, error: "Missing required Khata transaction details" });
  }
  try {
    const result = await sendKhataTransactionSms(body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/sms/logs", (_req, res) => {
  const current = getShopData();
  res.json({ success: true, logs: current.smsLogs || [] });
});
app.post("/api/sms/retry", async (req, res) => {
  const { logId } = req.body;
  if (!logId) {
    return res.status(400).json({ success: false, error: "Missing logId" });
  }
  try {
    const result = await retrySmsDelivery(logId);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/sms/test", async (req, res) => {
  const { phone, message, customSettings } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ success: false, error: "Phone and test message are required" });
  }
  try {
    const sendRes = await sendSmsDirect(phone, message, customSettings);
    const logEntry = recordSmsLog({
      recipientName: "Test SMS Recipient",
      recipientPhone: phone,
      type: "test",
      message,
      status: sendRes.status,
      gateway: sendRes.gateway,
      error: sendRes.error
    });
    return res.status(sendRes.success ? 200 : 400).json({ ...sendRes, log: logEntry });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/sms/settings", (req, res) => {
  const { smsSettings } = req.body;
  if (!smsSettings) {
    return res.status(400).json({ error: "Missing smsSettings" });
  }
  const current = getShopData();
  current.shopSettings = {
    ...current.shopSettings,
    smsSettings
  };
  saveShopData(current);
  res.json({ success: true, smsSettings: current.shopSettings.smsSettings });
});
app.post("/api/sim-sms/create", (req, res) => {
  const uid = extractUserId(req);
  const { partyId, entryId, customerName, customerMobile, shopName, dueAmount, remainingBalance, transactionType, dateTime, language, message } = req.body;
  if (!customerName || !customerMobile || dueAmount === void 0) {
    return res.status(400).json({ success: false, error: "Customer Name, Customer Mobile, and Due Amount are required" });
  }
  try {
    const result = createSimSmsRequest({
      userId: uid,
      partyId,
      entryId,
      customerName,
      customerMobile,
      shopName,
      dueAmount: Number(dueAmount) || 0,
      remainingBalance: remainingBalance !== void 0 ? Number(remainingBalance) : void 0,
      transactionType: transactionType || "Due",
      dateTime: dateTime || (/* @__PURE__ */ new Date()).toISOString(),
      language: language || "bn",
      message
    });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/sim-sms/pending", (req, res) => {
  const uid = extractUserId(req);
  const requests = getSimSmsRequests(uid);
  const pending = requests.filter((r) => r.status === "Pending" || r.status === "Approved");
  res.json({ success: true, count: pending.length, requests: pending });
});
app.get("/api/sim-sms/all", (req, res) => {
  const uid = extractUserId(req);
  const requests = getSimSmsRequests(uid);
  res.json({ success: true, count: requests.length, requests });
});
app.post("/api/sim-sms/status", (req, res) => {
  const uid = extractUserId(req);
  const { requestId, status, sentAt, failedReason, simSlot, editedMessage } = req.body;
  if (!requestId || !status) {
    return res.status(400).json({ success: false, error: "requestId and status are required" });
  }
  try {
    const result = updateSimSmsStatus({
      requestId,
      status,
      userId: uid,
      sentAt,
      failedReason,
      simSlot,
      editedMessage
    });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/sim-sms/delete", (req, res) => {
  const uid = extractUserId(req);
  const { requestId } = req.body;
  if (!requestId) {
    return res.status(400).json({ success: false, error: "requestId is required" });
  }
  const deleted = deleteSimSmsRequest(requestId, uid);
  res.json({ success: deleted });
});
app.get("/api/download-android-project", (_req, res) => {
  try {
    const zipPath = path2.resolve(__dirname, "public", "radhamadhab-sms-sender-android-project.zip");
    if (fs2.existsSync(zipPath)) {
      res.download(zipPath, "radhamadhab-sms-sender-android-project.zip");
    } else {
      res.status(404).json({ error: "Android project zip not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to download Android project: " + err.message });
  }
});
var distDir = path2.resolve(__dirname, "dist");
app.use(express.static(distDir));
app.get("*", (_req, res) => {
  res.sendFile(path2.join(distDir, "index.html"));
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Radhamadhab Online Center server running on port ${PORT}`);
});
