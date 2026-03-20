export const API_URL = import.meta.env.VITE_API_URL;

export const getWorldId = () => {
  let id = localStorage.getItem("worldId");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("worldId", id);
  }

  return id;
};