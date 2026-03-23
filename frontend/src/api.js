import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const getSentimientos = () => axios.get(`${API_URL}/sentimientos`);
export const getTemas = () => axios.get(`${API_URL}/temas`);
export const getMensajesRecientes = () => axios.get(`${API_URL}/mensajes/recientes`);