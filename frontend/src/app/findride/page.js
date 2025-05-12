"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import OSMAutocomplete from "@/components/Autocomplete";
import {
	MapPin,
	Calendar,
	Clock,
	Users,
	CreditCard,
	Check,
	X,
	ChevronRight,
	Filter,
	Minus,
	Plus,
} from "lucide-react";

export default function FindRide() {
	const [loading, setLoading] = useState(false);
	const [rides, setRides] = useState([]);
	const [showFilters, setShowFilters] = useState(false);
	const [bookingRideId, setBookingRideId] = useState(null);
	const [selectedSeats, setSelectedSeats] = useState(1);
	const [bookingStatus, setBookingStatus] = useState({});

	const initialFormState = {
		startLocation: "",
		destination: "",
		dateTime: "",
		radius: 5, // Default 5km radius
		startLat: "",
		startLng: "",
		desLat: "",
		desLng: "",
		preferences: {
			verifiedRiders: false,
			sameGender: false,
			nonSmoking: false,
			ecoFriendly: false,
			allowPets: false,
			quietRide: false,
		},
	};

	const [formData, setFormData] = useState(initialFormState);
	const [errors, setErrors] = useState({});

	const preferences = [
		{ id: "verifiedRiders", label: "Verified riders only" },
		{ id: "sameGender", label: "Same gender only" },
		{ id: "nonSmoking", label: "Non-smoking" },
		{ id: "ecoFriendly", label: "Eco-friendly vehicles" },
		{ id: "allowPets", label: "Pets allowed" },
		{ id: "quietRide", label: "Quiet ride" },
	];

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		if (type === "checkbox") {
			setFormData((prevData) => ({
				...prevData,
				preferences: {
					...prevData.preferences,
					[name]: checked,
				},
			}));
		} else {
			setFormData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		}

		if (errors[name]) {
			setErrors((prevErrors) => ({
				...prevErrors,
				[name]: "",
			}));
		}
	};

	const handleLocationSelect = (name, value, coordinates) => {
		if (name === "startLocation") {
			setFormData((prevData) => ({
				...prevData,
				startLocation: value,
				startLat: coordinates.lat,
				startLng: coordinates.lng,
			}));
		} else if (name === "destination") {
			setFormData((prevData) => ({
				...prevData,
				destination: value,
				desLat: coordinates.lat,
				desLng: coordinates.lng,
			}));
		}

		if (errors[name]) {
			setErrors((prevErrors) => ({
				...prevErrors,
				[name]: "",
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.startLocation.trim()) {
			newErrors.startLocation = "Starting location is required";
		} else if (!formData.startLat || !formData.startLng) {
			newErrors.startLocation =
				"Valid coordinates for starting location are required";
		}

		if (!formData.destination.trim()) {
			newErrors.destination = "Destination is required";
		} else if (!formData.desLat || !formData.desLng) {
			newErrors.destination = "Valid coordinates for destination are required";
		}

		return newErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const newErrors = validateForm();
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setLoading(true);
		setErrors({});

		try {
			const searchParams = new URLSearchParams({
				startLat: formData.startLat,
				startLng: formData.startLng,
				desLat: formData.desLat,
				desLng: formData.desLng,
				radius: formData.radius,
				dateTime: formData.dateTime || "",
			});

			Object.entries(formData.preferences).forEach(([key, value]) => {
				if (value) {
					searchParams.append(`preferences[${key}]`, value);
				}
			});
			const token = localStorage.getItem("token");
			if (!token) {
				setErrors({ auth: "You must be logged in to search a ride." });
				return;
			}
			const response = await fetch(
				`${
					process.env.NEXT_PUBLIC_API_URL
				}/api/rides/find-rides?${searchParams.toString()}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					credentials: "include",
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Something went wrong");
			}

			setRides(data.rides);
		} catch (err) {
			console.error(err);
			setErrors({ submit: err.message || "Failed to find rides" });
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		});
	};

	const formatTime = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const increaseSeats = () => {
		const ride = rides.find((ride) => ride.id === bookingRideId);
		if (ride && selectedSeats < ride.seats) {
			setSelectedSeats(selectedSeats + 1);
		}
	};

	const decreaseSeats = () => {
		if (selectedSeats > 1) {
			setSelectedSeats(selectedSeats - 1);
		}
	};

	const openBookingModal = (rideId) => {
		setBookingRideId(rideId);
		setSelectedSeats(1);
	};

	const cancelBooking = () => {
		setBookingRideId(null);
		setSelectedSeats(1);
	};

	const confirmBooking = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setErrors({ auth: "You must be logged in to book a ride." });
				return;
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/rides/book-ride/${bookingRideId}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ seats: selectedSeats }),
					credentials: "include",
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to book ride");
			}

			setBookingStatus((prev) => ({
				...prev,
				[bookingRideId]: "PENDING",
			}));

		
			setBookingRideId(null);
			setSelectedSeats(1);
		} catch (err) {
			console.error(err);
			setErrors({ book: err.message || "Failed to book ride" });
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			
			<Navbar />
			<div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<main>
					<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold text-gray-800">Find a Ride</h2>
							<button
								type="button"
								onClick={() => setShowFilters(!showFilters)}
								className="flex items-center text-blue-600 hover:text-blue-800"
							>
								<Filter size={18} className="mr-1" />
								{showFilters ? "Hide Filters" : "Show Filters"}
							</button>
						</div>

						{errors.auth && (
							<div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
								{errors.auth}
							</div>
						)}

						{errors.submit && (
							<div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
								{errors.submit}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
								<div className="col-span-1 md:col-span-1">
									<OSMAutocomplete
										label="From"
										name="startLocation"
										placeholder="Enter starting location"
										value={formData.startLocation}
										onChange={(value, coordinates) =>
											handleLocationSelect("startLocation", value, coordinates)
										}
										error={errors.startLocation}
										options={{
											countries: "IN",
										}}
									/>
								</div>

								<div className="col-span-1 md:col-span-1">
									<OSMAutocomplete
										label="To"
										name="destination"
										placeholder="Enter destination"
										value={formData.destination}
										onChange={(value, coordinates) =>
											handleLocationSelect("destination", value, coordinates)
										}
										error={errors.destination}
										options={{
											countries: "IN",
										}}
									/>
								</div>

								<div className="col-span-1 md:col-span-1">
									<label
										htmlFor="dateTime"
										className="block text-sm font-medium text-gray-700"
									>
										Date & Time (Optional)
									</label>
									<input
										type="datetime-local"
										id="dateTime"
										name="dateTime"
										value={formData.dateTime}
										onChange={handleChange}
										className="mt-1 block p-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
									/>
								</div>

								<div className="col-span-1 md:col-span-1">
									<div className="h-full flex items-end">
										<button
											type="submit"
											disabled={loading}
											className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
										>
											{loading ? (
												<>
													<svg
														className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
													>
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														></circle>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														></path>
													</svg>
													Searching...
												</>
											) : (
												"Search Rides"
											)}
										</button>
									</div>
								</div>
							</div>

							{/* Filters Section */}
							{showFilters && (
								<div className="p-4 border border-gray-200 rounded-lg mt-4">
									<h3 className="text-lg font-medium mb-4">Preferences</h3>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
										{preferences.map((pref) => (
											<div key={pref.id} className="flex items-center gap-2">
												<input
													type="checkbox"
													id={pref.id}
													name={pref.id}
													checked={formData.preferences[pref.id] || false}
													onChange={handleChange}
													className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
												/>
												<label
													htmlFor={pref.id}
													className="text-sm font-medium text-gray-700"
												>
													{pref.label}
												</label>
											</div>
										))}
									</div>

									<div className="mt-4">
										<label
											htmlFor="radius"
											className="block text-sm font-medium text-gray-700"
										>
											Search Radius (km)
										</label>
										<input
											type="range"
											id="radius"
											name="radius"
											min="1"
											max="50"
											value={formData.radius}
											onChange={handleChange}
											className="mt-1 w-full"
										/>
										<div className="flex justify-between text-xs text-gray-500">
											<span>1 km</span>
											<span>{formData.radius} km</span>
											<span>50 km</span>
										</div>
									</div>
								</div>
							)}
						</form>
					</div>

					{/* Results Section */}
					<div className="mt-6">
						<h3 className="text-xl font-semibold mb-4 ml-4">
							{rides.length > 0
								? `Found ${rides.length} ${
										rides.length === 1 ? "ride" : "rides"
								  }`
								: "No rides found"}
						</h3>

						{errors.book && (
							<div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
								{errors.book}
							</div>
						)}

						<div className="space-y-4">
							{rides.map((ride) => (
								<div
									key={ride.id}
									className="bg-white rounded-lg shadow-md overflow-hidden"
								>
									<div className="p-6">
										<div className="flex flex-col md:flex-row md:justify-between md:items-center">
											<div className="flex-1">
												<div className="flex items-start mb-4">
													<div className="flex flex-col items-center mr-4">
														<div className="bg-blue-100 p-2 rounded-full">
															<MapPin className="h-5 w-5 text-blue-600" />
														</div>
														<div className="h-10 w-0.5 bg-gray-300 my-1"></div>
														<div className="bg-green-100 p-2 rounded-full">
															<MapPin className="h-5 w-5 text-green-600" />
														</div>
													</div>

													<div className="flex-1">
														<div className="mb-3">
															<p className="text-sm text-gray-500">From</p>
															<p className="font-medium">
																{ride.startLocation}
															</p>
														</div>
														<div>
															<p className="text-sm text-gray-500">To</p>
															<p className="font-medium">{ride.destination}</p>
														</div>
													</div>
												</div>

												<div className="flex flex-wrap gap-4 mt-4">
													<div className="flex items-center">
														<Calendar className="h-4 w-4 text-gray-500 mr-1" />
														<span className="text-sm">
															{formatDate(ride.dateTime)}
														</span>
													</div>
													<div className="flex items-center">
														<Clock className="h-4 w-4 text-gray-500 mr-1" />
														<span className="text-sm">
															{formatTime(ride.dateTime)}
														</span>
													</div>
													<div className="flex items-center">
														<Users className="h-4 w-4 text-gray-500 mr-1" />
														<span className="text-sm">
															{ride.seats} {ride.seats === 1 ? "seat" : "seats"}{" "}
															available
														</span>
													</div>
													<div className="flex items-center">
														<CreditCard className="h-4 w-4 text-gray-500 mr-1" />
														<span className="text-sm">
															₹{ride.price} per seat
														</span>
													</div>
												</div>

												<div className="flex flex-wrap gap-2 mt-3">
													{Object.entries(ride.preferences || {}).map(
														([key, value]) =>
															value ? (
																<span
																	key={key}
																	className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
																>
																	<Check className="h-3 w-3 mr-1" />
																	{preferences.find((p) => p.id === key)
																		?.label || key}
																</span>
															) : null
													)}
												</div>
											</div>

											<div className="mt-4 md:mt-0 md:ml-6">
												<div className="mb-2">
													<p className="text-sm text-gray-500">Vehicle</p>
													<p className="font-medium">
														{ride.model} • {ride.color}
													</p>
												</div>

												{bookingStatus[ride.id] === "PENDING" ? (
													<div className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500">
														Request Pending
													</div>
												) : ride.booked ? (
													<div className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500">
														Booked
													</div>
												) : (
													<button
														onClick={() => openBookingModal(ride.id)}
														className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
													>
														Request Ride
														<ChevronRight className="ml-1 h-4 w-4" />
													</button>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</main>
			</div>

			{/* Seat Selection Modal */}
			{bookingRideId && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h3 className="text-lg font-medium mb-4">
							How many seats do you need?
						</h3>

						<div className="flex items-center justify-center space-x-4 my-6">
							<button
								onClick={decreaseSeats}
								className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
								disabled={selectedSeats <= 1}
							>
								<Minus size={20} />
							</button>

							<span className="text-2xl font-semibold mx-4">
								{selectedSeats}
							</span>

							<button
								onClick={increaseSeats}
								className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
								disabled={
									selectedSeats >=
									(rides.find((ride) => ride.id === bookingRideId)?.seats || 1)
								}
							>
								<Plus size={20} />
							</button>
						</div>

						<p className="text-center mb-6">
							Total Price: ₹
							{(rides.find((ride) => ride.id === bookingRideId)?.price || 0) *
								selectedSeats}
						</p>

						<div className="flex justify-end space-x-3">
							<button
								onClick={cancelBooking}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
							>
								Cancel
							</button>
							<button
								onClick={confirmBooking}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								Request Booking
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
