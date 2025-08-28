export const getToken = () => {
  const authData = JSON.parse(localStorage.getItem('auth') || '{}');
  return authData?.accessToken || null;
};
