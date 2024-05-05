import { Metadata } from 'next'
import { Gender } from '../models'

export async function generateMetadata({
	params,
}: {
	params: { gender: Gender }
}): Promise<Metadata> {
	return {
		alternates: {
			canonical: `https://ncaa-close-games.tweeres.ca/${params.gender}`,
		},
	}
}

export { default } from '../CloseGamesServer'
