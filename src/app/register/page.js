"use client";
import Link from "next/link";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiUser, FiMail, FiLock, FiPhone, FiUpload } from "react-icons/fi";
import { MdDirectionsCar } from "react-icons/md";

export default function Register() {
	const [kycFile, setKycFile] = useState(null);
	const [idType, setIdType] = useState("Aadhar");

	const handleFileUpload = (event) => {
		setKycFile(event.target.files[0]);
	};

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<div className="flex w-full max-w-md mx-auto items-center justify-center">
				<Card className="w-full shadow-lg">
					<CardHeader className="pb-2 text-center">
						<Link href="/" className="inline-block mb-6">
							<div className="flex items-center justify-center gap-2">
								<MdDirectionsCar className="h-8 w-8 text-blue-600" />
								<span className="text-2xl font-bold text-blue-600">
									RideShare
								</span>
							</div>
						</Link>
						<CardTitle className="text-2xl font-bold">
							Create an Account
						</CardTitle>
						<p className="text-muted-foreground text-sm mt-1">
							Sign up to start your secure ride-sharing journey
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Full Name */}
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<FiUser className="h-5 w-5 text-gray-400" />
							</div>
							<Input
								type="text"
								placeholder="Full Name"
								className="pl-10 py-6 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						{/* Email */}
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<FiMail className="h-5 w-5 text-gray-400" />
							</div>
							<Input
								type="email"
								placeholder="Email Address"
								className="pl-10 py-6 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						{/* Phone Number */}
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<FiPhone className="h-5 w-5 text-gray-400" />
							</div>
							<Input
								type="tel"
								placeholder="Phone Number"
								className="pl-10 py-6 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						{/* Password */}
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<FiLock className="h-5 w-5 text-gray-400" />
							</div>
							<Input
								type="password"
								placeholder="Password"
								className="pl-10 py-6 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						{/* Confirm Password */}
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<FiLock className="h-5 w-5 text-gray-400" />
							</div>
							<Input
								type="password"
								placeholder="Confirm Password"
								className="pl-10 py-6 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						{/* KYC Document Selection */}
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								Select ID Type
							</label>
							<select
								value={idType}
								onChange={(e) => setIdType(e.target.value)}
								className="w-full border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="Aadhar">Aadhar Card</option>
								<option value="License">Driving License</option>
								<option value="Passport">Passport</option>
							</select>
						</div>

						{/* KYC File Upload */}
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								Upload {idType}
							</label>
							<div className="relative flex items-center border border-gray-300 rounded-lg p-3">
								<FiUpload className="h-5 w-5 text-gray-400 mr-2" />
								<span className="text-gray-500 text-sm">
									{kycFile ? kycFile.name : "Choose a file (JPG, PNG, PDF)"}
								</span>
								<input
									type="file"
									accept=".jpg,.jpeg,.png,.pdf"
									onChange={handleFileUpload}
									className="absolute inset-0 opacity-0 cursor-pointer"
								/>
							</div>
						</div>

						{/* Register Button */}
						<Button className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors">
							{kycFile ? "Submit for Verification" : "Register"}
						</Button>

						{/* Already have an account? */}
						<div className="text-center pt-2">
							<p className="text-gray-600 text-sm">
								Already have an account?{" "}
								<Link
									href="/login"
									className="text-blue-600 hover:text-blue-800 font-medium"
								>
									Login
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
