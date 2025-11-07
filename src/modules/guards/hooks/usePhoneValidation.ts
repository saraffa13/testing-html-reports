import { useCallback, useState } from "react";
import { guardsApi } from "../../../config/axios";

interface PhoneValidationResult {
  exists: boolean;
  phoneNumber: string;
  guard?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
  };
  message: string;
}

interface UsePhoneValidationReturn {
  isChecking: boolean;
  exists: boolean;
  message: string;
  existingGuard: PhoneValidationResult["guard"] | null;
  hasError: boolean;
  validatePhone: (phoneNumber: string) => Promise<void>;
  clearValidation: () => void;
}

export const usePhoneValidation = (): UsePhoneValidationReturn => {
  const [isChecking, setIsChecking] = useState(false);
  const [exists, setExists] = useState(false);
  const [message, setMessage] = useState("");
  const [existingGuard, setExistingGuard] = useState<PhoneValidationResult["guard"] | null>(null);
  const [hasError, setHasError] = useState(false);

  // Clear validation state
  const clearValidation = useCallback(() => {
    console.log("🧹 Clearing phone validation state");
    setIsChecking(false);
    setExists(false);
    setMessage("");
    setExistingGuard(null);
    setHasError(false);
  }, []);

  // Phone validation function
  const validatePhone = useCallback(
    async (phoneNumber: string): Promise<void> => {
      // Clean the phone number (remove all non-digits)
      const cleanedNumber = phoneNumber.replace(/\D/g, "");

      console.log("📞 Starting phone validation for:", cleanedNumber);

      // Validate input format
      if (!cleanedNumber || cleanedNumber.length !== 10 || !/^\d{10}$/.test(cleanedNumber)) {
        console.log("❌ Invalid phone format:", cleanedNumber);
        clearValidation();
        return;
      }

      // Check if first digit is valid (6-9)
      if (!/^[6-9]/.test(cleanedNumber)) {
        console.log("❌ Invalid first digit:", cleanedNumber);
        setIsChecking(false);
        setExists(false);
        setExistingGuard(null);
        setMessage("Mobile number must start with 6, 7, 8, or 9");
        setHasError(true);
        return;
      }

      try {
        // Set loading state
        setIsChecking(true);
        setHasError(false);
        setMessage("");
        setExists(false);
        setExistingGuard(null);

        console.log("🚀 Making API call for phone validation:", cleanedNumber);

        // Call the API with +91 prefix
        const response = await guardsApi.post("/guards/validate-phone", {
          phoneNumber: `+91${cleanedNumber}`,
        });

        console.log("✅ Phone validation API response:", response.data);

        // Extract data from response
        const validationData = response.data?.data || response.data;

        if (validationData.exists) {
          console.log("⚠️ Phone number already exists:", validationData.guard);
          setExists(true);
          setExistingGuard(validationData.guard || null);
          setMessage(
            validationData.message ||
              `Phone number already registered${validationData.guard ? ` to ${validationData.guard.firstName} ${validationData.guard.lastName}` : ""}`
          );
          setHasError(false);
        } else {
          console.log("✅ Phone number is available");
          setExists(false);
          setExistingGuard(null);
          setMessage(validationData.message || "Phone number is available");
          setHasError(false);
        }
      } catch (error: any) {
        console.error("❌ Phone validation API error:", error);

        setExists(false);
        setExistingGuard(null);
        setHasError(true);

        // Handle specific error cases
        if (error.response?.status === 400) {
          setMessage("Invalid phone number format");
        } else if (error.response?.status === 401) {
          setMessage("Authentication required. Please login again.");
        } else if (error.response?.status === 403) {
          setMessage("Access denied. Please check permissions.");
        } else if (error.response?.status >= 500) {
          setMessage("Server error. Please try again later.");
        } else if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
          setMessage("Request timeout. Please try again.");
        } else if (!error.response) {
          setMessage("Network error. Please check connection.");
        } else {
          setMessage("Error checking phone number. Please try again.");
        }
      } finally {
        setIsChecking(false);
        console.log("📞 Phone validation completed");
      }
    },
    [clearValidation]
  );

  return {
    isChecking,
    exists,
    message,
    existingGuard,
    hasError,
    validatePhone,
    clearValidation,
  };
};
