import api from "../../../lib/api";

const USER_API_PATH = "/api/admin/user";

/**
 * Existing API:
 * GET /api/admin/user
 *
 * Kept compatible with your current application.
 */
export const getUsers = async () => {
  const response = await api.get(USER_API_PATH);

  return response.data;
};

/**
 * Get logged-in user's profile.
 *
 * Your current backend returns the users list,
 * so we find the employee locally for now.
 */
export const getUserByEmployeeId = async (empId) => {
  if (!empId) {
    throw new Error("Employee ID is missing.");
  }

  const users = await getUsers();

  if (!Array.isArray(users)) {
    throw new Error("Invalid users response.");
  }

  const user = users.find(
    (item) => String(item.empId) === String(empId)
  );

  if (!user) {
    throw new Error("User profile not found.");
  }

  return user;
};

/**
 * Existing profile photo API.
 *
 * PUT /api/admin/user/:empId
 */
export const updateUserPhoto = async (empId, photo) => {
  if (!empId) {
    throw new Error("Employee ID is missing.");
  }

  const response = await api.put(
    `${USER_API_PATH}/${encodeURIComponent(empId)}`,
    {
      photo,
    }
  );

  return response.data;
};