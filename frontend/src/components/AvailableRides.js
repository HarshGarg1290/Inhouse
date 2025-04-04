
import {
	StarIcon,
	ShieldCheckIcon,
	MapPinIcon,
	UserIcon,
	CarIcon,
	LeafIcon,
} from "lucide-react";

export default function AvailableRides({ rides, isLoading, searchPerformed }) {
	if (isLoading) {
		return (
			<div className="text-center py-12">
				<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
				<p className="mt-4 text-gray-600">Finding available rides...</p>
			</div>
		);
	}

	if (!searchPerformed) {
		return null;
	}

	if (rides.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-md p-8 text-center">
				<div className="flex justify-center mb-4">
					<MapPinIcon className="h-12 w-12 text-gray-400" />
				</div>
				<h3 className="text-xl font-medium text-gray-900 mb-2">
					No rides found
				</h3>
				<p className="text-gray-600">
					Try adjusting your search criteria or try again later.
				</p>
			</div>
		);
	}

	const formatDateTime = (isoString) => {
		const date = new Date(isoString);
		return {
			date: date.toLocaleDateString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
			}),
			time: date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};
	};

	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-800 mb-6">
				Available Rides ({rides.length})
			</h2>
			<div className="space-y-6">
				{rides.map((ride) => {
					const { date, time } = formatDateTime(ride.datetime);

					return (
						<div
							key={ride.id}
							className="bg-white rounded-lg shadow-md overflow-hidden"
						>
							<div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
								<div className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div>
											<p className="font-medium text-gray-900">{date}</p>
											<p className="text-lg font-bold">{time}</p>
										</div>
										<div className="text-right">
											<p className="text-lg font-bold text-blue-600">
												₹{ride.price}
											</p>
											<p className="text-sm text-gray-500">per person</p>
										</div>
									</div>

									<div className="space-y-2">
										<div className="flex items-start">
											<div className="mt-1 mr-3">
												<div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
													<span className="text-white text-xs font-bold">
														A
													</span>
												</div>
											</div>
											<div>
												<p className="font-medium">{ride.route.from}</p>
											</div>
										</div>

										<div className="ml-4 border-l-2 border-dashed border-gray-300 h-8"></div>

										<div className="flex items-start">
											<div className="mt-1 mr-3">
												<div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
													<span className="text-white text-xs font-bold">
														B
													</span>
												</div>
											</div>
											<div>
												<p className="font-medium">{ride.route.to}</p>
											</div>
										</div>
									</div>
								</div>

								<div className="p-6">
									<div className="flex items-center mb-4">
										<div className="h-12 w-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
											<UserIcon className="h-6 w-6 text-gray-600" />
										</div>
										<div>
											<div className="flex items-center">
												<p className="font-medium text-gray-900">
													{ride.driver.name}
												</p>
												{ride.driver.verified && (
													<ShieldCheckIcon
														className="h-5 w-5 text-blue-600 ml-1"
														title="Verified driver"
													/>
												)}
											</div>
											<div className="flex items-center">
												<StarIcon className="h-4 w-4 text-yellow-500" />
												<span className="ml-1 text-gray-700">
													{ride.driver.rating}
												</span>
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<div className="flex items-center">
											<CarIcon className="h-5 w-5 text-gray-500 mr-2" />
											<p className="text-gray-700">
												{ride.vehicle.model} • {ride.vehicle.color}
											</p>
										</div>
										<p className="text-gray-600 text-sm">
											License: {ride.vehicle.plate}
										</p>
										<div className="flex items-center mt-2">
											<UserIcon className="h-5 w-5 text-gray-500 mr-2" />
											<p className="text-gray-700">
												{ride.availableSeats} seats available
											</p>
										</div>
									</div>
								</div>

								<div className="p-6">
									<div className="mb-4">
										<p className="font-medium text-gray-800 mb-2">
											Ride Preferences
										</p>
										<div className="flex flex-wrap gap-2">
											{ride.preferences.map((pref, idx) => (
												<span
													key={idx}
													className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
												>
													{pref}
												</span>
											))}
										</div>
									</div>

									<div className="flex items-center mb-4">
										<LeafIcon className="h-5 w-5 text-green-500 mr-2" />
										<p className="text-gray-700 text-sm">
											Save approx. {ride.ecoImpact.co2Saved} CO₂
										</p>
									</div>

									<button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-sm">
										Book Now
									</button>

									<button className="w-full mt-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
										View Details
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
