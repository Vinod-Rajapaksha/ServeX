import client from './api/client';

export const createRequest = async (requestData: any) => {
  const response = await client.post('/requests', requestData);
  return response.data.data;
};

export const getMyRequests = async () => {
  const response = await client.get('/requests/my');
  return response.data.data;
};

export const getOpenRequests = async () => {
  const response = await client.get('/requests/open');
  return response.data.data;
};

export const acceptRequest = async (id: string, price: number) => {
  const response = await client.patch(`/requests/${id}/accept`, { price });
  return response.data.data;
};

export const placeBid = async (id: string, bidData: { price: number; priceUnit: string; message?: string }) => {
  const response = await client.post(`/requests/${id}/bids`, bidData);
  return response.data.data;
};

export const acceptBid = async (id: string, bidId: string) => {
  const response = await client.post(`/requests/${id}/bids/${bidId}/accept`);
  return response.data.data;
};

export const deleteRequest = async (id: string) => {
  const response = await client.delete(`/requests/${id}`);
  return response.data.data;
};
