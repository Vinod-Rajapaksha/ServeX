import client from './api/client';

export const getAllServices = async (params?: any) => {
  const response = await client.get('/services', { params });
  return response.data.data;
};

export const getServiceById = async (id: string) => {
  const response = await client.get(`/services/${id}`);
  return response.data.data;
};

export const createService = async (serviceData: any) => {
  const response = await client.post('/services', serviceData);
  return response.data.data;
};

export const updateService = async (id: string, serviceData: any) => {
  const response = await client.patch(`/services/${id}`, serviceData);
  return response.data.data;
};

export const deleteService = async (id: string) => {
  const response = await client.delete(`/services/${id}`);
  return response.data.data;
};

export const getCategories = async () => {
  const response = await client.get('/categories');
  return response.data.data;
};
