const axios = require("axios");
require("dotenv").config();

const fetchPartDetails = async (partNumber) => {
  const url = `https://estimate.mymitchell.com/PartsSelectionService/7/SearchPart?country=US&language=ENG&make=0&partNumber=${partNumber}`;

  const idToken = process.env.ID_TOKEN;

  try {
    const response = await axios.get(url, {
      headers: {
        Id_token: `${idToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching part details:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = { fetchPartDetails };
