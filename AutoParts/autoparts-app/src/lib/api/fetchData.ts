import axios from 'axios';

export interface PartDetail {
  partNumber: string;
  description?: string;
  price?: number;
  [key: string]: any;
}

export const fetchPartDetails = async (partNumber: string): Promise<any> => {
  const url = `https://estimate.mymitchell.com/PartsSelectionService/7/SearchPart?country=US&language=ENG&make=0&partNumber=${partNumber}`;
  const idToken = process.env.ID_TOKEN;

  if (!idToken) {
    throw new Error('ID_TOKEN is not defined in environment variables');
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Id_token: idToken,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      'Error fetching part details:',
      error.response?.data || error.message
    );
    throw error;
  }
};
