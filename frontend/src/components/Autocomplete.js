"use client";
import { useState } from "react";
import axios from "axios";

export default function OSMAutocomplete({
	label,
	name,
	value,
	onChange,
	error,
}) {
	const [suggestions, setSuggestions] = useState([]);

	const handleSearch = async (query) => {
		if (!query) {
			setSuggestions([]);
			return;
		}

		try {
			const res = await axios.get(
				`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=IN&limit=5`
			);
			setSuggestions(res.data);
		} catch (err) {
			console.error("Error fetching location suggestions:", err);
		}
	};

	const handleSelect = (place) => {
		onChange({ target: { name, value: place.display_name } });
		setSuggestions([]);
	};

	return (
		<div className="relative">
			<label className="block text-sm font-medium text-gray-700">{label}</label>
			<input
				type="text"
				name={name}
				value={value}
				onChange={(e) => {
					onChange(e);
					handleSearch(e.target.value);
				}}
				className={`mt-1 block w-full p-2 border rounded-md ${
					error ? "border-red-500" : "border-gray-300"
				}`}
				placeholder={`Enter ${label.toLowerCase()}`}
			/>
			{suggestions.length > 0 && (
				<ul className="absolute z-10 w-full bg-white border rounded shadow-md">
					{suggestions.map((place, index) => (
						<li
							key={index}
							className="p-2 hover:bg-gray-100 cursor-pointer"
							onClick={() => handleSelect(place)}
						>
							{place.display_name}
						</li>
					))}
				</ul>
			)}
			{error && <p className="text-red-600 text-sm mt-1">{error}</p>}
		</div>
	);
}
