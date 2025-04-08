// pages/my-rides.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";

export default function MyRides() {
	const router = useRouter();
	const [rides, setRides] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchRides = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					router.push("/login");
					return;
				}

				const response = await fetch("http://localhost:5000/api/rides/my-rides", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Failed to fetch rides");
				}

				setRides(data.rides);
			} catch (err) {
				console.error(err);
				setError("Failed to load rides. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchRides();
	}, [router]);

	// Helper function to format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return format(date, "PPP p"); // e.g. "April 4, 2025, 2:30 PM"
	};

	// Helper function to capitalize preference name
	const formatPreferenceName = (name) => {
		return name
			.replace(/([A-Z])/g, " $1")
			.replace(/^./, (str) => str.toUpperCase());
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">My Rides</h1>

				{loading && (
					<div className="flex justify-center py-10">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
					</div>
				)}

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						{error}
					</div>
				)}

				{!loading && rides.length === 0 && (
					<div className="bg-white shadow rounded-lg p-6 text-center">
						<p className="text-gray-500">You haven't offered any rides yet.</p>
						<button
							onClick={() => router.push("/offerride")}
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							Offer a Ride
						</button>
					</div>
				)}

				{rides.length > 0 && (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{rides.map((ride) => (
							<div
								key={ride.id}
								className="bg-white shadow rounded-lg overflow-hidden"
							>
								<div className="bg-blue-600 text-white px-4 py-3">
									<h2 className="font-semibold text-lg truncate">
										{ride.startLocation} → {ride.destination}
									</h2>
									<p className="text-blue-100">{formatDate(ride.dateTime)}</p>
								</div>

								<div className="p-4">
									<div className="grid grid-cols-2 gap-4 mb-4">
										<div>
											<p className="text-sm text-gray-500">Available Seats</p>
											<p className="font-medium">{ride.seats}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Price per Seat</p>
											<p className="font-medium">₹{ride.price.toFixed(2)}</p>
										</div>
									</div>

									<div className="mb-4">
										<p className="text-sm text-gray-500 mb-1">Vehicle</p>
										<p className="font-medium">
											{ride.vehicle?.model} ({ride.vehicle?.color})
										</p>
										<p className="text-sm text-gray-600">
											{ride.vehicle?.plate}
										</p>
									</div>

									{ride.preferences && (
										<div>
											<p className="text-sm text-gray-500 mb-2">Preferences</p>
											<div className="flex flex-wrap gap-2">
												{Object.entries(ride.preferences)
													.filter(
														([key, value]) =>
															value === true && key !== "id" && key !== "rideId"
													)
													.map(([key]) => (
														<span
															key={key}
															className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
														>
															{formatPreferenceName(key)}
														</span>
													))}
											</div>
										</div>
									)}

									
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
