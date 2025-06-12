import axios from "axios";

export const getJudge0LanguageId = (language) => {
	const langMap = {
		PYTHON: 71,
		JAVASCRIPT: 63,
		CPP: 54,
		JAVA: 62,
	};

	return langMap[language.toUpperCase()] || null;
};

export const submitBatch = async (submissions) => {
	const { data } = await axios.post(
		'https://judge0-ce.p.sulu.sh/submissions/batch',
		{
			submissions,
		},
		{
			headers: {
				"Content-Type": "application/json",
				"Accept": 'application/json',
    			"Authorization": `Bearer ${process.env.SULU_API_KEY}`,
				
			},
			params: {
				base64_encoded: "false",
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
			'https://judge0-ce.p.sulu.sh/submissions/batch',
			{
				params: {
					tokens: Array.isArray(tokens) ? tokens.join(",") : "",
					base64_encoded: false,
				},
				headers: {
					"Accept": 'application/json',
    				"Authorization": `Bearer ${process.env.SULU_API_KEY}`,
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
		62: "JAVA",
	};

	return LANGUAGE_NAMES[langaugeId] || "Unknown";
};
