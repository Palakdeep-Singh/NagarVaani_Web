import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",  // NO /api here — routes already include /api
});

API.interceptors.request.use((req) => {
  // AuthContext stores token as 'nc_token' — must match exactly
  const token = localStorage.getItem("nc_token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;