import { authenticatedFetch } from "@/lib/api";
export async function updateChurch(data: any, file?: File) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value) formData.append(key, value as string);
  });

  if (file) {
    formData.append("file", file);
  }

  return await authenticatedFetch("/church/me", {
    method: "PATCH",
    body: formData,
  });
}
