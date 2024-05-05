import { Metadata } from 'next'

export { default } from './CloseGamesServer'

const url = 'https://ncaa-close-games.tweeres.ca/men'

export const metadata: Metadata = {
	alternates: { canonical: url },
	openGraph: {
		url,
	},
}
