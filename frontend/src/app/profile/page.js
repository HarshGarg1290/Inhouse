"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
	const [user, setUser] = useState(null);
	const [vehicles, setVehicles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedVehicle, setSelectedVehicle] = useState(null);
	const [formData, setFormData] = useState({ model: "", color: "", plate: "" });
	const [activeTab, setActiveTab] = useState("profile");

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem("token");
				if (!token) {
					setError({ auth: "You must be logged in " });
					return;
				}
				const userRes = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (!userRes.ok) throw new Error("Failed to fetch user details");
				const userData = await userRes.json();
				setUser(userData);

				const vehiclesRes = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/vehicles`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!vehiclesRes.ok) throw new Error("Failed to fetch vehicles");
				const vehiclesData = await vehiclesRes.json();
				setVehicles(vehiclesData);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// Open modal and populate form with vehicle data
	const handleEditVehicle = (vehicle) => {
		setSelectedVehicle(vehicle);
		setFormData({
			model: vehicle.model,
			color: vehicle.color,
			plate: vehicle.plate,
		});
		setIsModalOpen(true);
	};

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Submit updated vehicle details
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/vehicles/${selectedVehicle.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify(formData),
				}
			);

			if (!res.ok) throw new Error("Failed to update vehicle");
			const updatedVehicle = await res.json();

			// Update vehicles state
			setVehicles((prev) =>
				prev.map((v) =>
					v.id === selectedVehicle.id ? updatedVehicle.vehicle : v
				)
			);
			setIsModalOpen(false);
			setFormData({ model: "", color: "", plate: "" });
		} catch (err) {
			setError(err.message);
		}
	};

	// Get vehicle icon based on model name
	const getVehicleIcon = (model) => {
		const modelLower = model.toLowerCase();
		if (modelLower.includes("car") || modelLower.includes("sedan")) {
			return "🚗";
		} else if (modelLower.includes("suv") || modelLower.includes("jeep")) {
			return "🚙";
		} else if (modelLower.includes("truck") || modelLower.includes("pickup")) {
			return "🛻";
		} else if (
			modelLower.includes("bike") ||
			modelLower.includes("motorcycle")
		) {
			return "🏍️";
		} else {
			return "🚘";
		}
	};

	// Format verification status for display
	const getVerificationBadge = (status) => {
		if (status === "verified") {
			return (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
					Verified ✓
				</span>
			);
		} else if (status === "pending") {
			return (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
					Pending
				</span>
			);
		} else {
			return (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
					Not Verified
				</span>
			);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center h-screen">
				<div className="bg-red-50 text-red-700 p-4 rounded-lg shadow-md max-w-md">
					<h3 className="text-lg font-medium mb-2">Error</h3>
					<p>{error}</p>
					<button
						onClick={() => (window.location.href = "/login")}
						className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
					>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen pb-12">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-6 shadow-md">
				<div className="container mx-auto">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="flex items-center mb-4 md:mb-0">
							<div className="bg-white rounded-full p-1 mr-4">
								<div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl">
									{user?.fullName?.charAt(0)?.toUpperCase() || "U"}
								</div>
							</div>
							<div>
								<h1 className="text-2xl md:text-3xl font-bold">
									{user?.fullName}
								</h1>
								<p className="text-blue-100">{user?.email}</p>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<div className="text-yellow-300 font-semibold text-lg">
								{user?.rating?.toFixed(1)}
								<span className="ml-1">★</span>
							</div>
							{getVerificationBadge(user?.verificationStatus)}
						</div>
					</div>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white shadow">
				<div className="container mx-auto">
					<div className="flex overflow-x-auto">
						<button
							onClick={() => setActiveTab("profile")}
							className={`px-6 py-4 font-medium text-sm focus:outline-none ${
								activeTab === "profile"
									? "border-b-2 border-blue-500 text-blue-600"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							Profile Details
						</button>
						<button
							onClick={() => setActiveTab("vehicles")}
							className={`px-6 py-4 font-medium text-sm focus:outline-none ${
								activeTab === "vehicles"
									? "border-b-2 border-blue-500 text-blue-600"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							Vehicles
						</button>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				{/* Profile Details Tab */}
				{activeTab === "profile" && (
					<div className="bg-white rounded-lg shadow-md overflow-hidden">
						<div className="p-6 border-b border-gray-200">
							<h2 className="text-xl font-semibold text-gray-800">
								Personal Information
							</h2>
						</div>
						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-4">
									<div>
										<p className="text-sm font-medium text-gray-500">
											Full Name
										</p>
										<p className="mt-1 text-gray-900">{user?.fullName}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500">
											Email Address
										</p>
										<p className="mt-1 text-gray-900">{user?.email}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500">
											Phone Number
										</p>
										<p className="mt-1 text-gray-900">{user?.phoneNumber}</p>
									</div>
								</div>
								<div className="space-y-4">
									<div>
										<p className="text-sm font-medium text-gray-500">Address</p>
										<p className="mt-1 text-gray-900">
											{user?.streetAddress}, {user?.city}, {user?.state},{" "}
											{user?.pincode}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500">
											Identification
										</p>
										<div className="mt-1 text-gray-900">
											<p>PAN: {user?.panNumber}</p>
											<p>Aadhar: {user?.aadharNumber}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gray-50 px-6 py-4">
							<button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
								Edit Profile
							</button>
						</div>
					</div>
				)}

				{/* Vehicles Tab */}
				{activeTab === "vehicles" && (
					<div className="bg-white rounded-lg shadow-md overflow-hidden">
						<div className="p-6 border-b border-gray-200 flex justify-between items-center">
							<h2 className="text-xl font-semibold text-gray-800">
								My Vehicles
							</h2>
							<button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
								Add New Vehicle
							</button>
						</div>
						<div className="p-6">
							{vehicles.length === 0 ? (
								<div className="text-center py-12 text-gray-500">
									<p className="text-3xl mb-4">🚗</p>
									<p className="text-lg font-medium">No vehicles found</p>
									<p className="mt-2">Add your first vehicle to get started</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{vehicles.map((vehicle) => (
										<div
											key={vehicle.id}
											className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
										>
											<div className="flex justify-between items-start mb-4">
												<div className="text-4xl">
													{getVehicleIcon(vehicle.model)}
												</div>
												<button
													onClick={() => handleEditVehicle(vehicle)}
													className="text-blue-500 hover:text-blue-700 transition-colors"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-5 w-5"
														viewBox="0 0 20 20"
														fill="currentColor"
													>
														<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
													</svg>
												</button>
											</div>
											<h3 className="text-lg font-medium text-gray-900">
												{vehicle.model}
											</h3>
											<div className="mt-2 space-y-2">
												<div className="flex items-center text-sm text-gray-600">
													<span className="w-16">Color:</span>
													<div className="flex items-center">
														<div
															className="h-4 w-4 rounded-full mr-2 border border-gray-300"
															style={{
																backgroundColor: vehicle.color.toLowerCase(),
															}}
														></div>
														{vehicle.color}
													</div>
												</div>
												<div className="flex items-center text-sm text-gray-600">
													<span className="w-16">Plate:</span>
													<span className="font-medium">{vehicle.plate}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Edit Vehicle Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
					<div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-xl font-bold text-gray-900">Edit Vehicle</h3>
							<button
								onClick={() => setIsModalOpen(false)}
								className="text-gray-400 hover:text-gray-500"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<form onSubmit={handleSubmit}>
							<div className="mb-4">
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="model"
								>
									Model
								</label>
								<input
									type="text"
									id="model"
									name="model"
									value={formData.model}
									onChange={handleInputChange}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									required
								/>
							</div>
							<div className="mb-4">
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="color"
								>
									Color
								</label>
								<input
									type="text"
									id="color"
									name="color"
									value={formData.color}
									onChange={handleInputChange}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									required
								/>
							</div>
							<div className="mb-6">
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="plate"
								>
									Plate Number
								</label>
								<input
									type="text"
									id="plate"
									name="plate"
									value={formData.plate}
									onChange={handleInputChange}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									required
								/>
							</div>
							<div className="flex justify-end gap-3">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
