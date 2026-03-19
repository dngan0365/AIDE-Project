import api from "./api";

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<{ url: string }>("/upload/other", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<{ url: string }>("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}