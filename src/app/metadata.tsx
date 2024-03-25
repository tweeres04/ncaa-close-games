import { Metadata } from 'next'

export const explanation =
	'A game is marked close if it has less than 5 minutes left and the teams are less than 10 points apart.'

const title = 'ncaa close games - March Madness tracker'
const imageUrl = '/basketball.png'

export const metadata: Metadata = {
	title,
	description: `A quick way to track close games and upsets. ${explanation}`,
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
