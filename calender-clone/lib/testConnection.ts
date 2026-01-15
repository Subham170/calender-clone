import api from './api';

export async function testBackendConnection() {
  try {
    const response = await api.get('/health');
    console.log('Backend connection successful:', response.data);
    return true;
  } catch (error: any) {
    console.error('Backend connection failed:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    return false;
  }
}
