"use client";

import React from 'react';
import Script from 'next/script';

type RazorpayOrder = {
	amount: number;
	currency: string;
	id: string;
	[key: string]: unknown;
}

type CreateOrderTypes = {
	order: RazorpayOrder,
	orderId: string;
}

declare global {
	interface Window {
		Razorpay: new (options: {
			key: string | undefined;
			amount: number;
			currency: string;
			name: string;
			description: string;
			order_id: string;
			handler: () => void;
			prefill: {
				name: string;
				email: string;
				contact: string;
			};
			theme: {
				color: string;
			};
		}) => { open: () => void };
	}
}

const HomePage = () => {
	const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
	const [order, setOrder] = React.useState<RazorpayOrder | null>(null);
	const [orderId, setOrderId] = React.useState<string>("");
	const buttonRef = React.useRef<HTMLButtonElement>(null);

	const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
		const button = event.currentTarget;
		const ripple = document.createElement("span");
		const rect = button.getBoundingClientRect();
		const size = Math.max(rect.width, rect.height);
		const x = event.clientX - rect.left - size / 2;
		const y = event.clientY - rect.top - size / 2;

		ripple.style.width = ripple.style.height = `${size}px`;
		ripple.style.left = `${x}px`;
		ripple.style.top = `${y}px`;
		ripple.classList.add("ripple");

		button.appendChild(ripple);

		setTimeout(() => {
			ripple.remove();
		}, 600);
	};

	const createOrder = async (event: React.MouseEvent<HTMLButtonElement>) => {
		createRipple(event);
		const amount = 100; // paise

		try {
			setIsProcessing(true);
			const res = await fetch("api/create-order", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					amount
				})
			});
			const data = await res.json() as CreateOrderTypes;

			setOrder(data?.order);
			setOrderId(data?.orderId);

			// Razorpay options
			const options = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
				amount: data?.order?.amount,
				currency: "INR",
				name: "Test",
				description: "Test",
				order_id: data?.orderId,
				handler: () => {
					console.log("Payment successful!")
				},
				prefill: {
					name: "Test",
					email: "test@example.com",
					contact: "9111111111"
				},
				theme: {
					color: "#3399cc"
				}
			};

			const rzp1 = new window.Razorpay(options);
			rzp1.open();

		} catch (error) {
			console.error("Error in payment intialising!", error)
		} finally {
			setIsProcessing(false);
		}
	}

	console.log("order: ", order);
	console.log("orderId: ", orderId);
	return (
		<>
			<style jsx>{`
				.ripple {
					position: absolute;
					border-radius: 50%;
					background: rgba(255, 255, 255, 0.6);
					transform: scale(0);
					animation: ripple-animation 0.6s ease-out;
					pointer-events: none;
				}

				@keyframes ripple-animation {
					to {
						transform: scale(4);
						opacity: 0;
					}
				}

				.shine-button::before {
					content: '';
					position: absolute;
					top: 0;
					left: -100%;
					width: 100%;
					height: 100%;
					background: linear-gradient(
						90deg,
						transparent,
						rgba(255, 255, 255, 0.3),
						transparent
					);
					transition: left 0.6s ease-in-out;
				}

				.shine-button:hover::before {
					left: 100%;
				}
			`}</style>
			<div className='h-dvh grid place-content-center bg-gradient-linear-to-br from-slate-50 to-slate-100'>
				<Script src='https://checkout.razorpay.com/v1/checkout.js' />
				<button
					ref={buttonRef}
					className='shine-button relative overflow-hidden bg-gradient-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200 ease-in-out text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg border border-zinc-700/50 py-3 px-6 rounded-lg text-base font-medium flex items-center gap-2 justify-center w-[180px]'
					onClick={createOrder}
					disabled={isProcessing}
				>
					{isProcessing ? (
						<>
							<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span>Processing...</span>
						</>
					) : (
						<>
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
							</svg>
							<span>Pay Now</span>
						</>
					)}
				</button>
			</div>
		</>
	)
}

export default HomePage