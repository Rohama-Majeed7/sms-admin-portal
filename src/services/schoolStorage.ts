import type { School } from "../types/school";

const SCHOOL_STORAGE_KEY = "sms_school_data";
const USER_STORAGE_KEY = "user";
export const SCHOOL_UPDATE_EVENT = "sms_school_updated";

/**
 * Fallback mock school data used if no school is found in localStorage.
 */
const DEFAULT_MOCK_SCHOOL: School = {
  name: "Greenwood Academy",
  address: "Sector F-8/4, Islamabad, Pakistan",
  ownerName: "Muhammad Ali",
  ownerPhone: "+923000000000",
  ownerEmail: "admin@greenwood.edu.pk",
  status: "ACTIVE",
  adminId: 1,
  createdAt: new Date().toISOString(),
};

/**
 * Synchronously retrieves the current school details from local persistence.
 */
export const getStoredSchool = (): School => {
  try {
    const directSchool = localStorage.getItem(SCHOOL_STORAGE_KEY);
    if (directSchool) {
      return JSON.parse(directSchool);
    }

    const userRaw = localStorage.getItem(USER_STORAGE_KEY);
    if (userRaw) {
      const user = JSON.parse(userRaw);
      if (user?.schoolAdmin) {
        return user.schoolAdmin;
      }
      if (user?.school) {
        return user.school;
      }
    }
  } catch (err) {
    console.warn("Failed to parse school data from localStorage:", err);
  }

  return DEFAULT_MOCK_SCHOOL;
};

/**
 * Saves school details to local storage and notifies interested listeners.
 */
export const saveSchool = (school: School): void => {
  try {
    localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(school));

    // Also keep user.schoolAdmin in sync so existing layout/route guards continue working
    const userRaw = localStorage.getItem(USER_STORAGE_KEY);
    if (userRaw) {
      const user = JSON.parse(userRaw);
      user.schoolAdmin = { ...(user.schoolAdmin || {}), ...school };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }

    // Broadcast change to update any active UI components
    window.dispatchEvent(
      new CustomEvent(SCHOOL_UPDATE_EVENT, { detail: school })
    );
  } catch (err) {
    console.error("Failed to save school to localStorage:", err);
  }
};

/**
 * Clears cached school data on logout.
 */
export const clearSchool = (): void => {
  localStorage.removeItem(SCHOOL_STORAGE_KEY);
};

/**
 * =========================================================================
 * FUTURE GET INTEGRATION PLACEHOLDER
 * =========================================================================
 * Currently retrieves the school information from local storage / mock data.
 * When the backend GET endpoint is ready, replace this implementation with:
 *
 *   const response = await api.get('/school/...');
 *   return response.data.data;
 * =========================================================================
 */
export const fetchSchoolDetails = async (): Promise<School> => {
  // Simulate minimal asynchronous loading if needed for realistic UX
  return new Promise((resolve) => {
    const school = getStoredSchool();
    resolve(school);
  });
};

/**
 * Updates school details locally (frontend-only).
 * When backend PATCH/PUT endpoint is ready, this can be swapped with real API call.
 */
export const updateSchoolDetailsLocally = async (
  updatedFields: Partial<School>
): Promise<School> => {
  const current = getStoredSchool();
  const updatedSchool: School = {
    ...current,
    ...updatedFields,
    // Ensure status and adminId are preserved and not arbitrarily overwritten
    status: current.status,
    adminId: current.adminId,
  };

  saveSchool(updatedSchool);
  return updatedSchool;
};
