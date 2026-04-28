import { Spacecraft } from 'models';

const url = import.meta.env.VITE_API_URL;

export const getAll = async (): Promise<Spacecraft[]> => {
  const response = await fetch(`${url}/spacecrafts`);
  return response.json();
};

export const get = async (spacecraftId: string): Promise<Spacecraft> => {
  const response = await fetch(`${url}/spacecrafts/${spacecraftId}`);
  return response.json();
};

export const post = async (spacecraft: Spacecraft): Promise<Spacecraft> => {
  const response = await fetch(`${url}/spacecrafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(spacecraft)
  });
  return response.json();
};
