"use client";
import { useState, useEffect } from "react";
import { Menu, X, Bell, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();

	const navItems = [
		{ name: "Find Rides", href: "/findride" },
		{ name: "Offer Ride", href: "/offerride" },
		{ name: "My Rides", href: "/myrides" },
		{ name: "Rewards", href: "/rewards" },
	];

	return (
		<nav className="bg-white shadow">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link href="/" className="text-blue-600 font-bold text-xl">
								RideShare
							</Link>
						</div>
						<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
							{navItems.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 
                  ${
										pathname === item.href
											? "border-blue-500 text-gray-900"
											: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
									}`}
								>
									{item.name}
								</Link>
							))}
						</div>
					</div>
					<div className="hidden sm:ml-6 sm:flex sm:items-center">
						<button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							<Bell className="h-6 w-6" />
						</button>
						<div className="ml-3 relative">
							<button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
								<Link href="/profile" className="flex items-center">
								<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
									<User className="h-5 w-5 text-gray-500" />
									</div>
									</Link>
							</button>
						</div>
					</div>
					<div className="-mr-2 flex items-center sm:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
						>
							{isMenuOpen ? (
								<X className="block h-6 w-6" />
							) : (
								<Menu className="block h-6 w-6" />
							)}
						</button>
					</div>
				</div>
			</div>

			{isMenuOpen && (
				<div className="sm:hidden">
					<div className="pt-2 pb-3 space-y-1">
						{navItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200 
                ${
									pathname === item.href
										? "bg-blue-50 border-blue-500 text-blue-700"
										: "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
								}`}
							>
								{item.name}
							</Link>
						))}
					</div>
				</div>
			)}
		</nav>
	);
}
