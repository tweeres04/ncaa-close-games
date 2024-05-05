import { Metadata } from 'next'
import { Gender } from '../models'

export async function generateMetadata({
	params,
}: {
	params: { gender: Gender }
}): Promise<Metadata> {
	const url = `https://ncaa-close-games.tweeres.ca/${params.gender}`
	return {
		alternates: {
			canonical: url,
		},
		openGraph: {
			url,
		},
	}
}

export { default } from '../CloseGamesServer'
