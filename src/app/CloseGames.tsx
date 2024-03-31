'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'
import { capitalize, orderBy, startCase } from 'lodash'
import Image from 'next/image'

import Cookie from 'js-cookie'

import { explanation } from './metadata'
import type { Game, Gender } from './models'
import basketballImage from '../../public/basketball.png'

function useGames(
	gender: Gender,
	initialGames: Game[],
	getScores: (gender: Gender) => Promise<Game[]>
) {
	const [games, setGames] = useState<Game[]>(initialGames)
	const [fetching, setFetching] = useState(false)
	const [firstFetch, setFirstFetch] = useState(true)

	useEffect(() => {
		async function fetchGames() {
			setFetching(true)
			const games = await getScores(gender).finally(() => {
				setFetching(false)
				setFirstFetch(false)
			})
			setGames(games)
		}

		const intervalHandle = setInterval(fetchGames, 15000)
		fetchGames()

		function cleanup() {
			clearInterval(intervalHandle)
		}

		return cleanup
	}, [gender, getScores])

	const inProgressGames = orderBy(
		games,
		[
			(g) => isClose(g),
			(g) => isUpset(g),
			(g) => g.period,
			(g) => Math.abs(g.teams[0].score - g.teams[1].score),
		],
		['desc', 'desc', 'desc'] // boolean results need desc sorting
	).filter((g) => g.gameState === 'live')

	const finishedGames = orderBy(
		games,
		[
			(g) => isUpset(g),
			(g) => isClose(g),
			(g) => Math.abs(g.teams[0].score - g.teams[1].score),
		],
		['desc', 'desc'] // boolean results need desc sorting
	).filter((g) => g.gameState === 'final')

	return { games, inProgressGames, finishedGames, fetching, firstFetch }
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

function Game({ game }: { game: Game }) {
	const team1 = game.teams[0]
	const team2 = game.teams[1]
	const isClose_ = isClose(game)
	const isUpset_ = isUpset(game)
	return (
		<div
			key={game.id}
			className={`space-y-1${
				game.gameState === 'live' || game.gameState === 'final' ? '' : ' hidden'
			}${game.gameState === 'final' ? ' text-black/40' : ''}`}
		>
			{isClose_ ? (
				<div>
					<strong>Close game{game.gameState === 'final' ? '' : '!'}</strong>
				</div>
			) : null}
			{isUpset_ ? (
				<div>
					<strong>
						{game.gameState === 'final' ? 'Upset' : 'Potential upset'}
					</strong>
				</div>
			) : null}
			<div>
				{game.gameState === 'final'
					? 'Final'
					: game.period === null
					? startCase(game.periodText.toLowerCase())
					: `${startCase(game.periodText.toLowerCase())} - ${
							game.contestClock
					  }`}
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
}

function useDefaultGenderCookie() {
	useEffect(() => {
		const { pathname } = window.location

		const pathParts = pathname.split('/')
		if (pathParts[1]) {
			Cookie.set('default_gender', pathParts[1], { expires: 7 })
		}
	}, [])
}

type Props = {
	gender: Gender
	getScores: (gender: Gender) => Promise<Game[]>
	initialGames: Game[]
}

export default function CloseGames({ gender, getScores, initialGames }: Props) {
	const { inProgressGames, finishedGames, fetching, firstFetch } = useGames(
		gender,
		initialGames,
		getScores
	)

	useDefaultGenderCookie()

	return (
		<>
			<main className="container mx-auto min-h-96 px-1">
				<Image
					src={basketballImage}
					alt="Basketball background"
					className="fixed bottom-0 right-0 bg-orange-50/10 opacity-10 w-60 sm:w-auto"
				/>
				<div className="flex">
					<h1 className="grow">ncaa close games - {capitalize(gender)}</h1>
					<p className={fetching && !firstFetch ? undefined : 'invisible'}>
						updating...
					</p>
				</div>
				<div className="flex gap-3 mb-3">
					<Link href="/men" className="text-xl">
						Men
					</Link>
					<Link href="/women" className="text-xl">
						Women
					</Link>
				</div>
				{[...inProgressGames, ...finishedGames].length < 1
					? 'No games today yet'
					: null}
				<div className="space-y-5">
					{inProgressGames?.map((g) => (
						<Game key={g.id} game={g} />
					))}
					{finishedGames?.map((g) => (
						<Game key={g.id} game={g} />
					))}
				</div>
			</main>
			<footer className="container mx-auto text-xs p-1 space-y-2 mt-3">
				<h2 className="text-2xl">FAQ</h2>
				<h3 className="text-lg">What is this?</h3>
				<p>A March Madness tracker with a focus on close games and upsets.</p>
				<h3 className="text-lg">What&apos;s a close game?</h3>
				<p>{explanation}</p>
				<h3 className="text-lg">How are games sorted?</h3>
				<p>
					<ul className="list-inside">
						<li>In progress games:</li>
						<li className="list-none">
							<ol className="list-decimal list-inside pl-2">
								<li>Close games</li>
								<li>Potential upsets</li>
								<li>Games in second half</li>
								<li>Point difference, smallest first</li>
							</ol>
						</li>
						<li>Completed games:</li>
						<li className="list-none">
							<ol className="list-decimal list-inside pl-2">
								<li>Upsets</li>
								<li>Close games</li>
								<li>Point difference, smallest first</li>
							</ol>
						</li>
					</ul>
				</p>
				<p>
					<a
						href="https://www.flaticon.com/free-icons/basketball"
						title="basketball icons"
					>
						Basketball icons created by ranksol graphics - Flaticon
					</a>
				</p>
			</footer>
		</>
	)
}
