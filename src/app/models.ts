export type Gender = 'men' | 'women'

export type MenTeam = {
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
	gameState: 'P' | 'I' | 'F' // P (pre) | I (in progress)
	gamestateDisplay: string
	period: number
	currentPeriod: string
	contestClock: string
	round: {
		title: string
	}
	teams: MenTeam[]
}

export type WomenTeam = {
	score: string
	names: {
		short: string
		full: string
	}
	winner: boolean
	seed: number
	description: string // record
}

export type WomenGame = {
	gameID: string
	home: WomenTeam
	away: WomenTeam
	startTimeEpoch: string
	currentPeriod: string
	contestClock: string
	gameState: 'final' | 'live' | 'pre'
}

export type Team = {
	score: number
	seed: number
	nameShort: string
	record: string
}

export type Game = {
	id: number
	teams: Team[]
	startTimeEpoch: string
	period: number | null
	periodText: string
	contestClock: string
	gameState: 'final' | 'live' | 'pre'
	gender: Gender
}

const menGameStateToGameState: Record<Contest['gameState'], Game['gameState']> =
	{
		P: 'pre',
		I: 'live',
		F: 'final',
	}

export function menTeamToTeam(team: MenTeam): Team {
	return {
		score: team.score,
		seed: team.seed,
		nameShort: team.nameShort,
		record: team.record,
	}
}

export function menContestToGame(contest: Contest): Game {
	return {
		id: contest.contestId,
		teams: contest.teams.map(menTeamToTeam),
		startTimeEpoch: contest.startTimeEpoch,
		period: contest.currentPeriod === 'HALFTIME' ? null : contest.period,
		periodText: contest.currentPeriod,
		contestClock: contest.contestClock,
		gameState: menGameStateToGameState[contest.gameState],
		gender: 'men',
	}
}

export function womenTeamToTeam(team: WomenTeam): Team {
	return {
		score: Number(team.score),
		seed: team.seed,
		nameShort: team.names.short,
		record: team.description,
	}
}

export function womenGameToGame(game: WomenGame): Game {
	let period: number | null = parseInt(game.currentPeriod)
	period = isNaN(period) ? null : period
	return {
		id: Number(game.gameID),
		teams: [womenTeamToTeam(game.home), womenTeamToTeam(game.away)],
		startTimeEpoch: game.startTimeEpoch,
		period,
		periodText: game.currentPeriod,
		contestClock: game.contestClock,
		gameState: game.gameState,
		gender: 'women',
	}
}
