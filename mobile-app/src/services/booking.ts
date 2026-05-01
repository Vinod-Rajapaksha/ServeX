import client from './api/client';

export const getMyBookings = async () => {
  const response = await client.get('/bookings/my');
  return response.data.data;
};

export const createBooking = async (bookingData: any) => {
  const response = await client.post('/bookings', bookingData);
  return response.data.data;
};

export const updateBooking = async (id: string, updateData: { status?: string; notes?: string }) => {
  const response = await client.patch(`/bookings/${id}`, updateData);
  return response.data.data;
};

export const updateBookingStatus = async (id: string, status: string) => {
  return await updateBooking(id, { status });
};

export const getBookingById = async (id: string) => {
  const response = await client.get(`/bookings/${id}`);
  return response.data.data;
};

export const deleteBooking = async (id: string) => {
  const response = await client.delete(`/bookings/${id}`);
  return response.data.data;
};

export const sendMessage = async (id: string, text: string) => {
  const response = await client.post(`/bookings/${id}/messages`, { text });
  return response.data.data;
};
