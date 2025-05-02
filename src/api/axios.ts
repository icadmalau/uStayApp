import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ustaybackend-production.up.railway.app/', // URL backend
  headers: {
    'Content-Type': 'application/json',
   
  },
});

export default api;
