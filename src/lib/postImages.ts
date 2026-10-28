import { supabase } from "@/integrations/supabase/client";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadPostImage(userId: string, file: File) {
  if (!EXTENSIONS[file.type]) throw new Error("Use uma imagem JPG, PNG, WEBP ou GIF.");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("A imagem deve ter no máximo 5 MB.");
  const path = userId + "/" + crypto.randomUUID() + "." + EXTENSIONS[file.type];
  const { error } = await supabase.storage.from("post-images").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const url = supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
  return { path, url };
}

export async function removePostImage(path: string) {
  await supabase.storage.from("post-images").remove([path]);
}
