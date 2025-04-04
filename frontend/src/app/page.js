"use client";
import { use, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";
import {
	FaRoute,
	FaMoneyBillWave,
	FaMapMarkedAlt,
	FaLock,
	FaTrain,
	FaUsers,
	FaPiggyBank,
	FaAward,
	FaIdCard,
	FaPhoneAlt,
	FaStar,
} from "react-icons/fa";
import Link from "next/link";
export default function Home() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const features = [
		{
			icon: <FaRoute className="text-blue-500 w-6 h-6" />,
			title: "Route Posting & Matching",
			description:
				"Post your route and get matched with compatible riders or drivers in seconds.",
		},
		{
			icon: <FaMoneyBillWave className="text-blue-500 w-6 h-6" />,
			title: "Expense Splitting",
			description:
				"Automated fare calculation and easy splitting between passengers.",
		},
		{
			icon: <FaMapMarkedAlt className="text-blue-500 w-6 h-6" />,
			title: "Real-time Tracking",
			description:
				"Live GPS tracking and accurate ETA updates for peace of mind.",
		},
		{
			icon: <FaLock className="text-blue-500 w-6 h-6" />,
			title: "Secure Payments",
			description:
				"Multiple payment options including UPI, wallets, crypto, and contactless.",
		},
		{
			icon: <FaTrain className="text-blue-500 w-6 h-6" />,
			title: "Multi-Modal Integration",
			description:
				"Seamlessly combine ride-sharing with public transportation options.",
		},
		{
			icon: <FaUsers className="text-blue-500 w-6 h-6" />,
			title: "Preference Matching",
			description: "Choose who you ride with based on preferences and comfort.",
		},
	];

	const securityFeatures = [
		{
			icon: <FaIdCard className="text-blue-500 w-6 h-6" />,
			title: "Identity Verification",
			description: "Strict verification processes for all users.",
		},
		{
			icon: <FaPhoneAlt className="text-blue-500 w-6 h-6" />,
			title: "SOS & Emergency",
			description: "One-tap emergency assistance whenever you need it.",
		},
		{
			icon: <FaStar className="text-blue-500 w-6 h-6" />,
			title: "Rating System",
			description: "Comprehensive ratings ensure quality experiences.",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
			<Head>
				<title>RideShare | Smart Carpooling App</title>
				<meta
					name="description"
					content="Smart ride sharing and pooling application"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			{/* Navigation */}
			<nav className="bg-white shadow-md fixed w-full z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<div className="flex-shrink-0 flex items-center">
								<span className="text-blue-600 font-bold text-xl">
									RideShare
								</span>
							</div>
						</div>
						<div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
							<a
								href="#features"
								className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
							>
								Features
							</a>
							<a
								href="#security"
								className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
							>
								Security
							</a>
							<a
								href="#rewards"
								className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
							>
								Rewards
							</a>
						</div>
						<div className="flex items-center">
							<Link
								href="/login"
								className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300"
							>
								Get Started
							</Link>
							<div className="md:hidden">
								<button
									onClick={() => setIsMenuOpen(!isMenuOpen)}
									className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
								>
									<svg
										className="h-6 w-6"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d={
												isMenuOpen
													? "M6 18L18 6M6 6l12 12"
													: "M4 6h16M4 12h16M4 18h16"
											}
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Mobile menu */}
				{isMenuOpen && (
					<div className="md:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
							<a
								href="#features"
								className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
							>
								Features
							</a>
							<a
								href="#security"
								className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
							>
								Security
							</a>
							<a
								href="#rewards"
								className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
							>
								Rewards
							</a>
							<a
								href="#download"
								className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
							>
								Download
							</a>
							<button className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300">
								Get Started
							</button>
						</div>
					</div>
				)}
			</nav>

			{/* Hero Section */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="pt-24 pb-16 md:pt-32 md:pb-24"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="lg:flex lg:items-center lg:justify-between">
						<div className="lg:w-1/2">
							<h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
								<span className="block">Share Your Ride,</span>
								<span className="block text-blue-600">Save The Planet</span>
							</h1>
							<p className="mt-3 max-w-md text-lg text-gray-500 sm:text-xl md:mt-5">
								The smartest way to share rides, split costs, and reduce your
								carbon footprint. Join our community of eco-conscious travelers
								today.
							</p>
							<div className="mt-10 sm:flex">
								<div>
									<a
										href="/login"
										className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition duration-300"
									>
										Use Now
									</a>
								</div>
								<div className="mt-3 sm:mt-0 sm:ml-3">
									<a
										href="#features"
										className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-md transition duration-300"
									>
										Learn More
									</a>
								</div>
							</div>
						</div>
						<div className="mt-10 lg:mt-0 lg:w-1/2 flex justify-center">
							<div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96">
								<div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl transform rotate-3 shadow-xl"></div>
								<div className="absolute inset-0 bg-white rounded-2xl shadow-lg flex items-center justify-center">
									<div className="p-5">
										<Image
											src="/rideshare.png"
											alt="RideShare App Demo"
											width={400}
											height={300}
											className="rounded-xl"
										/>
										<div className="mt-4 bg-gray-50 p-4 rounded-lg">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
													<FaRoute className="text-blue-600" />
												</div>
												<div className="ml-3">
													<p className="text-sm font-medium text-gray-900">
														Daily Commute
													</p>
													<div className="flex items-center">
														<span className="text-xs text-gray-500">
															3 people matched • $4.50 per person
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Core Features Section */}
			<section id="features" className="py-12 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
							Smart Features for Smarter Travel
						</h2>
						<p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
							Our platform is designed to make ride-sharing effortless, secure,
							and cost-effective.
						</p>
					</div>

					<div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								whileHover={{ y: -10 }}
								className="bg-gray-50 overflow-hidden shadow rounded-lg"
							>
								<div className="px-6 py-8">
									<div className="flex items-center">
										<div className="flex-shrink-0">{feature.icon}</div>
										<h3 className="ml-3 text-lg font-medium text-gray-900">
											{feature.title}
										</h3>
									</div>
									<p className="mt-5 text-base text-gray-500">
										{feature.description}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Security Section */}
			<section id="security" className="py-12 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="lg:flex lg:items-center lg:justify-between">
						<div className="lg:w-1/2">
							<h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
								Your Safety is Our Priority
							</h2>
							<p className="mt-4 max-w-2xl text-xl text-gray-500">
								We've implemented robust security measures to ensure every ride
								is safe and reliable.
							</p>

							<div className="mt-8 space-y-6">
								{securityFeatures.map((feature, index) => (
									<div key={index} className="flex">
										<div className="flex-shrink-0">{feature.icon}</div>
										<div className="ml-4">
											<h4 className="text-lg font-medium text-gray-900">
												{feature.title}
											</h4>
											<p className="mt-1 text-base text-gray-500">
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="mt-10 lg:mt-0 lg:w-1/2 flex justify-center">
							<div className="relative w-full max-w-lg">
								<div className="absolute -left-4 -top-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
								<div className="absolute -right-4 -bottom-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
								<div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
								<div className="relative">
									<Image
										src="/safety.png"
										alt="Security Features"
										width={500}
										height={360}
										className="rounded-lg shadow-2xl"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Rewards Section */}
			<section id="rewards" className="py-12 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
							Earn While You Share
						</h2>
						<p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
							Our gamification system rewards you for sustainable travel
							choices.
						</p>
					</div>

					<div className="mt-16">
						<div className="lg:flex lg:items-center lg:justify-between">
							<div className="lg:w-1/2 flex justify-center">
								<div className="relative">
									<div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl transform -rotate-3 shadow-xl"></div>
									<div className="relative bg-white rounded-2xl shadow-lg p-6">
										<div className="flex items-center justify-between mb-6">
											<div className="flex items-center">
												<div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
													<FaAward className="h-6 w-6 text-blue-600" />
												</div>
												<div className="ml-4">
													<h3 className="text-lg font-medium text-gray-900">
														Rewards Dashboard
													</h3>
													<p className="text-sm text-gray-500">
														Your eco-impact and savings
													</p>
												</div>
											</div>
											<span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
												Gold Level
											</span>
										</div>

										<div className="space-y-4">
											<div className="bg-gray-50 p-4 rounded-lg">
												<div className="flex justify-between items-center">
													<span className="text-gray-700">Carbon Saved</span>
													<span className="font-bold text-blue-600">
														128 kg
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
													<div
														className="bg-blue-600 h-2.5 rounded-full"
														style={{ width: "75%" }}
													></div>
												</div>
											</div>

											<div className="bg-gray-50 p-4 rounded-lg">
												<div className="flex justify-between items-center">
													<span className="text-gray-700">Rides Shared</span>
													<span className="font-bold text-blue-600">42</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
													<div
														className="bg-blue-600 h-2.5 rounded-full"
														style={{ width: "60%" }}
													></div>
												</div>
											</div>

											<div className="bg-gray-50 p-4 rounded-lg">
												<div className="flex justify-between items-center">
													<span className="text-gray-700">Points Earned</span>
													<span className="font-bold text-purple-600">
														3,450
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
													<div
														className="bg-purple-600 h-2.5 rounded-full"
														style={{ width: "85%" }}
													></div>
												</div>
											</div>
										</div>

										<div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
											<div className="flex items-center">
												<FaPiggyBank className="h-5 w-5 text-blue-600" />
												<span className="ml-2 text-sm text-gray-700">
													You've saved approximately{" "}
													<span className="font-bold">$347</span> through ride
													sharing!
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-10 lg:mt-0 lg:w-1/2 lg:pl-8">
								<h3 className="text-2xl font-bold text-gray-900">
									How Our Rewards Work
								</h3>
								<div className="mt-6 space-y-6">
									<div className="flex">
										<div className="flex-shrink-0">
											<div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
												1
											</div>
										</div>
										<div className="ml-4">
											<h4 className="text-lg font-medium text-gray-900">
												Share Rides Regularly
											</h4>
											<p className="mt-2 text-base text-gray-500">
												Each ride you share earns points based on distance and
												occupancy.
											</p>
										</div>
									</div>

									<div className="flex">
										<div className="flex-shrink-0">
											<div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
												2
											</div>
										</div>
										<div className="ml-4">
											<h4 className="text-lg font-medium text-gray-900">
												Level Up Your Status
											</h4>
											<p className="mt-2 text-base text-gray-500">
												Climb from Bronze to Platinum as you accumulate points
												and rides.
											</p>
										</div>
									</div>

									<div className="flex">
										<div className="flex-shrink-0">
											<div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
												3
											</div>
										</div>
										<div className="ml-4">
											<h4 className="text-lg font-medium text-gray-900">
												Redeem For Rewards
											</h4>
											<p className="mt-2 text-base text-gray-500">
												Use points for ride discounts, partner offers, or cash
												out to plant trees.
											</p>
										</div>
									</div>
								</div>

								<div className="mt-8">
									<a
										href="/login"
										className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
									>
										Start Earning Now
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
