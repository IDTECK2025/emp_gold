// utils/uploadSignature.js
const cloudinary = require('./cloudinary');

const uploadSignature = async (file) => {
  const base64 = file.data.toString('base64');
  const dataURI = `data:${file.mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'signatures',
  });

  return result.secure_url;
};

module.exports = uploadSignature;
