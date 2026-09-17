import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

export async function uploadToServer(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post(`${API}/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return `${BACKEND_URL}${res.data.url}`;
}
