import { useEffect, useState } from "react";



import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./page/HomePage";
import LoginPage from "./page/LoginPage";
import SignUpPage from "./page/SignUpPage";

import Layout from "./layout/Layout.jsx";

import { useAuthStore } from "./store/useAuthStore";

import { Loader } from "lucide-react";
import AdminRoute from "./components/AdminRoute.jsx";
import AddProblem from "./page/AddProblem.jsx";

function App() {
	const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth && !authUser) {
		return (
			<div className="flex flex-col items-center justify-center h-screen">
				<Loader className="size-10 animate-spin" />
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-start">
			<Toaster />
			<Routes>

				<Route path = "/" element = {<Layout/>}>
					<Route
						path="/"
						element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
					/>
				</Route>

				<Route
					path="/login"
					element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
				/>

				<Route
					path="/signup"
					element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />}
				/>

				<Route element = {<AdminRoute />}>
				<Route
					path="/add-problem"
					element = {authUser ? <AddProblem /> : <Navigate to="/" />}
				/>

				</Route>
			</Routes>
		</div>
	);
}

export default App;
