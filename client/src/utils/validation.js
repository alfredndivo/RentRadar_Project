export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+254|0)[17]\d{8}$/; // Kenyan phone number format
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    errors: [
      ...(password.length < 6 ? ['Password must be at least 6 characters'] : []),
      ...(!/[A-Z]/.test(password) ? ['Password should contain at least one uppercase letter'] : []),
      ...(!/[0-9]/.test(password) ? ['Password should contain at least one number'] : [])
    ]
  };
};

export const validatePrice = (price) => {
  const numPrice = Number(price);
  return {
    isValid: numPrice > 0 && numPrice <= 1000000,
    errors: [
      ...(numPrice <= 0 ? ['Price must be greater than 0'] : []),
      ...(numPrice > 1000000 ? ['Price seems too high, please verify'] : [])
    ]
  };
};

export const validateObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, ''); // Remove < and > characters
};

export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles = 1
  } = options;

  const errors = [];

  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};