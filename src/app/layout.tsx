import { Inter } from 'next/font/google'
export { metadata } from './metadata'
import { GoogleAnalytics } from '@next/third-parties/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
			{process.env.NODE_ENV === 'production' ? (
				<GoogleAnalytics gaId="G-2W4G5BP582" />
			) : null}
		</html>
	)
}
