import client from './api/client';

export const login = async (credentials: any) => {
  const response = await client.post('/auth/login', credentials);
  return response.data.data;
};

export const register = async (userData: any) => {
  const response = await client.post('/auth/register', userData);
  return response.data.data;
};

export const logout = async () => {
  const response = await client.post('/auth/logout');
  return response.data.data;
};

export const forgotPassword = async (email: string) => {
  const response = await client.post('/auth/forgot-password', { email });
  return response.data.data;
};

export const changePassword = async (passwordData: any) => {
  const response = await client.patch('/auth/change-password', passwordData);
  return response.data.data;
};

export const updateProfile = async (userData: any) => {
  const response = await client.patch('/auth/profile', userData);
  return response.data.data;
};

export const getProfile = async () => {
  const response = await client.get('/auth/profile');
  return response.data.data;
};
