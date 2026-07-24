import rss from '@astrojs/rss';
import { BLOG_TITLE, BLOG_DESCRIPTION } from '../consts';
import { getSortedPosts } from '../lib/posts';

export async function GET(context) {
  const posts = await getSortedPosts();

  return rss({
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}`,
    })),
  });
}
