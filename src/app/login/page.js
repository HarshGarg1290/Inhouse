import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiMail, FiLock } from "react-icons/fi";
import { MdDirectionsCar } from "react-icons/md"; 
import { FcGoogle } from "react-icons/fc";

export default function Login() {
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
						<CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
						<p className="text-muted-foreground text-sm mt-1">
							Sign in to continue to your account
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<FiMail className="h-5 w-5 text-gray-400" />
								</div>
								<Input
									type="email"
									placeholder="Email address"
									className="pl-10 py-6 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>

						<div className="space-y-2">
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
							<div className="flex justify-end">
								<Link
									href="/forgot-password"
									className="text-sm text-blue-600 hover:text-blue-800"
								>
									Forgot password?
								</Link>
							</div>
						</div>

						<Button className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors">
							Sign In
						</Button>

						<div className="text-center pt-2">
							<p className="text-gray-600 text-sm">
								Don't have an account?{" "}
								<Link
									href="/register"
									className="text-blue-600 hover:text-blue-800 font-medium"
								>
									Create account
								</Link>
							</p>
						</div>

						<div className="relative flex items-center justify-center mt-4">
							<div className="border-t border-gray-300 w-full"></div>
							<div className=" w-full text-center px-3 text-sm text-gray-500">
								or continue with</div>
							<div className="border-t border-gray-300 w-full"></div>
						</div>

						<div className="flex items-center justify-center gap-3">
							<Button variant="outline" className="py-5">
								<FcGoogle/>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
