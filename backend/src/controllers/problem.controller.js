import { db } from "../libs/db.js";
import {
	getJudge0LanguageId,
	pollBatchResults,
	submitBatch,
} from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
	//going to get the all the data from the request body
	const {
		title,
		description,
		difficulty,
		tags,
		examples,
		constraints,
		testcases,
		codeSnippets,
		referenceSolutions,
	} = req.body;

	//check user role for admin
	if (req.user.role !== "ADMIN") {
		return res.status(403).json({
			error: "You are not allowed to create a problem",
		});
	}
	//loop through each references sol for diff lang

	try {
		for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
			const languageId = getJudge0LanguageId(language);

			if (!languageId) {
				return res.status(400).json({
					error: `${language} not supported`,
				});
			}

			const submissions = testcases.map(({ input, output }) => ({
				source_code: solutionCode,
				language_id: languageId,
				stdin: input,
				expected_output: output,
			}));

			const submissionResults = await submitBatch(submissions);

			const tokens = submissionResults.map((res) => res.token);

			const results = await pollBatchResults(tokens);

			for (let i = 0; i < results.length; i++) {
				const result = results[i];

				console.log("Result:*****************\n ", result);

				if (result.status.id != 3) {
					return res.status(400).json({
						error: `Testcase ${i + 1} failed for language ${language}`,
					});
				}
			}
		}

		const newProblem = await db.problem.create({
			data: {
				title,
				description,
				difficulty,
				tags,
				examples,
				constraints,
				testcases,
				codeSnippets,
				referenceSolutions,
				userId: req.user.id,
			},
		});

		return res.status(201).json(newProblem);
	} catch (error) {
		console.error("Error while creating problem", error);
		return res.status(500).json({
			error: "Error creating Problem",
		});
	}
};

export const getAllProblems = async (req, res) => {
	try {
		const problems = await db.problem.findMany();

		if (!problems) {
			return res.status(404).json({
				error: "No problems found",
			});
		}
		return res.status(200).json({
			success: true,
			message: "Problems fetched successfully",
			problems,
		});
	} catch (error) {
		console.error("Error while fetching problems", error);
		return res.status(500).json({
			error: "Error fetching Problems",
		});
	}
};

export const getProblemById = async (req, res) => {
	const { id } = req.params;

	try {
		const problem = await db.problem.findUnique({
			where: {
				id,
			},
		});

		if (!problem) {
			return res.status(404).json({
				error: "Problem not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Problem fetched successfully",
			problem,
		});
	} catch (error) {
		console.error("Error while fetching problem", error);
		return res.status(500).json({
			error: "Error fetching Problem by id",
		});
	}
};

export const updateProblem = async (req, res) => {
	const { id } = req.params;

	const {
		title,
		description,
		difficulty,
		tags,
		examples,
		constraints,
		testcases,
		codeSnippets,
		referenceSolutions,
	} = req.body;

	// Iterate through each language in the reference solution to validate the test cases.
	// For each language, check if it is supported by Judge0.
	// Submit the test cases for the given language and solution code.
	// Poll the results of the submissions and ensure all test cases pass successfully.
	// If any test case fails, return an error response indicating the failure.

	try {
		for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
			const languageId = getJudge0LanguageId(language);

			if (!languageId) {
				return res.status(400).json({
					error: `${language} not supported`,
				});
			}

			const submissions = testcases.map(({ input, output }) => ({
				language_id: languageId,
				source_code: solutionCode,
				stdin: input,
				expected_output: output,
			}));

			const submissionResults = await submitBatch(submissions);

			const tokens = submissionResults.map((r) => r.token);

			const results = await pollBatchResults(tokens);

			// results.forEach((result, i) => {
			// 	if (result.status.id != 3) {
			// 		return res.status(400).json({
			// 			error: `Testcase ${i + 1} failed for language ${language}`,
			// 		});
			// 	})

			for (let i = 0; i < results.length; i++) {
				const result = results[i];

				console.log("________________Result______________________\n", result);

				if (result.status.id != 3) {
					return res.status(400).json({
						error: `Testcase ${i + 1} failed for ${language}`,
					});
				}
			}
		}

		const existingProblem = await db.problem.findUnique({
			where: {
				id,
			},
		});

		if (!existingProblem) {
			return res.status(404).json({
				error: "Problem not found",
			});
		}

		const updatedProblem = await db.problem.update({
			where: {
				id,
			},

			data: {
				title,
				description,
				difficulty,
				tags,
				examples,
				constraints,
				testcases,
				codeSnippets,
				referenceSolutions,
				userId: req.user.id,
			},
		});

		return res.status(201).json(updatedProblem);
	} catch (error) {
		console.error("Error updating problem:", error.message, error.stack);
		res.status(500).json({
			error: `Error updating problem: ${error.message}`,
		});
	}
};

export const deleteProblem = async (req, res) => {
	const { id } = req.params;
	const problem = await db.problem.findUnique({
		where: {
			id,
		},
	});

	if (!problem) {
		return res.status(404).json({
			error: "Problem not found",
		});
	}

	try {
		await db.problem.delete({
			where: {
				id,
			},
		});
		return res.status(200).json({
			success: true,
			message: "Problem deleted successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error deleting problem",
		});
	}
};

export const getProblemsSolvedByUser = async (req, res) => {
	try {
		const problems = await db.problem.findMany({
			where: {
				solvedBy: {
					some: { userId: req.user.id },
				},
			},
			include: {
				solvedBy: {
					where: {
						userId: req.user.id,
					},
				},
			},
		});

		res.status(200).json({
			success: true,
			message: "Problems fetched successfully",
			problems,
		});
	} catch (error) {
		console.error("Error fetching problems", error);
		res.status(500).json({
			error: "Error fetching problems",
		});
	}
};
