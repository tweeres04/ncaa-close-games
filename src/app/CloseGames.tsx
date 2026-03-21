'use client'

import Link from 'next/link'

import { useEffect, useTransition } from 'react'
import { startCase } from 'lodash'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import Cookie from 'js-cookie'

import { explanation } from './metadata'
import type { Game, Gender } from './models'
import basketballImage from '../../public/basketball.png'

function Game({ game }: { game: Game }) {
	const team1 = game.teams[0]
	const team2 = game.teams[1]
	return (
		<div
			key={game.id}
			className={`${
				game.gameState === 'live' || game.gameState === 'final' ? '' : ' hidden'
			}${game.gameState === 'final' ? ' text-black/40' : ''}`}
		>
			{game.close ? (
				<div>
					<strong>Close game{game.gameState === 'final' ? '' : '!'}</strong>
				</div>
			) : null}
			{game.upset ? (
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
						{team1.record ? `${team1.record} - ` : ''} {team1.seed} seed
					</div>
					<div
						className={`text-lg flex items-center gap-2${
							team1.score > team2.score ? ' font-bold' : ''
						}`}
					>
						<div className="w-8 h-8 flex items-center justify-center shrink-0">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={team1.logoUrl}
								alt={`${team1.nameShort} logo`}
								className="max-w-full max-h-full object-contain"
							/>
						</div>
						{team1.nameShort} {team1.score}
					</div>
				</div>
				<div>
					<div className="text-sm">
						{team2.record ? `${team2.record} - ` : ''}
						{team2.seed} seed
					</div>
					<div
						className={`text-lg flex items-center gap-2${
							team2.score > team1.score ? ' font-bold' : ''
						}`}
					>
						<div className="w-8 h-8 flex items-center justify-center shrink-0">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={team2.logoUrl}
								alt={`${team2.nameShort} logo`}
								className="max-w-full max-h-full object-contain"
							/>
						</div>
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

function useAutoRefresh() {
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	useEffect(() => {
		const interval = setInterval(() => {
			startTransition(() => {
				router.refresh()
			})
		}, 15000)
		return () => clearInterval(interval)
	}, [router])

	return isPending
}

type Props = {
	gender: Gender
	inProgressGames: Game[]
	finishedGames: Game[]
}

export default function CloseGames({ gender, inProgressGames, finishedGames }: Props) {
	const updating = useAutoRefresh()

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
					<h1 className="grow">ncaa close games</h1>
					<p className={updating ? undefined : 'invisible'}>
						updating...
					</p>
				</div>
				<div className="flex gap-3">
					{gender === 'men' ? (
						<span className="text-xl">Men</span>
					) : (
						<Link href="/men" className="text-xl">
							Men
						</Link>
					)}
					{gender === 'women' ? (
						<span className="text-xl">Women</span>
					) : (
						<Link href="/women" className="text-xl">
							Women
						</Link>
					)}
				</div>
				{[...inProgressGames, ...finishedGames].length < 1
					? 'No games today yet'
					: null}
				<div className="space-y-8 my-12">
					{inProgressGames?.map((g) => (
						<Game key={g.id} game={g} />
					))}
					{finishedGames?.map((g) => (
						<Game key={g.id} game={g} />
					))}
				</div>
			</main>
			<footer className="container mx-auto text-xs p-1 space-y-2 mt-20 pb-[env(safe-area-inset-bottom)]">
				<h2 className="text-2xl">FAQ</h2>
				<h3 className="text-lg">What is this?</h3>
				<p>
					A March Madness tracker that shows exciting games (close, or potential
					upset) at the top
				</p>
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
