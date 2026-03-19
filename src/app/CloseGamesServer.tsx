import { cookies } from 'next/headers'
import CloseGames from './CloseGames'
import {
	menContestToGame,
	womenGameToGame,
	Contest,
	WomenGame,
	genders,
	Gender,
} from './models'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export async function generateMetadata({
	params,
}: {
	params: { gender: Gender }
}): Promise<Metadata> {
	const genderText = params.gender === 'women' ? "Women's" : "Men's"
	const url = `https://ncaa-close-games.tweeres.ca/${params.gender ?? 'men'}`
	const title = `${genderText} March Madness Games Today (2025) | Live Score Tracker`
	const description = `Track today's ${genderText.toLowerCase()} March Madness games live. My smart sorting shows close games and potential upsets at the top so you never miss the most exciting NCAA tournament action.`

	return {
		title,
		description,
		alternates: {
			canonical: url,
		},
		openGraph: {
			url,
			title,
			description,
			siteName: 'NCAA Close Games Tracker',
			type: 'website',
			locale: 'en_US',
			images: [
				{
					url: `https://ncaa-close-games.tweeres.ca/images/og-image.jpg`,
					width: 1200,
					height: 630,
					alt: `${genderText} NCAA tournament close games tracker`,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [`https://ncaa-close-games.tweeres.ca/images/og-image.jpg`],
		},
	}
}

type MenScoresResponse = {
	data: { mmlContests: Contest[] }
}

type WomenScoresResponse = {
	Message?: string
	games: { game: WomenGame }[]
}

function getNow() {
	return process.env.NODE_ENV === 'production'
		? new Date(Date.now() - 1000 * 60 * 60 * 7) // This isn't pretty, but it might always work since MM should always be during DST
		: new Date()
}

const scoresUrls = {
	men: () => {
		const now = getNow()
		const year = now.getFullYear()
		return `https://sdataprod.ncaa.com/?variables=%7B%22seasonYear%22%3A${
			year - 1
		},%22current%22%3Atrue%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1,%22sha256Hash%22%3A%222d9054b672f94e541c1de408ab4af3c6d014ba37915a58eca97b8198bcc198da%22%7D%7D`
	},
	women: () => {
		const now = getNow()
		const year = now.getFullYear()
		return `https://sdataprod.ncaa.com/?meta=GetLiveSchedulePlusMmlEventVideo_web&extensions={%22persistedQuery%22:{%22version%22:1,%22sha256Hash%22:%225f2dd33c4660d1d169b65a67b86bc578258b93cadc45c0ff871e372ea57a9825%22}}&variables={%22seasonYear%22:${year - 1},%22current%22:true}`
	},
}

export async function getScores(gender: Gender) {
	'use server'

	if (!genders.includes(gender)) {
		notFound()
	}

	const url = scoresUrls[gender]()
	const scoresResponse: MenScoresResponse | WomenScoresResponse = await fetch(
		url,
		{
			next: { revalidate: 30 },
		},
	).then((response) => {
		if (response.ok) {
			return response.json()
		} else {
			response.text().then((error) => console.error(`API ERROR`, error))
		}
	})

	return (scoresResponse as MenScoresResponse).data.mmlContests.map(
		menContestToGame,
	)
}

export default async function CloseGamesServer({
	params: { gender },
}: {
	params: { gender: Gender }
}) {
	gender = gender ?? cookies().get('default_gender')?.value ?? 'men'

	const games = await getScores(gender)

	return (
		<CloseGames gender={gender} getScores={getScores} initialGames={games} />
	)
}
