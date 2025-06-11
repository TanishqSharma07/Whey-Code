import axios from "axios";

export const getJudge0LanguageId = (language) => {
	const langMap = {
		PYTHON: 71,
		JAVASCRIPT: 63,
		CPP: 54,
	};

	return langMap[language.toUpperCase()] || null;
};

export const submitBatch = async (submissions) => {
	const { data } = await axios.post(
		`https://judge0-ce.p.rapidapi.com/submissions/batch`,
		{
			submissions,
		},
		{
			headers: {
				"x-rapidapi-host": process.env.JUDGE0_RAPID_API_HOST,
				"x-rapidapi-key": process.env.JUDGE0_RAPID_API_KEY,
				"Content-Type": "application/json",
			},
			params: {
				base64_encoded: "true",
			},
		}
	);

	return data;
};

const sleep = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const pollBatchResults = async (tokens) => {
	let isAllDone = false;

	while (!isAllDone) {
		const { data } = await axios.get(
			`https://judge0-ce.p.rapidapi.com/submissions/batch`,
			{
				params: {
					tokens: Array.isArray(tokens) ? tokens.join(",") : "",
					base64_encoded: false,
				},
				headers: {
					"x-rapidapi-key": process.env.JUDGE0_RAPID_API_KEY,
					"x-rapidapi-host": process.env.JUDGE0_RAPID_API_HOST,
				},
			}
		);

		const results = data.submissions;

		// Check if all submissions have completed processing (status.id >= 3 indicates completion)
		isAllDone = results.every((r) => {
			return r.status.id >= 3;
		});

		if (isAllDone) return results;

		await sleep(1000);
	}
};

export const getLanguageName = (langaugeId) => {
	const LANGUAGE_NAMES = {
		63: "JavaScript",
		71: "Python",
		54: "CPP",
	};

	return LANGUAGE_NAMES[langaugeId] || "Unknown";
};
