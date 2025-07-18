import {db} from "../libs/db.js"

export const getAllSubmission = async (req, res) => {
	try {
		const userId = req.user.id;

		const submissions = await db.submission.findMany({
			where: {
				userId: userId,
			},
		});

		return res.status(200).json({
			success: true,
			message: "Submissions fetched successfully",
			submissions,
		});
	} catch (error) {
		console.error("Fetch Submissions Error:", error);
		return res.status(500).json({
			error: "Failed to fetch submissions",
		});
	}
};

export const getSubmissionsForProblem = async (req, res) => {
	try {
		const userId = req.user.id;
		const problemId = req.params.problemId;

		const submissions = await db.submission.findMany({
			where: {
				userId,
				problemId,
			},
		});

		return res.status(200).json({
			success: true,
			message: "Submission fetched successfully",
			submissions,
		});
	} catch (error) {
		console.error("Fetch Submissions Error:", error);
		return res.status(500).json({
			error: "Failed to fetch submissions",
		});
	}
};

export const getAllTheSubmissionsForProblem = async (req, res) => {
	try {
		const problemId = req.params.problemId;
		const submissions = await db.submission.count({
			where: {
				problemId,
			},
		});

		return res.status(200).json({
			success: true,
			message: "Submissions fetched successfully",
			count: submissions,
		});
	} catch (error) {
		console.error("Fetch Submissions Error:", error);
		return res.status(500).json({
			error: "Failed to fetch submissions",
		});
	}
};
