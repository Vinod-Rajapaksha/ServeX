import client from './api/client';

export const addFeedback = async (feedbackData: {
  providerId: string;
  serviceId?: string;
  bookingId: string;
  rating: number;
  comment: string;
}) => {
  const response = await client.post('/feedback', feedbackData);
  return response.data.data;
};

export const getServiceFeedback = async (serviceId: string) => {
  const response = await client.get(`/feedback/service/${serviceId}`);
  return response.data.data;
};

export const getProviderFeedback = async (providerId: string) => {
  const response = await client.get(`/feedback/provider/${providerId}`);
  return response.data.data;
};

export const updateFeedback = async (id: string, feedbackData: any) => {
  const response = await client.patch(`/feedback/${id}`, feedbackData);
  return response.data.data;
};

export const deleteFeedback = async (id: string) => {
  const response = await client.delete(`/feedback/${id}`);
  return response.data.data;
};
