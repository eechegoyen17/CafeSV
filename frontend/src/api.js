import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getSentimientos = () => axios.get(`${API_URL}/api/sentimientos`);
export const getTemas = () => axios.get(`${API_URL}/api/temas`);
export const getMensajesRecientes = () => axios.get(`${API_URL}/api/mensajes/recientes`);