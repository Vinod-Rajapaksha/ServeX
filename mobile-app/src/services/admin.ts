import client from './api/client';

export const getAllUsers = async () => {
  const response = await client.get('/users');
  return response.data.data;
};

export const createUser = async (userData: any) => {
  const response = await client.post('/users', userData);
  return response.data.data;
};

export const updateUser = async (id: string, userData: any) => {
  const response = await client.patch(`/users/${id}`, userData);
  return response.data.data;
};

export const deleteUser = async (id: string) => {
  const response = await client.delete(`/users/${id}`);
  return response.data.data;
};

export const getStats = async () => {
  const response = await client.get('/analytics/stats');
  return response.data.data;
};
