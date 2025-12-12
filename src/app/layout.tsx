import Footer from "@/components/features/landing/layout/footer";
import Header from "@/components/features/landing/layout/header";

import type { Metadata } from 'next';
import './globals.css';
import React from 'react';


export const metadata: Metadata = {
	title: 'Church Workflow',
	description: 'Your Church workflow processes all in one place.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
  return (
   <html lang="en overflow-x-hidden">
			<body className="">
				<Header />
				{children}
				<Footer />
			</body>
		</html>
  );
}
