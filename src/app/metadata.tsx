import { Metadata } from 'next'

export const explanation =
	'A game is marked close if it has less than 5 minutes left and the teams are less than 10 points apart.'

const title = 'ncaa close games'
const imageUrl = '/basketball.png'

export const metadata: Metadata = {
	title,
	description: `A quick way to see which March Madness games are good. ${explanation}`,
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
