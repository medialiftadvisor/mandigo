
import axios from 'axios';

// Apne Hostinger ka sahi URL yahan dalein
const API_BASE_URL = 'https://mall.zaminzaydaat.com/admin_api.php';

export const fetchProducts = async (category = 'All', pincode = '') => {
  try {
    const response = await axios.post(API_BASE_URL, {
      action: 'get_products',
      category,
      pincode
    });
    return response.data.products;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};
