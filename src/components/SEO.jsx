import { Helmet } from 'react-helmet-async'

// Base URL for the application
export const BASE_URL = 'https://www.shiftascent.com'

/**
 * SEO Component for dynamic meta tags
 *
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} image - OG image URL (absolute)
 * @param {string} url - Canonical URL (absolute)
 * @param {string} type - OG type (default: website)
 * @param {object} twitter - Twitter-specific overrides
 * @param {object} additional - Additional meta tags
 */
export default function SEO({
    title = 'SHIFT ASCENT | Build in Public Progress Tracker',
    description = 'Track your startup journey like climbing a mountain. Share beautiful progress banners on X & LinkedIn.',
    image = `${BASE_URL}/img1.png`,
    url = BASE_URL,
    type = 'website',
    twitter = {},
    additional = {}
}) {
    const fullTitle = title.includes('SHIFT') ? title : `${title} | SHIFT ASCENT`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />

            {/* Canonical URL */}
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook / LinkedIn */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="SHIFT ASCENT" />

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitter.card || 'summary_large_image'} />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={twitter.title || fullTitle} />
            <meta name="twitter:description" content={twitter.description || description} />
            <meta name="twitter:image" content={twitter.image || image} />

            {/* Additional custom meta tags */}
            {Object.entries(additional).map(([name, content]) => (
                <meta key={name} name={name} content={content} />
            ))}
        </Helmet>
    )
}

/**
 * Generate SEO props for a public profile
 */
export function getPublicProfileSEO({ username, title, target, progress, bio, encouragementCount }) {
    const displayProgress = Math.round(progress || 0);
    const profileUrl = `${BASE_URL}/climb/@${username}`;

    // Generate a dynamic description
    let description = `@${username} is ${displayProgress}% towards "${title}"`;
    if (target) {
        description += ` - ${target}`;
    }
    description += `. Follow their journey on SHIFT ASCENT!`;

    // For now, use the default OG image
    // In production, you could generate dynamic images via an API
    const ogImage = `${BASE_URL}/img1.png`;

    return {
        title: `@${username}'s Journey: ${title}`,
        description: description.substring(0, 160),
        url: profileUrl,
        image: ogImage,
        type: 'profile',
        twitter: {
            card: 'summary_large_image',
            title: `${displayProgress}% to "${title}" | @${username}`,
            description: bio || description
        },
        additional: {
            'profile:username': username
        }
    };
}

/**
 * Generate SEO props for the Discover page
 */
export function getDiscoverPageSEO() {
    return {
        title: 'Discover Journeys | SHIFT ASCENT',
        description: 'Explore public journeys from our community. Get inspired, send encouragement, and find your path to the summit.',
        url: `${BASE_URL}/discover`,
        type: 'website'
    };
}
