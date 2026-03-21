import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: 'https://ncaa-close-games.tweeres.ca/men',
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: 'https://ncaa-close-games.tweeres.ca/women',
			changeFrequency: 'daily',
			priority: 1,
		},
	]
}
