"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";

export default function MyRides() {
	const router = useRouter();
	const [rides, setRides] = useState([]);
	const [bookingRequests, setBookingRequests] = useState([]);
	const [myBookings, setMyBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [bookingsLoading, setBookingsLoading] = useState(true);
	const [myBookingsLoading, setMyBookingsLoading] = useState(true);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("rides");

	useEffect(() => {
		const fetchRides = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					router.push("/login");
					return;
				}

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/rides/my-rides`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
						credentials: "include",
					}
				);

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

		const fetchBookingRequests = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					return;
				}

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/rides/pending-bookings`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
						credentials: "include",
					}
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Failed to fetch booking requests");
				}

				setBookingRequests(data.pendingBookings || []);
			} catch (err) {
				console.error("Error fetching booking requests:", err);
			} finally {
				setBookingsLoading(false);
			}
		};

		const fetchMyBookings = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					return;
				}

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/rides/user-bookings`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
						credentials: "include",
					}
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Failed to fetch my bookings");
				}

				setMyBookings(data.bookings || []);
			} catch (err) {
				console.error("Error fetching my bookings:", err);
			} finally {
				setMyBookingsLoading(false);
			}
		};

		fetchRides();
		fetchBookingRequests();
		fetchMyBookings();
	}, [router]);

	// Helper function to format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return format(date, "PPP p");
	};

	const formatPreferenceName = (name) => {
		return name
			.replace(/([A-Z])/g, " $1")
			.replace(/^./, (str) => str.toUpperCase());
	};

	const handleApproveBooking = async (bookingId) => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/rides/bookings/${bookingId}/approve`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to approve booking");
			}

			// Update the booking status locally
			setBookingRequests((prevRequests) =>
				prevRequests.filter((booking) => booking.id !== bookingId)
			);

			alert("Booking approved successfully!");

			// Refresh rides to update available seats
			const ridesResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/rides/my-rides`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			const ridesData = await ridesResponse.json();
			setRides(ridesData.rides);
		} catch (err) {
			console.error("Error approving booking:", err);
			alert(err.message || "Failed to approve booking");
		}
	};

	const handleRejectBooking = async (bookingId) => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/rides/bookings/${bookingId}/reject`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to reject booking");
			}

			// Update the booking status locally
			setBookingRequests((prevRequests) =>
				prevRequests.filter((booking) => booking.id !== bookingId)
			);

			alert("Booking rejected successfully!");
		} catch (err) {
			console.error("Error rejecting booking:", err);
			alert(err.message || "Failed to reject booking");
		}
	};

	const handleCancelBooking = async (bookingId) => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/rides/cancel-booking/${bookingId}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to cancel booking");
			}


			setMyBookings((prevBookings) =>
				prevBookings.map((booking) =>
					booking.id === bookingId
						? { ...booking, status: "CANCELLED" }
						: booking
				)
			);

			alert("Booking cancelled successfully!");
		} catch (err) {
			console.error("Error cancelling booking:", err);
			alert(err.message || "Failed to cancel booking");
		}
	};

	// Helper function to get status badge color
	const getStatusBadgeColor = (status) => {
		switch (status) {
			case "PENDING":
				return "bg-yellow-100 text-yellow-800";
			case "CONFIRMED":
				return "bg-green-100 text-green-800";
			case "REJECTED":
				return "bg-red-100 text-red-800";
			case "CANCELLED":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// Helper function to get status icon
	const getStatusIcon = (status) => {
		switch (status) {
			case "PENDING":
				return (
					<svg
						className="w-5 h-5 text-yellow-600"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
							clipRule="evenodd"
						></path>
					</svg>
				);
			case "CONFIRMED":
				return (
					<svg
						className="w-5 h-5 text-green-600"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						></path>
					</svg>
				);
			case "REJECTED":
				return (
					<svg
						className="w-5 h-5 text-red-600"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clipRule="evenodd"
						></path>
					</svg>
				);
			case "CANCELLED":
				return (
					<svg
						className="w-5 h-5 text-gray-600"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clipRule="evenodd"
						></path>
					</svg>
				);
			default:
				return (
					<svg
						className="w-5 h-5 text-gray-600"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
							clipRule="evenodd"
						></path>
					</svg>
				);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">My Rides</h1>

				{/* Tab Navigation */}
				<div className="mb-8 border-b border-gray-200">
					<div className="flex flex-wrap -mb-px">
						<button
							className={`inline-flex items-center px-4 py-3 font-medium text-sm border-b-2 ${
								activeTab === "rides"
									? "text-blue-600 border-blue-600"
									: "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
							}`}
							onClick={() => setActiveTab("rides")}
						>
							<svg
								className="w-5 h-5 mr-2"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
								<path d="M3 4h3.5a1 1 0 011 .8L8 7h9a1 1 0 01.9 1.45l-2 4a1 1 0 01-.9.55H8l-.5 1H13a3 3 0 013 3 .5.5 0 01-1 0 2 2 0 00-2-2H6.5a.5.5 0 010-1H7l1-2H4V7H2a1 1 0 010-2h1V4zm11.7 4H8.8l-.5-1H4v1h3.3l.6 1.2.1.3L7 13h7l1.7-3.5.3-.5z" />
							</svg>
							My Offered Rides
						</button>
						<button
							className={`inline-flex items-center px-4 py-3 font-medium text-sm border-b-2 ${
								activeTab === "bookings"
									? "text-blue-600 border-blue-600"
									: "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
							}`}
							onClick={() => setActiveTab("bookings")}
						>
							<svg
								className="w-5 h-5 mr-2"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
							Booking Requests
							{bookingRequests.length > 0 && (
								<span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
									{bookingRequests.length}
								</span>
							)}
						</button>
						<button
							className={`inline-flex items-center px-4 py-3 font-medium text-sm border-b-2 ${
								activeTab === "mybookings"
									? "text-blue-600 border-blue-600"
									: "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
							}`}
							onClick={() => setActiveTab("mybookings")}
						>
							<svg
								className="w-5 h-5 mr-2"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
									clipRule="evenodd"
								/>
							</svg>
							My Bookings
						</button>
					</div>
				</div>

				{/* My Rides Tab Content */}
				{activeTab === "rides" && (
					<>
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
								<p className="text-gray-500">
									You haven&apos;t offered any rides yet.
								</p>
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
										className="bg-white shadow rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg"
									>
										<div className="bg-blue-600 text-white px-4 py-3">
											<h2 className="font-semibold text-lg truncate">
												{ride.startLocation} → {ride.destination}
											</h2>
											<p className="text-blue-100">
												{formatDate(ride.dateTime)}
											</p>
										</div>

										<div className="p-4">
											<div className="grid grid-cols-2 gap-4 mb-4">
												<div>
													<p className="text-sm text-gray-500">
														Available Seats
													</p>
													<p className="font-medium">{ride.seats}</p>
												</div>
												<div>
													<p className="text-sm text-gray-500">
														Price per Seat
													</p>
													<p className="font-medium">
														₹{ride.price.toFixed(2)}
													</p>
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
												<div className="mb-4">
													<p className="text-sm text-gray-500 mb-2">
														Preferences
													</p>
													<div className="flex flex-wrap gap-2">
														{Object.entries(ride.preferences)
															.filter(
																([key, value]) =>
																	value === true &&
																	key !== "id" &&
																	key !== "rideId"
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
					</>
				)}

				{/* Booking Requests Tab Content */}
				{activeTab === "bookings" && (
					<>
						{bookingsLoading ? (
							<div className="flex justify-center py-10">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
							</div>
						) : bookingRequests.length === 0 ? (
							<div className="bg-white shadow rounded-lg p-8 text-center">
								<div className="flex justify-center mb-4">
									<svg
										className="w-16 h-16 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="1.5"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										></path>
									</svg>
								</div>
								<h3 className="text-lg font-medium text-gray-900 mb-1">
									No pending booking requests
								</h3>
								<p className="text-gray-500">
									When someone requests to join your ride, you&apos;ll see their
									requests here.
								</p>
							</div>
						) : (
							<div className="space-y-6">
								{bookingRequests.map((booking) => (
									<div
										key={booking.id}
										className="bg-white shadow rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg"
									>
										<div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200 p-4">
											<div className="flex justify-between items-center">
												<div className="flex items-center">
													<div className="bg-yellow-200 rounded-full p-2 mr-4">
														<svg
															className="w-6 h-6 text-yellow-700"
															fill="currentColor"
															viewBox="0 0 20 20"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																fillRule="evenodd"
																d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z"
																clipRule="evenodd"
															></path>
														</svg>
													</div>
													<div>
														<h3 className="font-semibold text-lg">
															{booking.ride.startLocation} →{" "}
															{booking.ride.destination}
														</h3>
														<p className="text-gray-600">
															{formatDate(booking.ride.dateTime)}
														</p>
													</div>
												</div>
												<div className="text-right">
													<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
														<svg
															className="w-4 h-4 mr-1.5"
															fill="currentColor"
															viewBox="0 0 20 20"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																fillRule="evenodd"
																d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
																clipRule="evenodd"
															></path>
														</svg>
														Pending Approval
													</span>
												</div>
											</div>
										</div>

										<div className="p-6">
											<div className="flex flex-col md:flex-row md:space-x-8">
												{/* Requester Details Card */}
												<div className="flex-1 mb-4 md:mb-0">
													<div className="bg-gray-50 rounded-lg p-4">
														<div className="flex items-center mb-4">
															<div className="bg-blue-100 rounded-full p-2 mr-3">
																<svg
																	className="w-5 h-5 text-blue-600"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																	xmlns="http://www.w3.org/2000/svg"
																>
																	<path
																		fillRule="evenodd"
																		d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
																		clipRule="evenodd"
																	></path>
																</svg>
															</div>
															<h4 className="font-medium text-gray-900">
																Requester Details
															</h4>
														</div>

														<div className="space-y-2">
															<div className="flex items-center">
																<p className="font-medium">
																	{booking.user.fullName}
																</p>
																{booking.user.verificationStatus ===
																	"APPROVED" && (
																	<span className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
																		<svg
																			className="w-3 h-3 mr-0.5"
																			fill="currentColor"
																			viewBox="0 0 20 20"
																			xmlns="http://www.w3.org/2000/svg"
																		>
																			<path
																				fillRule="evenodd"
																				d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																				clipRule="evenodd"
																			></path>
																		</svg>
																		Verified
																	</span>
																)}
															</div>
															<p className="text-sm text-gray-600">
																{booking.user.email}
															</p>
															{booking.user.phoneNumber && (
																<p className="text-sm text-gray-600">
																	{booking.user.phoneNumber}
																</p>
															)}
															<div className="flex items-center mt-1">
																<div className="flex items-center text-yellow-500">
																	<svg
																		className="w-4 h-4"
																		fill="currentColor"
																		viewBox="0 0 20 20"
																		xmlns="http://www.w3.org/2000/svg"
																	>
																		<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
																	</svg>
																	<span className="ml-1 text-sm font-medium">
																		{booking.user.rating || "N/A"}
																	</span>
																</div>
															</div>
														</div>
													</div>
												</div>

												{/* Booking Details Card */}
												<div className="flex-1">
													<div className="bg-gray-50 rounded-lg p-4">
														<div className="flex items-center mb-4">
															<div className="bg-blue-100 rounded-full p-2 mr-3">
																<svg
																	className="w-5 h-5 text-blue-600"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																	xmlns="http://www.w3.org/2000/svg"
																>
																	<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
																</svg>
															</div>
															<h4 className="font-medium text-gray-900">
																Booking Details
															</h4>
														</div>

														<div className="space-y-3">
															<div className="flex justify-between">
																<span className="text-sm text-gray-600">
																	Seats Requested:
																</span>
																<span className="font-medium">
																	{booking.seats}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-sm text-gray-600">
																	Total Price:
																</span>
																<span className="font-medium text-green-700">
																	₹
																	{(booking.seats * booking.ride.price).toFixed(
																		2
																	)}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-sm text-gray-600">
																	Available Seats:
																</span>
																<span className="font-medium">
																	{booking.ride.availableSeats}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-sm text-gray-600">
																	Requested On:
																</span>
																<span className="font-medium">
																	{format(new Date(booking.createdAt), "PPP")}
																</span>
															</div>
														</div>
													</div>
												</div>
											</div>

											<div className="mt-6 grid grid-cols-2 gap-4">
												<button
													onClick={() => handleApproveBooking(booking.id)}
													className="px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center"
												>
													<svg
														className="w-5 h-5 mr-2"
														fill="currentColor"
														viewBox="0 0 20 20"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														></path>
													</svg>
													Approve Request
												</button>
												<button
													onClick={() => handleRejectBooking(booking.id)}
													className="px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center justify-center"
												>
													<svg
														className="w-5 h-5 mr-2"
														fill="currentColor"
														viewBox="0 0 20 20"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															fillRule="evenodd"
															d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
															clipRule="evenodd"
														></path>
													</svg>
													Reject Request
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</>
				)}

				{/* My Bookings Tab Content */}
				{activeTab === "mybookings" && (
					<>
						{myBookingsLoading ? (
							<div className="flex justify-center py-10">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
							</div>
						) : myBookings.length === 0 ? (
							<div className="bg-white shadow rounded-lg p-8 text-center">
								<div className="flex justify-center mb-4">
									<svg
										className="w-16 h-16 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="1.5"
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										></path>
									</svg>
								</div>
								<h3 className="text-lg font-medium text-gray-900 mb-1">
									No bookings yet
								</h3>
								<p className="text-gray-500 mb-4">
									You haven&apos;t booked any rides yet. Find a ride to get
									started!
								</p>
								<button
									onClick={() => router.push("/findride")}
									className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300"
								>
									<svg
										className="w-5 h-5 mr-2"
										fill="currentColor"
										viewBox="0 0 20 20"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											fillRule="evenodd"
											d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
											clipRule="evenodd"
										></path>
									</svg>
									Find a Ride
								</button>
							</div>
						) : (
							<div className="space-y-6">
								{myBookings.map((booking) => (
									<div
										key={booking.id}
										className="bg-white shadow rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg"
									>
										<div
											className={`p-4 flex items-center ${
												booking.status === "CONFIRMED"
													? "bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200"
													: booking.status === "PENDING"
													? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200"
													: booking.status === "REJECTED"
													? "bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200"
													: "bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200"
											}`}
										>
											<div
												className={`rounded-full p-2 mr-4 ${
													booking.status === "CONFIRMED"
														? "bg-green-200"
														: booking.status === "PENDING"
														? "bg-yellow-200"
														: booking.status === "REJECTED"
														? "bg-red-200"
														: "bg-gray-200"
												}`}
											>
												{getStatusIcon(booking.status)}
											</div>
											<div className="flex-1">
												<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
													<div>
														<h3 className="font-semibold text-lg">
															{booking.ride.startLocation} →{" "}
															{booking.ride.destination}
														</h3>
														<p className="text-gray-600">
															{formatDate(booking.ride.dateTime)}
														</p>
													</div>
													<div className="mt-2 sm:mt-0">
														<span
															className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
																booking.status === "CONFIRMED"
																	? "bg-green-100 text-green-800"
																	: booking.status === "PENDING"
																	? "bg-yellow-100 text-yellow-800"
																	: booking.status === "REJECTED"
																	? "bg-red-100 text-red-800"
																	: "bg-gray-100 text-gray-800"
															}`}
														>
															{getStatusIcon(booking.status)}
															<span className="ml-1.5">{booking.status}</span>
														</span>
													</div>
												</div>
											</div>
										</div>

										<div className="p-6">
											<div className="flex flex-col lg:flex-row lg:space-x-6">
												{/* Left section - driver details and vehicle */}
												<div className="flex-1 mb-6 lg:mb-0">
													<div className="bg-gray-50 rounded-lg p-4 mb-4">
														<div className="flex items-center mb-3">
															<div className="bg-blue-100 rounded-full p-2 mr-3">
																<svg
																	className="w-5 h-5 text-blue-600"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																	xmlns="http://www.w3.org/2000/svg"
																>
																	<path
																		fillRule="evenodd"
																		d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
																		clipRule="evenodd"
																	></path>
																</svg>
															</div>
															<h4 className="font-medium text-gray-900">
																Driver Details
															</h4>
														</div>

														<div className="space-y-2">
															<div className="flex items-center">
																<p className="font-medium">
																	{booking.ride.driver.fullName}
																</p>
															</div>
															<p className="text-sm text-gray-600">
																{booking.ride.driver.email}
															</p>
															{booking.ride.driver.phoneNumber &&
																booking.status === "CONFIRMED" && (
																	<p className="text-sm text-gray-600">
																		{booking.ride.driver.phoneNumber}
																	</p>
																)}
															<div className="flex items-center mt-1">
																<div className="flex items-center text-yellow-500">
																	<svg
																		className="w-4 h-4"
																		fill="currentColor"
																		viewBox="0 0 20 20"
																		xmlns="http://www.w3.org/2000/svg"
																	>
																		<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
																	</svg>
																	<span className="ml-1 text-sm font-medium">
																		{booking.ride.driver.rating || "N/A"}
																	</span>
																</div>
															</div>
														</div>
													</div>

													<div className="bg-gray-50 rounded-lg p-4">
														<div className="flex items-center mb-3">
															<div className="bg-blue-100 rounded-full p-2 mr-3">
																<svg
																	className="w-5 h-5 text-blue-600"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																	xmlns="http://www.w3.org/2000/svg"
																>
																	<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
																	<path d="M3 4h3.5a1 1 0 011 .8L8 7h9a1 1 0 01.9 1.45l-2 4a1 1 0 01-.9.55H8l-.5 1H13a3 3 0 013 3 .5.5 0 01-1 0 2 2 0 00-2-2H6.5a.5.5 0 010-1H7l1-2H4V7H2a1 1 0 010-2h1V4z" />
																</svg>
															</div>
															<h4 className="font-medium text-gray-900">
																Vehicle Information
															</h4>
														</div>

														<div className="space-y-2">
															<p className="text-sm text-gray-700">
																<span className="font-medium">Model:</span>{" "}
																{booking.ride.vehicle?.model}
															</p>
															<p className="text-sm text-gray-700">
																<span className="font-medium">Color:</span>{" "}
																{booking.ride.vehicle?.color}
															</p>
															{booking.status === "CONFIRMED" && (
																<p className="text-sm text-gray-700">
																	<span className="font-medium">Plate:</span>{" "}
																	{booking.ride.vehicle?.plate}
																</p>
															)}
														</div>
													</div>
												</div>

												{/* Right section - booking details and preferences */}
												<div className="flex-1">
													<div className="bg-gray-50 rounded-lg p-4 mb-4">
														<div className="flex items-center mb-3">
															<div className="bg-blue-100 rounded-full p-2 mr-3">
																<svg
																	className="w-5 h-5 text-blue-600"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																	xmlns="http://www.w3.org/2000/svg"
																>
																	<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
																</svg>
															</div>
															<h4 className="font-medium text-gray-900">
																Booking Details
															</h4>
														</div>

														<div className="grid grid-cols-2 gap-3">
															<div>
																<p className="text-sm text-gray-600">
																	Seats Booked
																</p>
																<p className="font-medium">{booking.seats}</p>
															</div>
															<div>
																<p className="text-sm text-gray-600">
																	Total Price
																</p>
																<p className="font-medium text-green-700">
																	₹
																	{(booking.seats * booking.ride.price).toFixed(
																		2
																	)}
																</p>
															</div>
															<div>
																<p className="text-sm text-gray-600">
																	Booked On
																</p>
																<p className="font-medium">
																	{format(new Date(booking.createdAt), "PPP")}
																</p>
															</div>
															<div>
																<p className="text-sm text-gray-600">
																	Price per Seat
																</p>
																<p className="font-medium">
																	₹{booking.ride.price.toFixed(2)}
																</p>
															</div>
														</div>
													</div>

													{booking.ride.preferences &&
														Object.values(booking.ride.preferences).some(
															(value) => value === true
														) && (
															<div className="bg-gray-50 rounded-lg p-4">
																<div className="flex items-center mb-3">
																	<div className="bg-blue-100 rounded-full p-2 mr-3">
																		<svg
																			className="w-5 h-5 text-blue-600"
																			fill="currentColor"
																			viewBox="0 0 20 20"
																			xmlns="http://www.w3.org/2000/svg"
																		>
																			<path
																				fillRule="evenodd"
																				d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
																				clipRule="evenodd"
																			></path>
																		</svg>
																	</div>
																	<h4 className="font-medium text-gray-900">
																		Ride Preferences
																	</h4>
																</div>

																<div className="flex flex-wrap gap-2">
																	{Object.entries(booking.ride.preferences)
																		.filter(
																			([key, value]) =>
																				value === true &&
																				key !== "id" &&
																				key !== "rideId"
																		)
																		.map(([key]) => (
																			<span
																				key={key}
																				className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
																			>
																				<svg
																					className="w-3 h-3 mr-1"
																					fill="currentColor"
																					viewBox="0 0 20 20"
																					xmlns="http://www.w3.org/2000/svg"
																				>
																					<path
																						fillRule="evenodd"
																						d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																						clipRule="evenodd"
																					></path>
																				</svg>
																				{formatPreferenceName(key)}
																			</span>
																		))}
																</div>
															</div>
														)}
												</div>
											</div>

											{(booking.status === "PENDING" ||
												booking.status === "CONFIRMED") && (
												<div className="mt-6">
													<button
														onClick={() => handleCancelBooking(booking.id)}
														className="px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center justify-center w-full sm:w-auto"
													>
														<svg
															className="w-5 h-5 mr-2"
															fill="currentColor"
															viewBox="0 0 20 20"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																fillRule="evenodd"
																d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
																clipRule="evenodd"
															></path>
														</svg>
														Cancel Booking
													</button>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
