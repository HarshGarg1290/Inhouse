"use client";
import { useState } from "react";
import OSMAutocomplete from "./Autocomplete";

export default function RideSearch({ onSearch, initialRadius = 5 }) {
	const [searchData, setSearchData] = useState({
		from: "",
		to: "",
		datetime: "",
		radius: initialRadius,
	});

	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setSearchData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error for this field if it exists
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!searchData.from.trim()) {
			newErrors.from = "Starting point is required";
		}

		if (!searchData.to.trim()) {
			newErrors.to = "Destination is required";
		}

		if (!searchData.datetime) {
			newErrors.datetime = "Date and time are required";
		}

		if (searchData.radius < 1 || searchData.radius > 50) {
			newErrors.radius = "Radius must be between 1 and 50 km";
		}

		return newErrors;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const formErrors = validateForm();
		if (Object.keys(formErrors).length > 0) {
			setErrors(formErrors);
			return;
		}

		onSearch(searchData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<OSMAutocomplete
						label="From"
						name="from"
						placeholder="Enter starting point"
						value={searchData.from}
						onChange={handleChange}
						error={errors.from}
						options={{
							countries: "IN",
						}}
					/>
				</div>

				<div>
					<OSMAutocomplete
						label="To"
						name="to"
						placeholder="Enter destination"
						value={searchData.to}
						onChange={handleChange}
						error={errors.to}
						options={{
							countries: "IN",
						}}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						htmlFor="datetime"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Date & Time
					</label>
					<input
						type="datetime-local"
						id="datetime"
						name="datetime"
						value={searchData.datetime}
						onChange={handleChange}
						className={`w-full p-2 border ${
							errors.datetime ? "border-red-500" : "border-gray-300"
						} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
					/>
					{errors.datetime && (
						<p className="mt-1 text-sm text-red-600">{errors.datetime}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="radius"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Search Radius (km)
					</label>
					<div className="flex items-center space-x-2">
						<input
							type="range"
							id="radius"
							name="radius"
							min="1"
							max="50"
							value={searchData.radius}
							onChange={handleChange}
							className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
						/>
						<input
							type="number"
							name="radius"
							value={searchData.radius}
							onChange={handleChange}
							min="1"
							max="50"
							className="w-16 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<span className="text-gray-600">km</span>
					</div>
					{errors.radius && (
						<p className="mt-1 text-sm text-red-600">{errors.radius}</p>
					)}
				</div>
			</div>

			<div className="flex justify-end">
				<button
					type="submit"
					className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
				>
					Search Rides
				</button>
			</div>
		</form>
	);
}
