import React, { useState, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import {
	Bookmark,
	Loader2,
	PencilIcon,
	Plus,
	Trash,
	TrashIcon,
} from "lucide-react";
import { useAction } from "../store/useAction";
import { usePlaylistStore } from "../store/usePlaylistStore.js";
import AddToPlaylist from "./AddToPlaylist.jsx";
import CreatePlaylistModal from "./CreatePlaylistModal.jsx";

const ProblemTable = ({ problems }) => {
	const { authUser } = useAuthStore();
	const [search, setSearch] = useState("");
	const [difficulty, setDifficulty] = useState("ALL");
	const [selectedTag, setSelectedTag] = useState("ALL");
	const [currentPage, setCurrentPage] = useState(1);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
	const [selectedProblemId, setSelectedProblemId] = useState(null);

	const { isDeletingProblem, onDeleteProblem } = useAction();
	const { createPlaylist } = usePlaylistStore();

	// console.log(problems);

	const handleCreatePlaylist = async (data) => {
		await createPlaylist(data)
	}

	const handleDelete = async (id) => {
		await onDeleteProblem(id);
	};

	const handleAddToPlaylist = async (problemId) => {
		setSelectedProblemId(problemId);
		setIsAddToPlaylistModalOpen(true);
	};

	const allTags = useMemo(() => {
		if (!Array.isArray(problems)) return [];

		const tagsSet = new Set();

		problems.forEach((p) => p.tags?.forEach((t) => tagsSet.add(t)));

		return Array.from(tagsSet);
	}, [problems]);

	const difficulties = ["EASY", "MEDIUM", "HARD"];

	const filteredProblems = useMemo(() => {
		return (problems || [])
			.filter((problem) =>
				problem.title.toLowerCase().includes(search.toLowerCase())
			)
			.filter((problem) =>
				difficulty === "ALL" ? true : problem.difficulty === difficulty
			)
			.filter((problem) =>
				selectedTag === "ALL"
					? true
					: problem.tags?.includes(selectedTag)
			);
	}, [problems, search, difficulty, selectedTag]);

	const itemsPerPage = 5;
	const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
	const paginatedProblems = useMemo(() => {
		return filteredProblems.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		);
	}, [filteredProblems, currentPage]);

	return (
		<div className="w-full max-w-6xl mx-auto mt-10">
			{/* Header with Create Playlist Button */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold">Problems</h2>
				<button
					className="btn btn-primary gap-2"
					onClick={() => setIsCreateModalOpen(true)}
				>
					<Plus className="w-4 h-4" />
					Create Playlist
				</button>
			</div>

			{/* Filters */}
			<div className="flex flex-nowrap justify-between items-center mb-6 gap-4">
				<input
					type="text"
					placeholder="Search by title"
					className="input input-bordered w-full md:w-1/3 bg-base-200"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<select
					className="select select-bordered bg-base-200"
					value={difficulty}
					onChange={(e) => setDifficulty(e.target.value)}
				>
					<option value="ALL">All Difficulties</option>
					{difficulties.map((diff) => (
						<option key={diff} value={diff}>
							{diff.charAt(0).toUpperCase() +
								diff.slice(1).toLowerCase()}
						</option>
					))}
				</select>
				<select
					className="select select-bordered bg-base-200"
					value={selectedTag}
					onChange={(e) => setSelectedTag(e.target.value)}
				>
					<option value="ALL">All Tags</option>
					{allTags.map((tag) => (
						<option key={tag} value={tag}>
							{tag}
						</option>
					))}
				</select>
			</div>

			{/* Table */}
			<div className="overflow-x-auto rounded-xl shadow-md">
				<table className="table table-zebra table-lg bg-base-200 text-base-content">
					<thead className="bg-base-300">
						<tr>
							<th>Solved</th>
							<th>Title</th>
							<th>Tags</th>
							<th>Difficulty</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{paginatedProblems.length > 0 ? (
							paginatedProblems.map((problem) => {
								const isSolved = problem.solvedBy.some(
									(user) => user.userId === authUser?.id
								);
								return (
									<tr key={problem.id}>
										<td>
											<input
												type="checkbox"
												checked={isSolved}
												readOnly
												className="checkbox checkbox-sm"
											/>
										</td>
										<td>
											<Link
												to={`/problem/${problem.id}`}
												className="font-semibold hover:underline"
											>
												{problem.title}
											</Link>
										</td>
										<td>
											<div className="flex flex-wrap gap-1">
												{(problem.tags || []).map(
													(tag, idx) => (
														<span
															key={idx}
															className="badge badge-outline badge-warning text-xs font-bold"
														>
															{tag}
														</span>
													)
												)}
											</div>
										</td>
										<td>
											<span
												className={`badge font-semibold text-xs text-white ${
													problem.difficulty ===
													"EASY"
														? "badge-success"
														: problem.difficulty ===
														  "MEDIUM"
														? "badge-warning"
														: "badge-error"
												}`}
											>
												{problem.difficulty}
											</span>
										</td>
										<td>
											<div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
												{authUser?.role === "ADMIN" && (
													<div className="flex gap-2">
														<button
															onClick={() =>
																handleDelete(
																	problem.id
																)
															}
															className="btn btn-sm btn-error"
														>
															{isDeletingProblem ? (
																<Loader2 className="animate-spin h-4 w-4" />
															) : (
																<TrashIcon className="w-4 h-4 text-white" />
															)}
														</button>
														<button
															disabled
															className="btn btn-sm btn-warning"
														>
															<PencilIcon className="w-4 h-4 text-white" />
														</button>
													</div>
												)}
												<button
													className="btn btn-sm btn-outline flex gap-2 items-center"
													onClick={() =>
														handleAddToPlaylist(
															problem.id
														)
													}
												>
													<Bookmark className="w-4 h-4" />
													<span className="hidden sm:inline">
														Save to Playlist
													</span>
												</button>
											</div>
										</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td
									colSpan={5}
									className="text-center py-6 text-gray-500"
								>
									No problems found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex justify-center mt-6 gap-2">
				<button
					className="btn btn-sm"
					disabled={currentPage === 1}
					onClick={() => setCurrentPage((prev) => prev - 1)}
				>
					Prev
				</button>
				<span className="btn btn-ghost btn-sm">
					{currentPage} / {totalPages}
				</span>
				<button
					className="btn btn-sm"
					disabled={currentPage === totalPages}
					onClick={() => setCurrentPage((prev) => prev + 1)}
				>
					Next
				</button>
			</div>

			{/* Modals */}
			<CreatePlaylistModal 
				isOpen = {isCreateModalOpen}
				onClose = {() => setIsCreateModalOpen(false)}
				onSubmit = {handleCreatePlaylist}

			/>
			
			<AddToPlaylist
				isOpen={isAddToPlaylistModalOpen}
				onClose={()=>setIsAddToPlaylistModalOpen(false)}
				problemId = {selectedProblemId}

			 />
		</div>
	);
};

export default ProblemTable;
