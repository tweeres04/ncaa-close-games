import { MetadataRoute } from 'next'

import { metadata } from './layout'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: metadata.title as string,
		short_name: metadata.title as string,
		description: metadata.description as string,
		start_url: '/',
		display: 'standalone',
		background_color: 'rgb(255 247 237)',
		theme_color: 'rgb(255 247 237)',
		icons: [
			{
				src: '/basketball.png',
				sizes: 'any',
				type: 'image/png',
			},
		],
	}
}
