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
  ratingValue: '5.0',
  bestRating: '5',
  worstRating: '1',
  ratingCount: '5',
  reviewCount: '5'
};

const REVIEWS = [
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Kay P.' },
    datePublished: '2025-12-20',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "I called for tow truck in Queens area and hired Jonuzi Towing in Queens. I am super happy with the tow truck service, service was fast and professional. Whenever you guys are in need for tow truck in Queens don't forget to hire Jonuzi towing. Best tow truck service in Queens."
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
    author: { '@type': 'Person', name: 'Daniel Campasano' },
    datePublished: '2025-11-29',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "My car broke down in the middle of the street, and I was lucky enough to have been in front of a jonuzi towing truck who helped me out of the kindness of there heart, drove my car back to my parking lot. Service was fast and efficient. The guy was super nice and helpful. I highly recommend people to use this company."
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
    author: { '@type': 'Person', name: 'Megan Michalski' },
    datePublished: '2025-07-05',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: "Arrived to assist me quickly. He towed my car to the destination quickly and safely. Great communication. Very reliable."
  }
];

// 2 short display reviews for on-page testimonial blocks (keeps HTML compact)
const DISPLAY_REVIEWS_SHORT = [
  { name: 'Kay P.', text: 'Super happy with the tow truck service — fast and professional. Best tow truck service in Queens.' },
  { name: 'Nickia Williams', text: 'Got my car from the tightest driveway to CarMax without any hiccups. Price matched and super efficient. Highly recommend.' },
  { name: 'Daniel Campasano', text: 'My car broke down and they helped me out of the kindness of their heart. Fast, efficient, saved me such a headache.' },
  { name: 'Lorena Ferrer', text: 'Timely, effective and reliable service. Very helpful and professional.' },
  { name: 'Megan Michalski', text: 'Arrived quickly, towed safely, great communication. Very reliable.' }
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
