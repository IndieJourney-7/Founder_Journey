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
 * Generate dynamic OG image URL
 */
export function generateOGImageUrl({ username, title, target, progress, cheers, days, type = 'profile', milestone }) {
    const params = new URLSearchParams({
        username: username || 'founder',
        title: title || 'My Journey',
        progress: Math.round(progress || 0).toString(),
        type,
    });

    if (target) params.set('target', target);
    if (cheers) params.set('cheers', cheers.toString());
    if (days) params.set('days', days.toString());
    if (milestone) params.set('milestone', milestone);

    return `${BASE_URL}/api/og?${params.toString()}`;
}

/**
 * Generate SEO props for a public profile
 */
export function getPublicProfileSEO({ username, title, target, progress, bio, encouragementCount, createdAt }) {
    const displayProgress = Math.round(progress || 0);
    const profileUrl = `${BASE_URL}/climb/@${username}`;

    // Calculate days on journey
    const days = createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Generate a dynamic description
    let description = `@${username} is ${displayProgress}% towards "${title}"`;
    if (target) {
        description += ` - ${target}`;
    }
    description += `. Follow their journey on SHIFT ASCENT!`;

    // Generate dynamic OG image
    const ogImage = generateOGImageUrl({
        username,
        title,
        target,
        progress: displayProgress,
        cheers: encouragementCount,
        days,
        type: 'profile'
    });

    return {
        title: `@${username}'s Journey: ${title}`,
        description: description.substring(0, 160),
        url: profileUrl,
        image: ogImage,
        type: 'profile',
        twitter: {
            card: 'summary_large_image',
            title: `${displayProgress}% to "${title}" | @${username}`,
            description: bio || description,
            image: ogImage
        },
        additional: {
            'profile:username': username
        }
    };
}

/**
 * Generate SEO props for a milestone celebration
 */
export function getMilestoneSEO({ username, title, milestone, target }) {
    const profileUrl = `${BASE_URL}/climb/@${username}`;

    const milestoneText = milestone === '100' ? 'reached the summit' :
        milestone === '75' ? 'is 75% there' :
            milestone === '50' ? 'hit the halfway point' : 'is 25% of the way';

    const description = `@${username} ${milestoneText} on their journey to "${title}"! Cheer them on!`;

    // Generate milestone OG image
    const ogImage = generateOGImageUrl({
        username,
        title,
        target,
        progress: parseInt(milestone),
        type: 'milestone',
        milestone
    });

    return {
        title: `${milestone}% Milestone: @${username}'s Journey`,
        description: description.substring(0, 160),
        url: profileUrl,
        image: ogImage,
        twitter: {
            card: 'summary_large_image',
            title: `${milestone === '100' ? '🏆' : milestone === '75' ? '⭐' : milestone === '50' ? '🎯' : '🚀'} ${milestone}% Complete!`,
            description,
            image: ogImage
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
