// components/RideSearch.js
import { useState } from "react";
import { CalendarIcon, ClockIcon } from "lucide-react";
import OSMAutocomplete from "./Autocomplete";


export default function RideSearch({ onSearch }) {
	const [formData, setFormData] = useState({
		from: "",
		to: "",
		date: "",
		time: "",
		passengers: 1,
		preferences: [],
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handlePreferenceChange = (e) => {
		const { value, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			preferences: checked
				? [...prev.preferences, value]
				: prev.preferences.filter((pref) => pref !== value),
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// Combine date and time for datetime
		const datetime = `${formData.date}T${formData.time}`;

		onSearch({
			from: formData.from,
			to: formData.to,
			datetime: datetime,
			passengers: formData.passengers,
			preferences: formData.preferences,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<OSMAutocomplete
					label="From"
					name="from"
					placeholder="Enter starting location"
					value={formData.from}
					onChange={handleChange}
			
					options={{
						countries: "IN", // Restricts results to India
					}}
				/>

				<OSMAutocomplete
					label="To"
					name="to"
					placeholder="Enter destination"
					value={formData.to}
					onChange={handleChange}
					options={{
						countries: "IN", // Restricts results to India
					}}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div>
					<label
						htmlFor="date"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Date
					</label>
					<div className="relative">
						<input
							type="date"
							id="date"
							name="date"
							required
							value={formData.date}
							onChange={handleChange}
							min={new Date().toISOString().split("T")[0]}
							className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pl-10"
						/>
						<CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
					</div>
				</div>

				<div>
					<label
						htmlFor="time"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Time
					</label>
					<div className="relative">
						<input
							type="time"
							id="time"
							name="time"
							required
							value={formData.time}
							onChange={handleChange}
							className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pl-10"
						/>
						<ClockIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
					</div>
				</div>

				<div>
					<label
						htmlFor="passengers"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Passengers
					</label>
					<select
						id="passengers"
						name="passengers"
						value={formData.passengers}
						onChange={handleChange}
						className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
					>
						{[1, 2, 3, 4, 5, 6].map((num) => (
							<option key={num} value={num}>
								{num} {num === 1 ? "passenger" : "passengers"}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<span className="block text-sm font-medium text-gray-700 mb-2">
					Preferences
				</span>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
					{[
						{ id: "verified", label: "Verified riders only" },
						{ id: "sameGender", label: "Same gender only" },
						{ id: "nonSmoking", label: "Non-smoking" },
						{ id: "pets", label: "Pets allowed" },
						{ id: "eco", label: "Eco-friendly vehicles" },
						{ id: "quietRide", label: "Quiet ride" },
					].map((pref) => (
						<div key={pref.id} className="flex items-center">
							<input
								type="checkbox"
								id={pref.id}
								name="preferences"
								value={pref.id}
								checked={formData.preferences.includes(pref.id)}
								onChange={handlePreferenceChange}
								className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							/>
							<label htmlFor={pref.id} className="ml-2 text-sm text-gray-700">
								{pref.label}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="pt-4">
				<button
					type="submit"
					className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out shadow-md"
				>
					Find Rides
				</button>
			</div>
		</form>
	);
}
