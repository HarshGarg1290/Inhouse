"use client";
import { useState, useEffect, useRef } from "react";

export default function OSMAutocomplete({
	label,
	name,
	placeholder,
	value,
	onChange,
	error,
	options = {},
}) {
	const [suggestions, setSuggestions] = useState([]);
	const [inputValue, setInputValue] = useState(value || "");
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef(null);
	const suggestionsRef = useRef(null);

	useEffect(() => {
		setInputValue(value);
	}, [value]);

	useEffect(() => {
		function handleClickOutside(event) {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target) &&
				!inputRef.current.contains(event.target)
			) {
				setShowSuggestions(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleInputChange = (e) => {
		const value = e.target.value;
		setInputValue(value);

		if (!value.trim()) {
			onChange("", { lat: "", lng: "" });
			setSuggestions([]);
			return;
		}

		fetchSuggestions(value);
	};

	const fetchSuggestions = async (query) => {
		if (query.length < 3) {
			setSuggestions([]);
			return;
		}

		setIsLoading(true);
		setShowSuggestions(true);

		try {

			let queryParams = new URLSearchParams({
				q: query,
				format: "json",
				addressdetails: 1,
				limit: 5,
				dedupe: 1,
			});

			if (options.countries) {
				queryParams.append("countrycodes", options.countries);
			}

			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?${queryParams.toString()}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch location suggestions");
			}

			const data = await response.json();
			setSuggestions(data);
		} catch (error) {
			console.error("Error fetching location suggestions:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSuggestionClick = (suggestion) => {
		const coordinates = {
			lat: parseFloat(suggestion.lat),
			lng: parseFloat(suggestion.lon),
		};
	

		setInputValue(suggestion.display_name);
		onChange(suggestion.display_name, coordinates);
		setShowSuggestions(false);
	};

	return (
		<div className="relative">
			<label htmlFor={name} className="block text-sm font-medium text-gray-700">
				{label}
			</label>

			<div className="relative">
				<input
					type="text"
					id={name}
					ref={inputRef}
					value={inputValue}
					onChange={handleInputChange}
					onFocus={() => inputValue.length >= 3 && setShowSuggestions(true)}
					className={`mt-1 block p-2 w-full rounded-md border ${
						error ? "border-red-500" : "border-gray-300"
					} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
					placeholder={placeholder}
					autoComplete="off"
				/>

				{isLoading && (
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						<svg
							className="animate-spin h-5 w-5 text-gray-400"
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
					</div>
				)}
			</div>

			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}

			{showSuggestions && suggestions.length > 0 && (
				<ul
					ref={suggestionsRef}
					className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
				>
					{suggestions.map((suggestion) => (
						<li
							key={suggestion.place_id}
							className="cursor-pointer hover:bg-gray-100 py-2 px-3 text-sm"
							onClick={() => handleSuggestionClick(suggestion)}
						>
							<div className="font-medium">{suggestion.display_name}</div>
							<div className="text-xs text-gray-500">
							
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
