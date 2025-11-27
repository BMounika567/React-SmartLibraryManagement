import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

export const profileService = {
  updateProfile: async (data: { name: string; phoneNumber?: string }) => {
    const response = await axiosClient.post(API_ENDPOINTS.PROFILE.UPDATE, data);
    return response.data;
  },
};
