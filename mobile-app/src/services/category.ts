import client from './api/client';

export const createCategory = async (categoryData: any) => {
    const response = await client.post('/categories', categoryData);
    return response.data.data;
};

export const updateCategory = async (id: string, categoryData: any) => {
    const response = await client.patch(`/categories/${id}`, categoryData);
    return response.data.data;
};

export const deleteCategory = async (id: string) => {
    const response = await client.delete(`/categories/${id}`);
    return response.data.data;
};