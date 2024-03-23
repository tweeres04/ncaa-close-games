import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'ncaa close games',
	description:
		'A quick way to see which March Madness games are good. A game is marked close if it has less than 5 minutes left and the teams are less than 10 points apart. The rest of the games are sorted by the smallest point difference first.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
		</html>
	)
}
