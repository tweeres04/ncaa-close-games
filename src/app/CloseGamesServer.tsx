import { cookies } from 'next/headers'
import CloseGames from './CloseGames'
import {
	menContestToGame,
	womenGameToGame,
	Contest,
	WomenGame,
	Gender,
} from './models'

type MenScoresResponse = {
	data: { mmlContests: Contest[] }
}

type WomenScoresResponse = {
	games: { game: WomenGame }[]
}

const scoresUrls = {
	men: () =>
		'https://sdataprod.ncaa.com/?variables=%7B%22seasonYear%22%3A2023,%22current%22%3Atrue%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1,%22sha256Hash%22%3A%222d9054b672f94e541c1de408ab4af3c6d014ba37915a58eca97b8198bcc198da%22%7D%7D',
	women: () => {
		const now =
			process.env.NODE_ENV === 'production'
				? new Date(Date.now() - 1000 * 60 * 60 * 7) // This isn't pretty, but it might always work since MM should always be during DST
				: new Date()
		const year = now.getFullYear()
		const month = (now.getMonth() + 1).toString().padStart(2, '0')
		const day = now.getDate().toString().padStart(2, '0')
		return `https://data.ncaa.com/casablanca/scoreboard/basketball-women/d1/${year}/${month}/${day}/scoreboard.json`
	},
}

export async function getScores(gender: Gender) {
	'use server'

	const url = scoresUrls[gender]()
	const scoresResponse: MenScoresResponse | WomenScoresResponse = await fetch(
		url,
		{
			next: { revalidate: 30 },
		}
	).then((response) => response.json())

	return gender === 'men'
		? (scoresResponse as MenScoresResponse).data.mmlContests.map(
				menContestToGame
		  )
		: gender === 'women'
		? (scoresResponse as WomenScoresResponse).games
				.map(({ game }) => game)
				.map(womenGameToGame)
		: []
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
