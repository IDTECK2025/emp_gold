const Profile = require('../models/adminProfileModel');

const getNextLetter = (char) => {
  // If no char or at 'Z', wrap back to 'A'
  if (!char || char === 'Z') return 'A';
  return String.fromCharCode(char.charCodeAt(0) + 1);
};

const generateCustomerId = async (profileType, baseId = null) => {
  //
  // ── CASE 1: CUSTOMER ───────────────────────────────────────────────────
  //
  if (profileType === 'customer') {
    const prefix = 'EMPZZ';
    // find the highest existing EMPZZ###  
    const last = await Profile.findOne({
      profileType: 'customer',
      customerId: { $regex: `^${prefix}\\d{3}$` }
    })
      .sort({ customerId: -1 })
      .select('customerId');

    if (!last) {
      return `${prefix}001`;
    }

    const lastNum = parseInt(last.customerId.slice(prefix.length), 10);
    const nextNum = (lastNum + 1).toString().padStart(3, '0');
    return `${prefix}${nextNum}`;
  }

  //
  // ── CASE 2: SHAREHOLDER or AGENT ───────────────────────────────────────
  //
  if ((profileType === 'shareholder' || profileType === 'agent') && !baseId) {
    baseId = 'EMP';
  }

  //
  // ── CASE 3: SUBAGENT or USER ───────────────────────────────────────────
  //
  // We require you to pass in your parent’s customerId as the baseId
  if ((profileType === 'subagent' || profileType === 'user') && !baseId) {
    throw new Error(
      `Base ID is required to generate a '${profileType}' ID; pass the parent customerId`
    );
  }

  //
  // ── VALIDATE we now have a baseId ──────────────────────────────────────
  //
  if (!baseId) {
    throw new Error(
      `Unknown profileType '${profileType}'; cannot generate customerId without a baseId`
    );
  }

  //
  // ── BUILD REGEX & FETCH ALL MATCHES ───────────────────────────────────
  //
  // Matches e.g. EMP4A1B1C1D, EMP4A1B1C2D, EMP4A1B1C10D, etc.
  const idRegex = new RegExp(`^${baseId}(\\d+)([A-Z])$`);

  // **NO** profileType filter here: scan every existing ID namespace
  const profiles = await Profile.find({
    customerId: { $regex: idRegex }
  }).select('customerId');

  //
  // ── FIRST‐TIME SEED (no prior IDs with this base) ─────────────────────
  //
  if (profiles.length === 0) {
    // take last char of `baseId`, bump to next letter, start at “1”
    const lastChar = baseId[baseId.length - 1];
    const nextLetter = getNextLetter(lastChar);
    return `${baseId}1${nextLetter}`;
  }

  //
  // ── REUSE THE SAME LETTER, JUST INCREMENT THE NUMBER ─────────────────
  //
  let maxNumber = 0;
  let consistentLetter = null;

  for (const { customerId } of profiles) {
    const [, numPart, letterPart] = customerId.match(idRegex);
    const num = parseInt(numPart, 10);
    if (num > maxNumber) {
      maxNumber = num;
      consistentLetter = letterPart;
    }
  }

  const nextNumber = maxNumber + 1;
  return `${baseId}${nextNumber}${consistentLetter}`;
};

module.exports = generateCustomerId;




// const Profile = require('../models/adminProfileModel');

// const getNextLetter = (char) => {
//   if (!char || char === 'Z') return 'A'; // optional fallback
//   return String.fromCharCode(char.charCodeAt(0) + 1);
// };

// const generateCustomerId = async (profileType, baseId = null) => {
//   if (!baseId && (profileType === 'customer')) {
//     baseId = 'EMPZZ';
//   }
//   if (profileType === 'customer') {
//     const prefix = 'EMPZZ';

//     const lastCustomer = await Profile.findOne({
//       profileType: 'customer',
//       customerId: { $regex: `^${prefix}\\d{3}$` }
//     }).sort({ customerId: -1 }).select('customerId');

//     if (!lastCustomer) return `${prefix}001`;

//     const lastNum = parseInt(lastCustomer.customerId.slice(prefix.length), 10);
//     return `${prefix}${(lastNum + 1).toString().padStart(3, '0')}`;
//   }
//   if (!baseId && (profileType === 'shareholder')) {
//     baseId = 'EMP';
//   }

//   if (!baseId) {
//     throw new Error('Base ID is required for shareholder or agent');
//   }

//   const idRegex = new RegExp(`^${baseId}(\\d+)([A-Z])$`);
//   const profiles = await Profile.find({
//     profileType: { $in: ['shareholder', 'agent'] },
//     customerId: { $regex: idRegex }
//   }).select('customerId');

//   if (!profiles.length) {
//     // New base — get last letter in baseId, bump to next
//     const lastChar = baseId[baseId.length - 1];
//     const nextLetter = getNextLetter(lastChar);
//     return `${baseId}1${nextLetter}`;
//   }

//   // Existing base — reuse existing letter, just increment number
//   let maxNumber = 0;
//   let consistentLetter = null;

//   for (const profile of profiles) {
//     const match = profile.customerId.match(idRegex);
//     if (match) {
//       const number = parseInt(match[1], 10);
//       const letter = match[2];

//       if (number > maxNumber) {
//         maxNumber = number;
//         consistentLetter = letter; // assume all use same letter
//       }
//     }
//   }

//   const nextNumber = maxNumber + 1;
//   return `${baseId}${nextNumber}${consistentLetter}`;
// };

// module.exports = generateCustomerId;