import axios from "axios";

const BACKEND_URL = "https://nblocacoes-com.onrender.com";
const API = `${BACKEND_URL}/api`;

export async function uploadToServer(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post(`${API}/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return `${BACKEND_URL}${res.data.url}`;
}
