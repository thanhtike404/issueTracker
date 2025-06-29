import axios from "axios";

export const fetchProfile= async (id: string) => {
  try {
    const response = await axios.get(`/api/profile/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}