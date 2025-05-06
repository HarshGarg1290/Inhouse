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
					"http://localhost:5000/api/rides/my-rides",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
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
					"http://localhost:5000/api/rides/pending-bookings",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
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
					"http://localhost:5000/api/rides/user-bookings",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
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
				`http://localhost:5000/api/rides/bookings/${bookingId}/approve`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
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
				"http://localhost:5000/api/rides/my-rides",
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
				`http://localhost:5000/api/rides/bookings/${bookingId}/reject`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
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
				`http://localhost:5000/api/rides/cancel-booking/${bookingId}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to cancel booking");
			}

			// Update the booking status locally
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

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">My Rides</h1>

				{/* Tab Navigation */}
				<div className="flex border-b border-gray-200 mb-6">
					<button
						className={`py-2 px-4 font-medium text-sm ${
							activeTab === "rides"
								? "border-b-2 border-blue-500 text-blue-600"
								: "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setActiveTab("rides")}
					>
						My Offered Rides
					</button>
					<button
						className={`py-2 px-4 font-medium text-sm ${
							activeTab === "bookings"
								? "border-b-2 border-blue-500 text-blue-600"
								: "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setActiveTab("bookings")}
					>
						Booking Requests
						{bookingRequests.length > 0 && (
							<span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
								{bookingRequests.length}
							</span>
						)}
					</button>
					<button
						className={`py-2 px-4 font-medium text-sm ${
							activeTab === "mybookings"
								? "border-b-2 border-blue-500 text-blue-600"
								: "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setActiveTab("mybookings")}
					>
						My Bookings
					</button>
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
									You haven't offered any rides yet.
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
										className="bg-white shadow rounded-lg overflow-hidden"
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
							<div className="bg-white shadow rounded-lg p-6 text-center">
								<p className="text-gray-500">
									You don't have any pending booking requests.
								</p>
							</div>
						) : (
							<div className="space-y-6">
								{bookingRequests.map((booking) => (
									<div
										key={booking.id}
										className="bg-white shadow rounded-lg overflow-hidden"
									>
										<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
											<div className="flex justify-between items-center">
												<div>
													<h3 className="font-semibold text-lg">
														{booking.ride.startLocation} →{" "}
														{booking.ride.destination}
													</h3>
													<p className="text-gray-600">
														{formatDate(booking.ride.dateTime)}
													</p>
												</div>
												<div className="text-right">
													<span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
														Pending
													</span>
												</div>
											</div>
										</div>

										<div className="p-4">
											<div className="grid md:grid-cols-2 gap-4 mb-4">
												<div>
													<h4 className="text-sm text-gray-500">
														Requester Details
													</h4>
													<p className="font-medium">{booking.user.fullName}</p>
													<p className="text-sm text-gray-600">
														{booking.user.email}
													</p>
													{booking.user.phoneNumber && (
														<p className="text-sm text-gray-600">
															{booking.user.phoneNumber}
														</p>
													)}
													<div className="flex items-center mt-1">
														<span className="text-yellow-400 mr-1">★</span>
														<span className="text-sm">
															{booking.user.rating || "N/A"}
														</span>
														<span
															className={`ml-2 px-2 py-0.5 text-xs rounded ${
																booking.user.verificationStatus === "APPROVED"
																	? "bg-green-100 text-green-800"
																	: "bg-gray-100 text-gray-800"
															}`}
														>
															{booking.user.verificationStatus}
														</span>
													</div>
												</div>

												<div>
													<h4 className="text-sm text-gray-500">
														Booking Details
													</h4>
													<p className="text-sm">
														<span className="font-medium">Seats:</span>{" "}
														{booking.seats}
													</p>
													<p className="text-sm">
														<span className="font-medium">Total Price:</span> ₹
														{(booking.seats * booking.ride.price).toFixed(2)}
													</p>
													<p className="text-sm">
														<span className="font-medium">
															Available seats:
														</span>{" "}
														{booking.ride.availableSeats}
													</p>
													<p className="text-sm">
														<span className="font-medium">Requested on:</span>{" "}
														{format(new Date(booking.createdAt), "PPP")}
													</p>
												</div>
											</div>

											<div className="flex space-x-3 mt-4">
												<button
													onClick={() => handleApproveBooking(booking.id)}
													className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex-1"
												>
													Approve
												</button>
												<button
													onClick={() => handleRejectBooking(booking.id)}
													className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex-1"
												>
													Reject
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
							<div className="bg-white shadow rounded-lg p-6 text-center">
								<p className="text-gray-500">
									You haven't booked any rides yet.
								</p>
								<button
									onClick={() => router.push("/findride")}
									className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
								>
									Find a Ride
								</button>
							</div>
						) : (
							<div className="space-y-6">
								{myBookings.map((booking) => (
									<div
										key={booking.id}
										className="bg-white shadow rounded-lg overflow-hidden"
									>
										<div
											className={`border-l-4 p-4 ${
												booking.status === "CONFIRMED"
													? "bg-green-50 border-green-400"
													: booking.status === "PENDING"
													? "bg-yellow-50 border-yellow-400"
													: booking.status === "REJECTED"
													? "bg-red-50 border-red-400"
													: "bg-gray-50 border-gray-400"
											}`}
										>
											<div className="flex justify-between items-center">
												<div>
													<h3 className="font-semibold text-lg">
														{booking.ride.startLocation} →{" "}
														{booking.ride.destination}
													</h3>
													<p className="text-gray-600">
														{formatDate(booking.ride.dateTime)}
													</p>
												</div>
												<div className="text-right">
													<span
														className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusBadgeColor(
															booking.status
														)}`}
													>
														{booking.status}
													</span>
												</div>
											</div>
										</div>

										<div className="p-4">
											<div className="grid md:grid-cols-2 gap-4 mb-4">
												<div>
													<h4 className="text-sm text-gray-500">
														Driver Details
													</h4>
													<p className="font-medium">
														{booking.ride.driver.fullName}
													</p>
													<p className="text-sm text-gray-600">
														{booking.ride.driver.email}
													</p>
													{booking.ride.driver.phoneNumber && (
														<p className="text-sm text-gray-600">
															{booking.ride.driver.phoneNumber}
														</p>
													)}
													<div className="flex items-center mt-1">
														<span className="text-yellow-400 mr-1">★</span>
														<span className="text-sm">
															{booking.ride.driver.rating || "N/A"}
														</span>
													</div>
												</div>

												<div>
													<h4 className="text-sm text-gray-500">
														Booking Details
													</h4>
													<p className="text-sm">
														<span className="font-medium">Seats:</span>{" "}
														{booking.seats}
													</p>
													<p className="text-sm">
														<span className="font-medium">Total Price:</span> ₹
														{(booking.seats * booking.ride.price).toFixed(2)}
													</p>
													<p className="text-sm">
														<span className="font-medium">Vehicle:</span>{" "}
														{booking.ride.vehicle?.model} (
														{booking.ride.vehicle?.color})
													</p>
													<p className="text-sm">
														<span className="font-medium">Booked on:</span>{" "}
														{format(new Date(booking.createdAt), "PPP")}
													</p>
												</div>
											</div>

											{booking.status === "PENDING" ||
											booking.status === "CONFIRMED" ? (
												<div className="mt-4">
													<button
														onClick={() => handleCancelBooking(booking.id)}
														className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
													>
														Cancel Booking
													</button>
												</div>
											) : null}

											{booking.ride.preferences &&
												Object.values(booking.ride.preferences).some(
													(value) => value === true
												) && (
													<div className="mt-4">
														<h4 className="text-sm text-gray-500 mb-2">
															Ride Preferences
														</h4>
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
			</div>
		</div>
	);
}
