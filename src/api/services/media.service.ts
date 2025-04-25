import axiosInstance from '../axios';

export const mediaService = {
  async uploadFile(file: File, type: 'image' | 'video' | 'audio' | 'document') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axiosInstance.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getMediaList(type?: string) {
    const response = await axiosInstance.get('/media', {
      params: { type }
    });
    return response.data;
  },

  async deleteMedia(mediaId: string) {
    const response = await axiosInstance.delete(`/media/${mediaId}`);
    return response.data;
  }
};