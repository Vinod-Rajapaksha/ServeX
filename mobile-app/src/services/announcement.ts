import client from './api/client';

export const getAnnouncements = async () => {
  const response = await client.get('/announcements');
  return response.data.data;
};

export const getAnnouncementsByRole = async (role: string) => {
  const response = await client.get(`/announcements/role/${role}`);
  return response.data.data;
};

export const createAnnouncement = async (data: any) => {
  const response = await client.post('/announcements', data);
  return response.data.data;
};

export const updateAnnouncement = async (id: string, data: any) => {
  const response = await client.patch(`/announcements/${id}`, data);
  return response.data.data;
};

export const deleteAnnouncement = async (id: string) => {
  const response = await client.delete(`/announcements/${id}`);
  return response.data.data;
};
