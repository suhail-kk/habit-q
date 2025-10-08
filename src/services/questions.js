
import axios from "axios";

const QUESTIONS_API_URL = "/api/list-questions";

export const fetchQuestions = async (page = 1, limit = 10) => {
    try {
        const response = await axios.get(QUESTIONS_API_URL, {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching questions:", error);
        throw new Error(error.response?.data?.error || "Failed to fetch questions");
    }
};