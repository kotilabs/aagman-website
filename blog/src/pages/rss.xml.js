import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site, base } from '../config';

export async function GET(context) {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: 'Āagman Blog — AI Trading for Indian Markets',
    description: 'Research, strategies, and market notes from the AI trading team at Āagman.',
    site: context.site || `${site}${base}/`,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `${base}/${post.data.slug}/`,
      categories: post.data.tags,
      author: `${post.data.author}@aagman.ai`,
    })),
    customData: `<language>en-us</language>`,
  });
}
