/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		qualities: [75, 85, 100],
		formats: ['image/webp'],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
			},
		],
	},
};

export default nextConfig;
