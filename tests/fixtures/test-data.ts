/**
 * Test Data Generator
 * Generates unique, random data for tests to prevent duplicate errors
 */

export interface GuardTestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  emergencyPhone: string;
  timestamp: number;
}

/**
 * Generates unique guard data for each test run
 * Uses timestamp + random numbers to ensure uniqueness
 */
export function generateUniqueGuardData(): GuardTestData {
  const timestamp = Date.now();
  const randomId = Math.floor(1000 + Math.random() * 9000); // 4-digit random

  // Generate unique 10-digit phone numbers starting with 98, 97, 96
  const generatePhone = (prefix: string) => {
    const random8Digits = Math.floor(10000000 + Math.random() * 90000000);
    return `${prefix}${random8Digits}`;
  };

  return {
    firstName: 'Test',
    lastName: `Guard${randomId}`,
    email: `testguard${timestamp}@playwright.test`,
    phone: generatePhone('98'),
    alternatePhone: generatePhone('97'),
    emergencyPhone: generatePhone('96'),
    timestamp,
  };
}

/**
 * Generates unique email address
 */
export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  return `test${timestamp}@playwright.test`;
}

/**
 * Generates unique 10-digit Indian phone number
 */
export function generateUniquePhone(prefix: string = '98'): string {
  const random8Digits = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${random8Digits}`;
}

/**
 * Sample addresses for testing
 */
export const testAddresses = {
  pune: {
    addressLine1: 'sr.no.58 lane 3',
    addressLine2: 'gokuulnagar',
    city: 'pune',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '875874',
    landmark: 'mandir',
  },
  mumbai: {
    addressLine1: 'Flat 401, Building A',
    addressLine2: 'Andheri West',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pincode: '400058',
    landmark: 'Near Metro Station',
  },
};

/**
 * Sample personal details
 */
export const testPersonalDetails = {
  nationality: 'Indian',
  height: '160',
  weight: '80',
  identificationMark: 'mole',
  fatherName: 'Hemant Kumar',
  motherName: 'Surekha Devi',
};

/**
 * Sample emergency contact details
 */
export function generateEmergencyContact(phone: string) {
  return {
    firstName: 'Emergency',
    lastName: 'Contact',
    relationship: 'Brother',
    phone,
  };
}

/**
 * Officer-specific test data interface
 */
export interface OfficerTestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  emergencyPhone: string;
  timestamp: number;
}

/**
 * Generates unique officer data for each test run
 * Uses timestamp + random numbers to ensure uniqueness
 */
export function generateUniqueOfficerData(): OfficerTestData {
  const timestamp = Date.now();
  const randomId = Math.floor(1000 + Math.random() * 9000); // 4-digit random

  // Generate unique 10-digit phone numbers starting with 95, 94, 93
  const generatePhone = (prefix: string) => {
    const random8Digits = Math.floor(10000000 + Math.random() * 90000000);
    return `${prefix}${random8Digits}`;
  };

  return {
    firstName: 'Test',
    lastName: `Officer${randomId}`,
    email: `testofficer${timestamp}@playwright.test`,
    phone: generatePhone('95'),
    alternatePhone: generatePhone('94'),
    emergencyPhone: generatePhone('93'),
    timestamp,
  };
}
