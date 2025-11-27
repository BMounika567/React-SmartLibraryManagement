import axiosClient from '../api/axiosClient';

export const libraryService = {
  getLibraryByTenantId: async (tenantId: string) => {
    const response = await axiosClient.get(`/api/Library/tenant/${tenantId}`);
    return response.data;
  },

  getLibraryByCode: async (libraryCode: string) => {
    const response = await axiosClient.get(`/api/Library/code/${libraryCode}`);
    return response.data;
  }
};