'use client'

import { useEffect, useState } from 'react'
import { orderBy } from 'lodash'
import Image from 'next/image'

import { Contest } from './page'
import basketballImage from '../../public/basketball.png'

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
		}, 15000)

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

	const sortedGames = orderBy(
		games,
		[
			(g) => g.gameState === 'I',
			(g) => isClose(g),
			(g) => Math.abs(g.teams[0].score - g.teams[1].score),
		],
		['desc', 'desc']
	).filter((g) => g.gameState === 'I' || g.gameState === 'F')

	return (
		<>
			<main className="container mx-auto min-h-96 px-1">
				<Image
					src={basketballImage}
					alt="Basketball background"
					className="fixed bottom-0 right-0 bg-orange-50/10 opacity-10 w-60 sm:w-auto"
				/>
				<div className="flex">
					<h1 className="grow">ncaa close games</h1>
					<p className={fetching ? undefined : 'invisible'}>updating...</p>
				</div>
				{sortedGames && sortedGames.length < 1 ? 'No games today yet' : null}
				<div className="space-y-5">
					{sortedGames?.map((g) => {
						const team1 = g.teams[0]
						const team2 = g.teams[1]
						const isClose_ = isClose(g)
						return (
							<div
								key={g.contestId}
								className={`space-y-1${
									g.gameState === 'I' || g.gameState === 'F' ? '' : ' hidden'
								}${g.gameState === 'F' ? ' text-black/50' : ''}`}
							>
								{isClose_ ? (
									<div>
										<strong>Close game!</strong>
									</div>
								) : null}
								<div>
									{g.currentPeriod === 'HALFTIME'
										? 'Halftime'
										: g.gameState === 'F'
										? 'Final'
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
