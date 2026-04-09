// Shared business metadata — single source of truth for schema + social proof.
// Loaded by all page generators so updates here propagate everywhere.

const PLACE_ID = 'ChIJO4EuBb6Qa2cR4y7bzZoOXXc';
const GBP_URL = `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`;

const SOCIAL = {
  facebook: 'https://www.facebook.com/profile.php?id=61582313440260',
  instagram: 'https://www.instagram.com/jonuzitowing/',
  youtube: 'https://www.youtube.com/channel/UCOM6eHY6etVHo-Oq43pqk3Q',
  gbp: GBP_URL
};

const SAME_AS = [SOCIAL.facebook, SOCIAL.instagram, SOCIAL.youtube, SOCIAL.gbp];

// Real GBP review data — update ratingCount/reviewCount as new reviews come in
const AGGREGATE_RATING = {
  '@type': 'AggregateRating',
  ratingValue: '4.9',
  bestRating: '5',
  worstRating: '1',
  ratingCount: '19',
  reviewCount: '19'
};

const REVIEWS = [
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'The M.' },
    datePublished: '2026-03-15',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Outstanding Service! I had an excellent experience with Jonuzi Towing. From start to finish, their professionalism and customer service were truly impressive. The driver arrived quickly, handled my vehicle with great care, and clearly knew exactly what he was doing. What stood out most was their communication — clear updates, fair pricing with no surprises, and a genuine willingness to help."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Kay P.' },
    datePublished: '2025-12-20',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "I called for tow truck in Queens area and hired Jonuzi Towing in Queens. I am super happy with the tow truck service, service was fast and professional. Best tow truck service in Queens."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'KGamer T.' },
    datePublished: '2026-02-10',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Great service! I called Jonuzi Towing when my car broke down and they showed up really fast."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Nickia Williams' },
    datePublished: '2025-12-13',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "I needed to get my car to carmax and they managed to get my car from the tightest of driveways to its destination without any hiccups! Not only that but they also price matched for me and are just the nicest and most efficient people you can work with! Very satisfied, highly recommend."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Diana S.' },
    datePublished: '2026-01-20',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Sergio came quickly to the rescue towing my car. He was very considerate with my request."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Hayley D.' },
    datePublished: '2026-02-05',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Alex is truly given 5 stars! He was so beyond helpful throughout the towing process."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Daniel Campasano' },
    datePublished: '2025-11-29',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "My car broke down in the middle of the street, and I was lucky enough to have been in front of a Jonuzi towing truck who helped me out of the kindness of their heart. Service was fast and efficient. I highly recommend people to use this company."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Janice S.' },
    datePublished: '2026-01-15',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "The tow driver was very professional. He called to inform me that he was running a little late."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Astoria M.' },
    datePublished: '2026-02-20',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Hendrix is a hidden gem. He came, he saw, he conquered. He was fast and efficient."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Jeannatalee B.' },
    datePublished: '2026-03-01',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Steve did a great job getting me to my inspection appointment on time."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Ahmad' },
    datePublished: '2026-03-10',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Super fast service, the price was fair and the driver was very friendly."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Megan Michalski' },
    datePublished: '2025-07-05',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Arrived to assist me quickly. He towed my car to the destination quickly and safely. Great communication. Very reliable."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Gabe J.' },
    datePublished: '2026-02-25',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Provided excellent and speedy service. Prioritized safety and great communication."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Arlind L.' },
    datePublished: '2026-03-05',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Very professional handling service. I highly recommend this company!"
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Lorena Ferrer' },
    datePublished: '2025-11-01',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Timely, effective and reliable service. The tow truck driver was very helpful and professional."
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Prezidential H.' },
    datePublished: '2026-03-20',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Excellent service, not 1 complaint. Will recommend!!!"
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Vince M.' },
    datePublished: '2026-03-25',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "On time, good manners."
  }
];

// 2 short display reviews for on-page testimonial blocks (keeps HTML compact)
const DISPLAY_REVIEWS_SHORT = [
  { name: 'The M.', text: 'Outstanding Service! Professionalism and customer service were truly impressive. Fair pricing with no surprises.' },
  { name: 'Kay P.', text: 'Super happy with the tow truck service — fast and professional. Best tow truck service in Queens.' },
  { name: 'Hayley D.', text: 'Alex is truly given 5 stars! He was so beyond helpful throughout the towing process.' },
  { name: 'Astoria M.', text: 'Hendrix is a hidden gem. He came, he saw, he conquered. Fast and efficient.' },
  { name: 'Ahmad', text: 'Super fast service, the price was fair and the driver was very friendly.' },
  { name: 'Nickia Williams', text: 'Got my car from the tightest driveway to CarMax without any hiccups. Price matched and super efficient.' },
  { name: 'Gabe J.', text: 'Provided excellent and speedy service. Prioritized safety and great communication.' },
  { name: 'Daniel Campasano', text: 'My car broke down and they helped me out of the kindness of their heart. Fast, efficient, highly recommend.' }
];

const YOUTUBE_SHORTS = [
  'vlhbq2KRIQ8',
  'tVnbm9oxJ1E'
];

module.exports = {
  PLACE_ID,
  GBP_URL,
  SOCIAL,
  SAME_AS,
  AGGREGATE_RATING,
  REVIEWS,
  DISPLAY_REVIEWS_SHORT,
  YOUTUBE_SHORTS
};
