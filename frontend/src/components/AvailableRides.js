"use client";
import { useState } from "react";
import Link from "next/link";

export default function AvailableRides({
	rides,
	isLoading,
	searchPerformed,
	searchRadius,
}) {
	const [sortBy, setSortBy] = useState("datetime");

	// Sort rides based on selected criteria
	const sortedRides = [...rides].sort((a, b) => {
		switch (sortBy) {
			case "price":
				return a.price - b.price;
			case "datetime":
				return new Date(a.datetime) - new Date(b.datetime);
			case "seats":
				return b.availableSeats - a.availableSeats;
			case "proximity":
				const aProximity =
					parseFloat(a.route.fromDistance) + parseFloat(a.route.toDistance);
				const bProximity =
					parseFloat(b.route.fromDistance) + parseFloat(b.route.toDistance);
				return aProximity - bProximity;
			default:
				return 0;
		}
	});

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
				<p className="text-gray-600">Searching for rides...</p>
			</div>
		);
	}

	if (!searchPerformed) {
		return null;
	}

	if (rides.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-md p-8 text-center">
				<div className="flex flex-col items-center">
					<svg
						className="w-16 h-16 text-gray-400 mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M19 9l-7 7-7-7"
						></path>
					</svg>
					<h3 className="text-xl font-medium text-gray-900 mb-2">
						No rides found
					</h3>
					<p className="text-gray-600 mb-6">
						We couldn&apos;t find any rides matching your search criteria within{" "}
						{searchRadius}km radius.
					</p>
					<p className="text-gray-600">
						Try adjusting your search parameters or{" "}
						<Link
							href="/offer-ride"
							className="text-blue-600 hover:text-blue-800"
						>
							offer a ride
						</Link>{" "}
						yourself!
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-800">
					Available Rides ({rides.length})
				</h2>
				<div className="flex items-center">
					<label htmlFor="sortBy" className="mr-2 text-gray-700">
						Sort by:
					</label>
					<select
						id="sortBy"
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value)}
						className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="datetime">Departure Time</option>
						<option value="price">Price (Low to High)</option>
						<option value="seats">Available Seats</option>
						<option value="proximity">Proximity</option>
					</select>
				</div>
			</div>

			<div className="space-y-6">
				{sortedRides.map((ride) => (
					<div
						key={ride.id}
						className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
					>
						<div className="p-6">
							<div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
								<div className="flex items-center mb-2 md:mb-0">
									<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											></path>
										</svg>
									</div>
									<div>
										<p className="font-semibold text-gray-900">
											{ride.driver.name}
											{ride.driver.verified && (
												<span className="ml-2 bg-green-100 text-green-800 text-xs font-medium py-0.5 px-2 rounded-full">
													Verified
												</span>
											)}
										</p>
										<div className="flex items-center text-sm text-gray-500">
											<svg
												className="w-4 h-4 text-yellow-400 mr-1"
												fill="currentColor"
												viewBox="0 0 20 20"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
											</svg>
											{ride.driver.rating} rating
										</div>
									</div>
								</div>
								<div className="flex flex-col items-end">
									<span className="text-2xl font-bold text-gray-900">
										₹{ride.price}
									</span>
									<span className="text-sm text-gray-500">per seat</span>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
								<div className="md:col-span-2">
									<div className="flex items-start">
										<div className="flex flex-col items-center mr-4">
											<div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center">
												<div className="w-3 h-3 rounded-full bg-green-600"></div>
											</div>
											<div className="w-0.5 h-12 bg-gray-300"></div>
											<div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center">
												<div className="w-3 h-3 rounded-full bg-red-600"></div>
											</div>
										</div>
										<div className="flex flex-col justify-between h-full">
											<div>
												<p className="font-medium text-gray-900">
													{ride.route.from}
												</p>
												<p className="text-sm text-blue-600">
													{ride.route.fromDistance} km from your start point
												</p>
											</div>
											<div className="mt-6">
												<p className="font-medium text-gray-900">
													{ride.route.to}
												</p>
												<p className="text-sm text-blue-600">
													{ride.route.toDistance} km from your destination
												</p>
											</div>
										</div>
									</div>
								</div>

								<div>
									<p className="text-sm text-gray-500 mb-1">Departure</p>
									<p className="font-medium text-gray-900">
										{new Date(ride.datetime).toLocaleDateString(undefined, {
											weekday: "short",
											month: "short",
											day: "numeric",
										})}
									</p>
									<p className="font-medium text-gray-900">
										{new Date(ride.datetime).toLocaleTimeString(undefined, {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-500 mb-1">Vehicle</p>
									<p className="font-medium text-gray-900">
										{ride.vehicle.model}
									</p>
									<p className="text-sm text-gray-600">
										{ride.vehicle.color} • {ride.vehicle.plate}
									</p>
								</div>
							</div>

							<div className="flex flex-wrap gap-2 mb-4">
								<span className="bg-blue-100 text-blue-800 text-xs font-medium py-1 px-2 rounded">
									{ride.availableSeats} seats available
								</span>
								{ride.preferences.map((pref, idx) => (
									<span
										key={idx}
										className="bg-gray-100 text-gray-800 text-xs font-medium py-1 px-2 rounded"
									>
										{pref}
									</span>
								))}
								<span className="bg-green-100 text-green-800 text-xs font-medium py-1 px-2 rounded flex items-center">
									<svg
										className="w-3 h-3 mr-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M5 13l4 4L19 7"
										></path>
									</svg>
									Save {ride.ecoImpact.co2Saved} CO₂
								</span>
							</div>

							<div className="flex justify-end">
								<Link
									href={`/book-ride/${ride.id}`}
									className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
								>
									Book Seat
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
