import { Metadata } from 'next'

export const explanation =
	'A game is marked close if it has less than 5 minutes left and the teams are less than 10 points apart.'

export const metadata: Metadata = {
	title: 'ncaa close games',
	description: `A quick way to see which March Madness games are good. ${explanation}`,
}
