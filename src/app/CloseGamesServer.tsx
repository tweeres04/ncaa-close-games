import { cookies } from 'next/headers'
import { orderBy } from 'lodash'
import CloseGames from './CloseGames'
import { menContestToGame, Contest, genders, Gender, Game } from './models'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export async function generateMetadata({
	params,
}: {
	params: { gender: Gender }
}): Promise<Metadata> {
	const genderText = params.gender === 'women' ? "Women's" : "Men's"
	const url = `https://ncaa-close-games.tweeres.ca/${params.gender ?? 'men'}`
	const title = `${genderText} March Madness Games Today (${new Date().getFullYear()}) | Live Score Tracker`
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
					url: `https://ncaa-close-games.tweeres.ca/og-image.jpg`,
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
			images: [`https://ncaa-close-games.tweeres.ca/og-image.jpg`],
		},
	}
}

type MenScoresResponse = {
	data: { mmlContests: Contest[] }
}

type WomenScoresResponse = {
	data: { contests: Contest[] }
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
		const year = now.getFullYear() - 1
		const month = now.getMonth()
		const dateString = now.toLocaleDateString().replace(/-/g, '/')
		const url = `https://sdataprod.ncaa.com/?meta=GetLiveSchedulePlusMmlEventVideo_web&extensions={"persistedQuery":{"version":1,"sha256Hash":"6b26e5cda954c1302873c52835bfd223e169e2068b12511e92b3ef29fac779c2"}}&variables={"sportCode":"WBB","division":1,"seasonYear":${year},"month":${month},"contestDate":"${dateString}","week":null}`
		return url
	},
}

async function getScores(gender: Gender) {
	if (!genders.includes(gender)) {
		notFound()
	}

	const url = scoresUrls[gender]()
	const scoresResponse = await fetch(url, {
		next: { revalidate: 30 },
	}).then((response) => {
		if (response.ok) {
			return response.json()
		} else {
			response.text().then((error) => {
				console.error(`API ERROR`, error)
			})
		}
	})

	const contests =
		gender === 'men'
			? (scoresResponse as MenScoresResponse).data.mmlContests
			: gender === 'women'
				? (scoresResponse as WomenScoresResponse).data.contests
				: []
	return contests.map(menContestToGame)
}

function isUpset(game: Game) {
	const team1 = game.teams[0]
	const team2 = game.teams[1]

	return (
		(team1.seed > team2.seed && team1.score > team2.score) ||
		(team2.seed > team1.seed && team2.score > team1.score)
	)
}

function isClose(game: Game) {
	const team1 = game.teams[0]
	const team2 = game.teams[1]
	const scoreDifference = Math.abs(team1.score - team2.score)

	const period = game.period
	const timeChunks = game.contestClock.split(':')
	const minutes = Number(timeChunks[0])
	const seconds = Number(timeChunks[1])
	const secondsRemainingInPeriod = minutes * 60 + seconds

	return (
		((((game.gender === 'men' && period === 2) ||
			(game.gender === 'women' && period === 4)) &&
			secondsRemainingInPeriod <= 300) ||
			game.gameState === 'final') &&
		scoreDifference <= 10
	)
}

function sortGames(games: Game[]) {
	const annotated = games.map((g) => ({
		...g,
		close: isClose(g),
		upset: isUpset(g),
	}))

	const inProgressGames = orderBy(
		annotated,
		[
			(g) => g.close,
			(g) => g.upset,
			(g) => g.period,
			(g) => Math.abs(g.teams[0].score - g.teams[1].score),
		],
		['desc', 'desc', 'desc'],
	).filter((g) => g.gameState === 'live')

	const finishedGames = orderBy(
		annotated,
		[
			(g) => g.upset,
			(g) => g.close,
			(g) => Math.abs(g.teams[0].score - g.teams[1].score),
		],
		['desc', 'desc'],
	).filter((g) => g.gameState === 'final')

	return { inProgressGames, finishedGames }
}

export default async function CloseGamesServer({
	params: { gender },
}: {
	params: { gender: Gender }
}) {
	gender = gender ?? cookies().get('default_gender')?.value ?? 'men'

	const games = await getScores(gender)
	const { inProgressGames, finishedGames } = sortGames(games)

	return (
		<CloseGames
			key={gender}
			gender={gender}
			inProgressGames={inProgressGames}
			finishedGames={finishedGames}
		/>
	)
}
