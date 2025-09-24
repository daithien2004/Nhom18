/**
 * Helper chung để handle API call + rejectWithValue
 */
export async function handleApi<T>(
  apiCall: () => Promise<T>,
  rejectWithValue: (val: any) => any,
  fallbackMessage: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (err: any) {
    // Validation errors từ backend (Zod)
    if (err.isValidationError && err.validationErrors) {
      return rejectWithValue(err.validationErrors);
    }

    // Lỗi khác từ backend (400, 401, 500,…)
    if (err.response?.data) {
      return rejectWithValue(err.response.data);
    }

    // fallback chung
    return rejectWithValue(fallbackMessage);
  }
}
