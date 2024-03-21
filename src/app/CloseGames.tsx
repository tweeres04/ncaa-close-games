'use client'

import { useEffect, useState } from 'react'
import { sortBy } from 'lodash'
import { Contest } from './page'

function useGames(
	initialGames: Contest[],
	getScores: () => Promise<Contest[]>
) {
	const [games, setGames] = useState<Contest[]>(initialGames)
	const [fetching, setFetching] = useState(false)

	useEffect(() => {
		const intervalHandle = setInterval(async () => {
			setFetching(true)
			const games = await getScores()
			setGames(games)
			setFetching(false)
		}, 30000)

		function cleanup() {
			clearInterval(intervalHandle)
		}

		return cleanup
	}, [getScores])

	return { games, fetching }
}

function isClose(game: Contest) {
	const team1 = game.teams[0]
	const team2 = game.teams[1]
	const scoreDifference = Math.abs(team1.score - team2.score)

	const period = game.period
	const timeChunks = game.contestClock.split(':')
	const minutes = Number(timeChunks[0])
	const seconds = Number(timeChunks[1])
	const secondsRemainingInPeriod = minutes * 60 + seconds

	return (
		period === 2 && scoreDifference <= 10 && secondsRemainingInPeriod <= 300
	)
}

type Props = {
	getScores: () => Promise<Contest[]>
	initialGames: Contest[]
}

export default function CloseGames({ getScores, initialGames }: Props) {
	const { games, fetching } = useGames(initialGames, getScores)

	const sortedGames = sortBy(
		games,
		(g) => isClose(g),
		(g) => Math.abs(g.teams[0].score - g.teams[1].score)
	).filter((g) => g.gameState === 'I')

	return (
		<>
			<main className="container mx-auto min-h-96">
				<div className="flex">
					<h1 className="grow">ncaa close games</h1>
					<p className={fetching ? undefined : 'invisible'}>updating...</p>
				</div>
				{sortedGames && sortedGames.length < 1 ? 'No live games' : null}
				<div className="space-y-5">
					{sortedGames?.map((g) => {
						const team1 = g.teams[0]
						const team2 = g.teams[1]
						const isClose_ = isClose(g)
						return (
							<div
								key={g.contestId}
								className={`space-y-3${g.gameState === 'I' ? '' : ' hidden'}`}
							>
								{isClose_ ? <div>Close game!</div> : null}
								<div>
									{g.currentPeriod === 'HALFTIME'
										? 'Halftime'
										: `${g.currentPeriod} - ${g.contestClock}`}
								</div>
								<div className={`flex gap-5`}>
									<div>
										<div className="text-sm">
											{team1.record} - {team1.seed} seed
										</div>
										<div className="text-lg">
											{team1.nameShort} {team1.score}
										</div>
									</div>
									<div>
										<div className="text-sm">
											{team2.record} - {team2.seed} seed
										</div>
										<div className="text-lg">
											{team2.score} {team2.nameShort}
										</div>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</main>
			<footer className="text-xs p-32">
				<a
					href="https://www.flaticon.com/free-icons/basketball"
					title="basketball icons"
				>
					Basketball icons created by ranksol graphics - Flaticon
				</a>
			</footer>
		</>
	)
}
