"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import OSMAutocomplete from "@/components/Autocomplete";

export default function OfferRide() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState("");
	const [vehicles, setVehicles] = useState([]);
	const [selectedVehicle, setSelectedVehicle] = useState("");

	const initialFormState = {
		startLocation: "",
		destination: "",
		dateTime: "",
		seats: 1,
		price: "",
		model: "",
		color: "",
		plate: "",
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

	const preferences = [
		{ id: "verifiedRiders", label: "Verified riders only" },
		{ id: "sameGender", label: "Same gender only" },
		{ id: "nonSmoking", label: "Non-smoking" },
		{ id: "ecoFriendly", label: "Eco-friendly vehicles" },
		{ id: "allowPets", label: "Pets allowed" },
		{ id: "quietRide", label: "Quiet ride" },
	];

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

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

	const validateForm = () => {
		const newErrors = {};

		if (!formData.startLocation.trim()) {
			newErrors.startLocation = "Starting location is required";
		}

		if (!formData.destination.trim()) {
			newErrors.destination = "Destination is required";
		}

		if (!formData.dateTime) {
			newErrors.dateTime = "Date and time are required";
		} else {
			const selectedDate = new Date(formData.dateTime);
			const now = new Date();
			if (selectedDate <= now) {
				newErrors.dateTime = "Date and time must be in the future";
			}
		}

		if (formData.seats < 1 || formData.seats > 10) {
			newErrors.seats = "Seats must be between 1 and 10";
		}

		if (
			formData.price === "" ||
			isNaN(formData.price) ||
			Number(formData.price) < 0
		) {
			newErrors.price = "Please enter a valid price";
		}

		// Only validate vehicle details if no vehicle is selected from dropdown
		if (!selectedVehicle) {
			if (!formData.model.trim()) {
				newErrors.model = "Vehicle model is required";
			}

			if (!formData.color.trim()) {
				newErrors.color = "Vehicle color is required";
			}

			if (!formData.plate.trim()) {
				newErrors.plate = "License plate is required";
			}
		}

		return newErrors;
	};

	useEffect(() => {
		const fetchVehicles = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setErrors({ auth: "You must be logged in to offer a ride." });
					return;
				}

				const response = await fetch("http://localhost:5000/api/rides/vehicles", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});

				const data = await response.json();
				if (response.ok) {
					setVehicles(data.vehicles);
				} else {
					throw new Error(data.message || "Failed to fetch vehicles");
				}
			} catch (err) {
				console.error(err);
				setErrors({ submit: err.message || "Failed to fetch vehicles" });
			}
		};

		fetchVehicles();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();

		const newErrors = validateForm();
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsSubmitting(true);
		setLoading(true);
		setErrors({});

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setErrors({ auth: "You must be logged in to offer a ride." });
				setIsSubmitting(false);
				setLoading(false);
				return;
			}

			const rideData = {
				...formData,
				vehicleId: selectedVehicle || null, // Include vehicleId if a vehicle is selected
			};

			const response = await fetch(
				"http://localhost:5000/api/rides/offer-ride",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(rideData),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Something went wrong");
			}

			setSuccess("Ride offered successfully!");

			// Reset form state after successful submission
			setFormData(initialFormState);
			setSelectedVehicle("");

			// Redirect after a short delay
			setTimeout(() => {
				router.push("/myrides");
			}, 1500);
		} catch (err) {
			console.error(err);
			setErrors({ submit: err.message || "Failed to offer ride" });
		} finally {
			setLoading(false);
			setIsSubmitting(false);
		}
	};

	// Handle vehicle selection
	const handleVehicleSelect = (e) => {
		const vehicleId = e.target.value;
		setSelectedVehicle(vehicleId);

		if (vehicleId) {
			const selected = vehicles.find((v) => v.id === vehicleId);
			if (selected) {
				setFormData((prevData) => ({
					...prevData,
					model: selected.model,
					color: selected.color,
					plate: selected.plate,
				}));
			}
		} else {
			// Clear vehicle fields if no vehicle is selected
			setFormData((prevData) => ({
				...prevData,
				model: "",
				color: "",
				plate: "",
			}));
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<main className="bg-white rounded-lg shadow-lg p-6">
					<div className="flex items-center mb-6">
						<h2 className="text-2xl font-bold text-gray-800">Offer a Ride</h2>
					</div>

					{success && (
						<div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
							{success}
						</div>
					)}

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
						<div className="p-4 rounded-lg">
							<h3 className="text-lg font-medium text-black mb-4">
								Route Details
							</h3>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<OSMAutocomplete
									label="From"
									name="startLocation"
									placeholder="Enter starting location"
									value={formData.startLocation}
									onChange={handleChange}
									error={errors.startLocation}
									options={{
										countries: "IN",
									}}
								/>

								<OSMAutocomplete
									label="To"
									name="destination"
									placeholder="Enter destination"
									value={formData.destination}
									onChange={handleChange}
									error={errors.destination}
									options={{
										countries: "IN", // Restricts results to India
									}}
								/>
							</div>

							<div className="mt-4">
								<label
									htmlFor="dateTime"
									className="block text-sm font-medium text-gray-700"
								>
									Date & Time
								</label>
								<input
									type="datetime-local"
									id="dateTime"
									name="dateTime"
									value={formData.dateTime}
									onChange={handleChange}
									className={`mt-1 block p-2 w-full rounded-md border ${
										errors.dateTime ? "border-red-500" : "border-gray-300"
									} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
								/>
								{errors.dateTime && (
									<p className="mt-1 text-sm text-red-600">{errors.dateTime}</p>
								)}
							</div>
						</div>

						{/* Ride Details Section */}
						<div className="p-4 rounded-lg">
							<h3 className="text-lg font-medium mb-4">Ride Details</h3>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div>
									<label
										htmlFor="seats"
										className="block text-sm font-medium text-gray-700"
									>
										Available Seats
									</label>
									<input
										type="number"
										id="seats"
										name="seats"
										value={formData.seats}
										onChange={handleChange}
										min="1"
										max="10"
										className={`mt-1 block p-2 w-full rounded-md border ${
											errors.seats ? "border-red-500" : "border-gray-300"
										} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
									/>
									{errors.seats && (
										<p className="mt-1 text-sm text-red-600">{errors.seats}</p>
									)}
								</div>

								<div>
									<label
										htmlFor="price"
										className="block text-sm font-medium text-gray-700"
									>
										Price per Seat
									</label>
									<input
										type="number"
										id="price"
										name="price"
										value={formData.price}
										onChange={handleChange}
										min="0"
										step="0.01"
										className={`mt-1 block p-2 w-full rounded-md border ${
											errors.price ? "border-red-500" : "border-gray-300"
										} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
										placeholder="0.00"
									/>
									{errors.price && (
										<p className="mt-1 text-sm text-red-600">{errors.price}</p>
									)}
								</div>
							</div>

							<div className="flex flex-wrap gap-4 pt-6">
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
						</div>

						{/* Vehicle Section */}
						<div className="p-4 rounded-lg">
							<h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
							<div>
								<label
									htmlFor="vehicle"
									className="block text-sm font-medium text-gray-700"
								>
									Select a Vehicle (Optional)
								</label>
								<select
									id="vehicle"
									name="vehicle"
									value={selectedVehicle}
									onChange={handleVehicleSelect}
									className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
								>
									<option value="">Select a Vehicle</option>
									{vehicles.map((vehicle) => (
										<option key={vehicle.id} value={vehicle.id}>
											{vehicle.model} ({vehicle.plate})
										</option>
									))}
								</select>
							</div>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-4">
								<div>
									<label
										htmlFor="model"
										className="block text-sm font-medium text-gray-700"
									>
										Vehicle Model
									</label>
									<input
										type="text"
										id="model"
										name="model"
										value={formData.model}
										onChange={handleChange}
										disabled={!!selectedVehicle}
										className={`mt-1 block p-2 w-full rounded-md border ${
											errors.model ? "border-red-500" : "border-gray-300"
										} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
											selectedVehicle ? "bg-gray-100" : ""
										}`}
										placeholder="e.g. Honda Civic"
									/>
									{errors.model && (
										<p className="mt-1 text-sm text-red-600">{errors.model}</p>
									)}
								</div>

								<div>
									<label
										htmlFor="color"
										className="block text-sm font-medium text-gray-700"
									>
										Vehicle Color
									</label>
									<input
										type="text"
										id="color"
										name="color"
										value={formData.color}
										onChange={handleChange}
										disabled={!!selectedVehicle}
										className={`mt-1 block p-2 w-full rounded-md border ${
											errors.color ? "border-red-500" : "border-gray-300"
										} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
											selectedVehicle ? "bg-gray-100" : ""
										}`}
										placeholder="e.g. Blue"
									/>
									{errors.color && (
										<p className="mt-1 text-sm text-red-600">{errors.color}</p>
									)}
								</div>

								<div>
									<label
										htmlFor="plate"
										className="block text-sm font-medium text-gray-700"
									>
										License Plate
									</label>
									<input
										type="text"
										id="plate"
										name="plate"
										value={formData.plate}
										onChange={handleChange}
										disabled={!!selectedVehicle}
										className={`mt-1 block p-2 w-full rounded-md border ${
											errors.plate ? "border-red-500" : "border-gray-300"
										} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
											selectedVehicle ? "bg-gray-100" : ""
										}`}
										placeholder="e.g. ABC123"
									/>
									{errors.plate && (
										<p className="mt-1 text-sm text-red-600">{errors.plate}</p>
									)}
								</div>
							</div>
						</div>

						<div className="flex justify-end pt-4">
							<button
								type="submit"
								disabled={isSubmitting}
								className={`inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
									isSubmitting ? "opacity-70 cursor-not-allowed" : ""
								}`}
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
										Submitting...
									</>
								) : (
									"Offer Ride"
								)}
							</button>
						</div>
					</form>
				</main>
			</div>
		</div>
	);
}
