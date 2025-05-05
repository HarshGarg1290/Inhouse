"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import RideSearch from "../../components/RideSearch.js";
import AvailableRides from "../../components/AvailableRides";
import Navbar from "../../components/Navbar";

export default function Dashboard() {
	const [searchResults, setSearchResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchRadius, setSearchRadius] = useState(5); // Default 5km radius
	const [searchPerformed, setSearchPerformed] = useState(false);
	const [error, setError] = useState("");

	const calculateDistance = (lat1, lon1, lat2, lon2) => {
		const R = 6371; // Radius of the earth in km
		const dLat = deg2rad(lat2 - lat1);
		const dLon = deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) *
				Math.cos(deg2rad(lat2)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c; // Distance in km
		return distance;
	};

	const deg2rad = (deg) => {
		return deg * (Math.PI / 180);
	};

	const handleSearch = async (searchData) => {
		setIsSearching(true);
		setError("");
		setSearchPerformed(true);

		try {
			// Extract location data from searchData
			const { from, to, datetime, radius } = searchData;

			if (radius) {
				setSearchRadius(radius);
			}

			const fromGeocode = await getGeocode(from);
			const toGeocode = await getGeocode(to);

			if (!fromGeocode || !toGeocode) {
				throw new Error("Could not geocode one or both locations");
			}

			// Fetch all rides from the API
			const token = localStorage.getItem("token");
			const response = await fetch(
				"http://localhost:5000/api/rides/available",
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to fetch rides");
			}

			const allRides = await response.json();

			// Filter rides by proximity and date
			const searchDate = new Date(datetime);
			const filteredRides = allRides.rides.filter(async (ride) => {
				// Get geocodes for the ride locations
				const rideFromGeocode = await getGeocode(ride.startLocation);
				const rideToGeocode = await getGeocode(ride.destination);

				if (!rideFromGeocode || !rideToGeocode) {
					return false;
				}

				// Calculate distance between search locations and ride locations
				const fromDistance = calculateDistance(
					fromGeocode.lat,
					fromGeocode.lon,
					rideFromGeocode.lat,
					rideFromGeocode.lon
				);

				const toDistance = calculateDistance(
					toGeocode.lat,
					toGeocode.lon,
					rideToGeocode.lat,
					rideToGeocode.lon
				);

				// Check if ride date is on the same day as search date
				const rideDate = new Date(ride.dateTime);
				const isSameDay =
					rideDate.getFullYear() === searchDate.getFullYear() &&
					rideDate.getMonth() === searchDate.getMonth() &&
					rideDate.getDate() === searchDate.getDate();

				// Return true if both from and to locations are within the radius and the date matches
				return (
					fromDistance <= searchRadius &&
					toDistance <= searchRadius &&
					isSameDay
				);
			});

			// Format the rides for display
			const formattedRides = await Promise.all(
				filteredRides.map(async (ride) => {
					// Get the driver details
					const driverResponse = await fetch(
						`http://localhost:5000/api/users/${ride.driverId}`,
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
								Authorization: token ? `Bearer ${token}` : "",
							},
						}
					);

					let driver = { name: "Unknown Driver", rating: 0, verified: false };
					if (driverResponse.ok) {
						const driverData = await driverResponse.json();
						driver = {
							name: `${driverData.user.firstName} ${driverData.user.lastName}`,
							rating: driverData.user.rating || 0,
							verified: driverData.user.verified || false,
						};
					}

					// Calculate approximate CO2 savings
					// Assume 120g/km for average car emissions
					const fromGeocode = await getGeocode(ride.startLocation);
					const toGeocode = await getGeocode(ride.destination);
					let co2Saved = "Unknown";

					if (fromGeocode && toGeocode) {
						const distance = calculateDistance(
							fromGeocode.lat,
							fromGeocode.lon,
							toGeocode.lat,
							toGeocode.lon
						);
						co2Saved = `${((distance * 120) / 1000).toFixed(1)}kg`;
					}

					return {
						id: ride.id,
						driver: driver,
						route: {
							from: ride.startLocation,
							to: ride.destination,
							// Include the distance from the search points for UI display
							fromDistance: (
								await calculateProximity(from, ride.startLocation)
							).toFixed(1),
							toDistance: (
								await calculateProximity(to, ride.destination)
							).toFixed(1),
						},
						datetime: ride.dateTime,
						price: ride.price,
						availableSeats: ride.seats,
						vehicle: {
							model: ride.model,
							color: ride.color,
							plate: ride.plate,
						},
						preferences: formatPreferences(ride.preferences),
						ecoImpact: { co2Saved: co2Saved },
					};
				})
			);

			setSearchResults(formattedRides);
		} catch (error) {
			console.error("Search error:", error);
			setError("Failed to search for rides: " + error.message);
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	// Helper function to calculate proximity between two locations
	const calculateProximity = async (location1, location2) => {
		try {
			const geo1 = await getGeocode(location1);
			const geo2 = await getGeocode(location2);

			if (!geo1 || !geo2) {
				return Infinity;
			}

			return calculateDistance(geo1.lat, geo1.lon, geo2.lat, geo2.lon);
		} catch (error) {
			console.error("Error calculating proximity:", error);
			return Infinity;
		}
	};

	// Helper function to get geocode for a location
	const getGeocode = async (location) => {
		try {
			// Using Nominatim OpenStreetMap service for geocoding
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					location
				)}&limit=2`
			);

			if (!response.ok) {
				throw new Error("Geocoding failed");
			}

			const data = await response.json();
			if (data.length === 0) {
				return null;
			}

			return {
				lat: parseFloat(data[0].lat),
				lon: parseFloat(data[0].lon),
			};
		} catch (error) {
			console.error("Geocoding error:", error);
			return null;
		}
	};

	// Helper function to format ride preferences
	const formatPreferences = (preferences) => {
		const formattedPrefs = [];

		if (preferences.verifiedRiders) formattedPrefs.push("Verified riders only");
		if (preferences.sameGender) formattedPrefs.push("Same gender only");
		if (preferences.nonSmoking) formattedPrefs.push("No smoking");
		if (preferences.ecoFriendly) formattedPrefs.push("Eco-friendly");
		if (preferences.allowPets) formattedPrefs.push("Pets allowed");
		if (preferences.quietRide) formattedPrefs.push("Quiet ride");

		return formattedPrefs;
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<Head>
					<title>RideShare - Find your ride</title>
					<meta
						name="description"
						content="Smart ride sharing and pooling application"
					/>
				</Head>

				<main className="py-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-800 mb-2">
							Find Your Ride
						</h1>
						<p className="text-gray-600">
							Enter your route details to find available rides
						</p>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6 mb-8">
						<RideSearch onSearch={handleSearch} initialRadius={searchRadius} />
					</div>

					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
							<p className="text-red-600">{error}</p>
						</div>
					)}

					<div className="mt-8">
						<AvailableRides
							rides={searchResults}
							isLoading={isSearching}
							searchPerformed={searchPerformed}
							searchRadius={searchRadius}
						/>
					</div>
				</main>
			</div>
		</div>
	);
}
