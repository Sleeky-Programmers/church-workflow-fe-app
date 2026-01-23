import { useEffect, useState } from "react";

export interface SignupDataType {
  firstName?: string;
  lastName?: string;
  role?: string;
  phoneNumber?: string;
  churchName?: string;
  email?: string;
}

/**
 * Custom hook to retrieve signup data stored in sessionStorage
 * This data is passed from the signup page to the onboarding flow
 */
export function useSignupData(): SignupDataType | null {
  const [signupData, setSignupData] = useState<SignupDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("signupData");
        if (stored) {
          const data = JSON.parse(stored) as SignupDataType;
          setSignupData(data);
        }
      } catch (error) {
        console.error(
          "Failed to parse signup data from sessionStorage:",
          error,
        );
      }
    }
    setIsLoading(false);
  }, []);

  return !isLoading ? signupData : null;
}

/**
 * Clear signup data from sessionStorage
 */
export function clearSignupData(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("signupData");
  }
}
