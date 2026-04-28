import { Upgrade } from 'models';

const url = import.meta.env.VITE_API_URL;

export const getAll = async (): Promise<Upgrade[]> => {
  const response = await fetch(`${url}/upgrades`);
  return response.json();
};

export const get = async (spacecraftId: string): Promise<Upgrade[]> => {
  const response = await fetch(`${url}/spacecrafts/${spacecraftId}/upgrades`);
  return response.json();
};

export const update = async (upgrade: Upgrade): Promise<any> => {
  const response = await fetch(`${url}/upgrades/${upgrade.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...upgrade })
  });
  return response.json();
};

export const post = async (upgrade: Upgrade): Promise<Upgrade> => {
  const response = await fetch(`${url}/upgrades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(upgrade)
  });
  return response.json();
};
