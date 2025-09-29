// src/services/userApi.ts
import { API_BASE_URL } from '../src/configapi/api';

export const API_BASE = `${API_BASE_URL}/api/auth`; // backend URL

export type Address = {
  district: string;
  block: string;
  city: string;
  homeLodgeName: string;
};

export type User = {
  _id: string;
  name: string;
  phone: string;
  address: Address;
  role: string;
};

export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch(`${API_BASE}/users`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }

  return data.data;
};