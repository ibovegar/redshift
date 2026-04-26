import { UserStats } from 'models';

const url = process.env.REACT_APP_API_URL;

export const get = async (): Promise<UserStats> => {
  const response = await fetch(`${url}/user`);
  return response.json();
};

export const updateCredits = async (amount: number): Promise<any> => {
  const response = await fetch(`${url}/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credits: amount })
  });
  return response.json();
};
