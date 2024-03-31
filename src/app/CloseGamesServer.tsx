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
	men: 'https://sdataprod.ncaa.com/?variables=%7B%22seasonYear%22%3A2023,%22current%22%3Atrue%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1,%22sha256Hash%22%3A%222d9054b672f94e541c1de408ab4af3c6d014ba37915a58eca97b8198bcc198da%22%7D%7D',
	women:
		'https://data.ncaa.com/casablanca/scoreboard/basketball-women/d1/2024/03/30/scoreboard.json',
}

export async function getScores(gender: Gender) {
	'use server'
	const scoresResponse: MenScoresResponse | WomenScoresResponse = await fetch(
		scoresUrls[gender],
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
