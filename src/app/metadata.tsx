import { Metadata, Viewport } from 'next'

export const explanation =
	'A game is marked close if it has less than 5 minutes left and the teams are less than 10 points apart.'

const title = 'ncaa close games - March Madness tracker'
const description = `A quick way to track close games and upsets. ${explanation}`
const imageUrl = '/basketball.png'

export const viewport: Viewport = {
	viewportFit: 'cover',
}

export const metadata: Metadata = {
	title,
	description,
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		startupImage: {
			url: imageUrl,
		},
		title,
	},
	icons: {
		apple: {
			url: imageUrl,
		},
	},
}
