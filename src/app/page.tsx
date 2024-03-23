import CloseGames from './CloseGames'

type Team = {
	isHome: boolean
	score: number
	color: string
	seed: number
	nameShort: string
	record: string
}

export type Contest = {
	contestId: number
	startTimeEpoch: string
	gameState: string // P (pre) | I (in progress)
	gamestateDisplay: string
	period: number
	currentPeriod: string
	contestClock: string
	round: {
		title: string
	}
	teams: Team[]
}

type ScoresResponse = {
	data: {
		mmlContests: Contest[]
	}
}

const scoresUrl =
	'https://sdataprod.ncaa.com/?variables=%7B%22seasonYear%22%3A2023,%22current%22%3Atrue%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1,%22sha256Hash%22%3A%222d9054b672f94e541c1de408ab4af3c6d014ba37915a58eca97b8198bcc198da%22%7D%7D'

export default async function Home() {
	async function getScores() {
		'use server'
		const scoresResponse: ScoresResponse = await fetch(scoresUrl, {
			next: { revalidate: 30 },
		}).then((response) => response.json())

		return scoresResponse.data.mmlContests
	}

	const games = await getScores()

	return <CloseGames getScores={getScores} initialGames={games} />
}
