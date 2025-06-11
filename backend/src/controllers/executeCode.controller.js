import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";
import { db } from "../libs/db.js";

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problemId } =
      req.body;

    const userId = req.user.id;

    //validate test cases

    if (
      !(
        Array.isArray(stdin) &&
        stdin.length > 0 &&
        Array.isArray(expected_outputs) &&
        expected_outputs.length == stdin.length
      )
    ) {
      return res.status(400).json({ error: "Invalid or missing test cases" });
    }

    // Prepare each test cases for judge0 batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    // send batch of submissions to judge0
    const submitResponse = await submitBatch(submissions);

    const tokens = submitResponse.map((res) => res.token);
    //Poll judge0 for results of all submitted test cases
    const results = await pollBatchResults(tokens);

    console.log("------------------Result---------------------");
    console.log(results);

    //Analyse test cases results
    let allPased = true;
    const detailedResults = results.map((result, i) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();

      const isPassed = stdout === expected_output;

      allPased = allPased && isPassed;

      return {
        testCase: i + 1,
        passed: isPassed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compileOutput: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : null,
        time: result.time ? `${result.time} s` : null,
      };
    });

    //store submission summary in db
    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: source_code,

        language: getLanguageName(language_id),

        stdin: stdin.join("\n"),

        stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),

        stderr: detailedResults.some((r) => r.stderr)
          ? JSON.stringify(detailedResults.map((r) => r.stderr))
          : null,

        compileOutput: detailedResults.some((r) => r.compileOutput)
          ? JSON.stringify(detailedResults.map((r) => r.compileOutput))
          : null,

        status: allPased ? "Accepted" : "Wrong Submission",

        memory: detailedResults.some((r) => r.memory)
          ? JSON.stringify(detailedResults.map((r) => r.memory))
          : null,

        time: detailedResults.some((r) => r.time)
          ? JSON.stringify(detailedResults.map((r) => r.time))
          : null,
      },
    });

    // If allPassed == true, mark it done for the curr user

    if (allPased) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },

        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }

    // Save individual test case results using detailedResult
    const testCaseResults = detailedResults.map((result) => {
      return {
        submissionId: submission.id,
        testCase: result.testCase,
        passed: result.passed,
        stdout: result.stdout,
        expected: result.expected,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        status: result.status,
        memory: result.memory,
        time: result.time,
      };
    });

    await db.testCaseResult.createMany({
      data: testCaseResults,
    });

    const submissionWithTestCase = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });
    

    res.status(200).json({
      success: true,
      message: "Code executed Successfully! :)",
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error while executing code :(",
    });
  }
};
