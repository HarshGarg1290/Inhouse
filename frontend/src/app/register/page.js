"use client"
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FiUser,
	FiMail,
	FiLock,
	FiPhone,
	FiUpload,
	FiCreditCard,
} from "react-icons/fi";
import { MdDirectionsCar } from "react-icons/md";
import { MapPin, Home, Tag } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function Register() {
	const [step, setStep] = useState(1);

	const [formData, setFormData] = useState({
		// Step 1 Data
		fullName: "",
		email: "",
		phoneNumber: "",
		password: "",
		confirmPassword: "",

		// Step 2 Data
		streetAddress: "",
		city: "",
		state: "",
		pincode: "",
		panNumber: "",
		aadharNumber: "",

		// Step 3 Data
		panProof: null,
		aadharProof: null,
	});

	const indianStates = [
		"Andhra Pradesh",
		"Arunachal Pradesh",
		"Assam",
		"Bihar",
		"Chhattisgarh",
		"Goa",
		"Gujarat",
		"Haryana",
		"Himachal Pradesh",
		"Jharkhand",
		"Karnataka",
		"Kerala",
		"Ladakh",
		"Lakshadweep",
		"Madhya Pradesh",
		"Maharashtra",
		"Manipur",
		"Meghalaya",
		"Mizoram",
		"Nagaland",
		"Odisha",
		"Puducherry",
		"Punjab",
		"Rajasthan",
		"Sikkim",
		"Tamil Nadu",
		"Telangana",
		"Tripura",
		"Uttar Pradesh",
		"Uttarakhand",
		"West Bengal",
	];

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFileUpload = (e, documentType) => {
		setFormData((prev) => ({
			...prev,
			[documentType]: e.target.files[0],
		}));
	};

	const validateStepOne = () => {
		const { fullName, email, phoneNumber, password, confirmPassword } =
			formData;

		// Basic validation
		if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
			alert("Please fill in all fields");
			return false;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			alert("Please enter a valid email address");
			return false;
		}

		// Phone number validation (assuming 10-digit Indian mobile number)
		const phoneRegex = /^[6-9]\d{9}$/;
		if (!phoneRegex.test(phoneNumber)) {
			alert("Please enter a valid 10-digit mobile number");
			return false;
		}

		// Password strength validation
		if (password.length < 8) {
			alert("Password must be at least 8 characters long");
			return false;
		}

		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return false;
		}

		return true;
	};

	const validateStepTwo = () => {
		const { streetAddress, city, state, pincode, panNumber, aadharNumber } =
			formData;

		if (
			!streetAddress ||
			!city ||
			!state ||
			!pincode ||
			!panNumber ||
			!aadharNumber
		) {
			alert("Please fill in all address and identification fields");
			return false;
		}

		// Pincode validation (6-digit Indian pincode)
		if (!/^\d{6}$/.test(pincode)) {
			alert("Please enter a valid 6-digit pincode");
			return false;
		}

		// PAN number validation
		if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
			alert("Please enter a valid PAN number");
			return false;
		}

		// Aadhar number validation (12 digits)
		if (!/^\d{12}$/.test(aadharNumber)) {
			alert("Please enter a valid 12-digit Aadhar number");
			return false;
		}

		return true;
	};

	const validateStepThree = () => {
		const { panProof, aadharProof } = formData;

		if (!panProof || !aadharProof) {
			alert("Please upload both PAN and Aadhar proofs");
			return false;
		}

		// File size and type validation
		const maxFileSize = 5 * 1024 * 1024; // 5MB
		const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

		if (panProof.size > maxFileSize || !allowedTypes.includes(panProof.type)) {
			alert(
				"Invalid PAN proof file. Max size is 5MB, allowed types are JPG, PNG, PDF"
			);
			return false;
		}

		if (
			aadharProof.size > maxFileSize ||
			!allowedTypes.includes(aadharProof.type)
		) {
			alert(
				"Invalid Aadhar proof file. Max size is 5MB, allowed types are JPG, PNG, PDF"
			);
			return false;
		}

		return true;
	};

	const handleSubmit = async () => {
		try {
			if (!validateStepOne() || !validateStepTwo() || !validateStepThree())
				return;

			const formDataToSend = new FormData();

			// Append all form data
			Object.entries(formData).forEach(([key, value]) => {
				if (key !== "confirmPassword") {
					formDataToSend.append(key, value);
				}
			});

			const response = await fetch("http://localhost:5000/register", {
				method: "POST",
				// Remove Content-Type header to let browser set it with boundary
				body: formDataToSend,
			});

			const data = await response.json();

			if (response.ok) {
				alert("Registration successful! Awaiting verification.");
			} else {
				alert(data.message || "Registration failed. Please try again.");
			}
		} catch (error) {
			console.error("Registration error:", error);
			alert("Something went wrong. Please try again.");
		}
	};

	const handleNextStep = () => {
		if (step === 1 && validateStepOne()) {
			setStep(2);
		} else if (step === 2 && validateStepTwo()) {
			setStep(3);
		} else if (step === 3 && validateStepThree()) {
			handleSubmit();
		}
	};

	const renderStepOne = () => (
		<>
			{/* Personal Details Inputs */}
			<div className="space-y-4">
				{/* Full Name */}
				<div className="relative">
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<FiUser className="h-5 w-5 text-gray-400" />
					</div>
					<Input
						name="fullName"
						value={formData.fullName}
						onChange={handleInputChange}
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
						name="email"
						value={formData.email}
						onChange={handleInputChange}
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
						name="phoneNumber"
						value={formData.phoneNumber}
						onChange={handleInputChange}
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
						name="password"
						value={formData.password}
						onChange={handleInputChange}
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
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleInputChange}
						type="password"
						placeholder="Confirm Password"
						className="pl-10 py-6 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>
		</>
	);

	const renderStepTwo = () => (
		<div className="space-y-4">
			{/* Address and Identification Details */}
			<div className="space-y-4">
				{/* Street Address */}
				<div className="relative">
					<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<Input
						name="streetAddress"
						value={formData.streetAddress}
						onChange={handleInputChange}
						type="text"
						placeholder="Enter your street address"
						className="pl-10 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-full transition-all duration-300 ease-in-out"
					/>
				</div>

				{/* City and State Row */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* City */}
					<div className="relative">
						<Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
						<Input
							name="city"
							value={formData.city}
							onChange={handleInputChange}
							type="text"
							placeholder="Enter your city"
							className="pl-10 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-full transition-all duration-300 ease-in-out"
						/>
					</div>

					{/* State Dropdown */}
					<Select
						name="state"
						value={formData.state}
						onValueChange={(value) =>
							handleInputChange({
								target: { name: "state", value },
							})
						}
					>
						<SelectTrigger className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 ease-in-out">
							<SelectValue placeholder="Select State" />
						</SelectTrigger>
						<SelectContent className="bg-white rounded-lg shadow-lg">
							{indianStates.map((state) => (
								<SelectItem key={state} value={state}>
									{state}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Pincode */}
				<div className="relative">
					<Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					<Input
						name="pincode"
						value={formData.pincode}
						onChange={handleInputChange}
						type="text"
						placeholder="Enter your pincode"
						className="pl-10 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-full transition-all duration-300 ease-in-out"
					/>
				</div>

				{/* PAN Number */}
				<div className="relative">
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<FiCreditCard className="h-5 w-5 text-gray-400" />
					</div>
					<Input
						name="panNumber"
						value={formData.panNumber}
						onChange={handleInputChange}
						type="text"
						placeholder="PAN Number"
						className="pl-10 py-6 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				{/* Aadhar Number */}
				<div className="relative">
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<FiCreditCard className="h-5 w-5 text-gray-400" />
					</div>
					<Input
						name="aadharNumber"
						value={formData.aadharNumber}
						onChange={handleInputChange}
						type="text"
						placeholder="Aadhar Number"
						className="pl-10 py-6 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>
		</div>
	);

	const renderStepThree = () => (
		<div className="space-y-4">
			{/* Document Upload */}
			<div className="space-y-4">
				{/* PAN Proof Upload */}
				<div className="space-y-2">
					<label className="block text-sm font-medium text-gray-700">
						Upload PAN Card Proof
					</label>
					<div className="relative flex items-center border border-gray-300 rounded-lg p-3">
						<FiUpload className="h-5 w-5 text-gray-400 mr-2" />
						<span className="text-gray-500 text-sm">
							{formData.panProof
								? formData.panProof.name
								: "Choose a file (JPG, PNG, PDF)"}
						</span>
						<input
							type="file"
							accept=".jpg,.jpeg,.png,.pdf"
							onChange={(e) => handleFileUpload(e, "panProof")}
							className="absolute inset-0 opacity-0 cursor-pointer"
						/>
					</div>
				</div>

				{/* Aadhar Proof Upload */}
				<div className="space-y-2">
					<label className="block text-sm font-medium text-gray-700">
						Upload Aadhar Card Proof
					</label>
					<div className="relative flex items-center border border-gray-300 rounded-lg p-3">
						<FiUpload className="h-5 w-5 text-gray-400 mr-2" />
						<span className="text-gray-500 text-sm">
							{formData.aadharProof
								? formData.aadharProof.name
								: "Choose a file (JPG, PNG, PDF)"}
						</span>
						<input
							type="file"
							accept=".jpg,.jpeg,.png,.pdf"
							onChange={(e) => handleFileUpload(e, "aadharProof")}
							className="absolute inset-0 opacity-0 cursor-pointer"
						/>
					</div>
				</div>

				{/* Verification Note */}
				<div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-center">
					<p className="text-yellow-700 text-sm">
						Your documents will be reviewed by our verification team. This
						process may take 1-3 business days.
					</p>
				</div>
			</div>
		</div>
	);

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
							Step {step} of 3:{" "}
							{step === 1
								? "Personal Details"
								: step === 2
								? "Address & Identification"
								: "Document Verification"}
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						{step === 1 && renderStepOne()}
						{step === 2 && renderStepTwo()}
						{step === 3 && renderStepThree()}

						<div className="flex flex-col gap-6">
							{step > 1 && (
								<Button
									variant="outline"
									className="w-full"
									onClick={() => setStep((prev) => prev - 1)}
								>
									Previous
								</Button>
							)}
							<Button
								className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
								onClick={step === 3 ? handleSubmit : handleNextStep}
							>
								{step === 3 ? "Submit for Verification" : "Next"}
							</Button>
						</div>

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
