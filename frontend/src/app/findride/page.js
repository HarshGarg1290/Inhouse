
"use client"
import { useState } from "react";
import Head from "next/head";
import RideSearch from "../../components/RideSearch.js";
import AvailableRides from "../../components/AvailableRides";
import Navbar from "../../components/Navbar";



export default function Dashboard() {
	const [searchResults, setSearchResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);

	const handleSearch = (searchData) => {
		setIsSearching(true);


		setTimeout(() => {
			const mockResults = [
				{
					id: "1",
					driver: { name: "Alex Johnson", rating: 4.8, verified: true },
					route: { from: searchData.from, to: searchData.to },
					datetime: searchData.datetime,
					price: 320,
					availableSeats: 3,
					vehicle: { model: "Honda Civic", color: "Blue", plate: "ABC123" },
					preferences: ["No smoking", "Pets allowed"],
					ecoImpact: { co2Saved: "2.3kg" },
				},
				{
					id: "2",
					driver: { name: "Maya Patel", rating: 4.9, verified: true },
					route: { from: searchData.from, to: searchData.to },
					datetime: new Date(
						new Date(searchData.datetime).getTime() + 20 * 60000
					).toISOString(), // 20 mins later
					price: 290,
					availableSeats: 2,
					vehicle: { model: "Toyota Prius", color: "Silver", plate: "XYZ789" },
					preferences: ["No smoking", "Women only"],
					ecoImpact: { co2Saved: "3.1kg" },
				},
				{
					id: "3",
					driver: { name: "Raj Mehta", rating: 4.7, verified: true },
					route: { from: searchData.from, to: searchData.to },
					datetime: new Date(
						new Date(searchData.datetime).getTime() + 35 * 60000
					).toISOString(), // 35 mins later
					price: 350,
					availableSeats: 4,
					vehicle: {
						model: "Maruti Suzuki Swift",
						color: "Red",
						plate: "DEF456",
					},
					preferences: ["No pets"],
					ecoImpact: { co2Saved: "2.7kg" },
				},
			];

			setSearchResults(mockResults);
			setIsSearching(false);
		}, 1500);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="mx-90"> 
				<Head className="mx-[100">
					<title>RideShare - Find your ride</title>
					<meta
						name="description"
						content="Smart ride sharing and pooling application"
					/>
				</Head>

				<main className="container   px-4 py-8 ">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-800 mb-2">
							Find Your Ride
						</h1>
						<p className="text-gray-600">
							Enter your route details to find available rides
						</p>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6 mb-8">
						<RideSearch onSearch={handleSearch} />
					</div>

					<div className="mt-8">
						<AvailableRides
							rides={searchResults}
							isLoading={isSearching}
							searchPerformed={searchResults.length > 0 || isSearching}
						/>
					</div>
				</main>
			</div>
		</div>
	);
}
