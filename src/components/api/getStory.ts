import { useStoryblokApi } from "@storyblok/astro";
import type { ISbStoriesParams } from "@storyblok/astro";

const storyblokApi = useStoryblokApi();

// interface storyProps {
//   slug: string;
//   resolve_relations?: string | undefined | null;
// }

export const getStory = async ({ slug, resolve_relations }) => {
  const sbParams: ISbStoriesParams = {
    version:
      import.meta.env.PUBLIC_ENVIRONMENT === "development" ? "draft" : "published",
  };

  if (resolve_relations) {
    sbParams["resolve_relations"] = resolve_relations;
  }

  try {
    const {
      data: {
        story: { content },
      },
    } = await storyblokApi.get(`cdn/stories/${slug}`, sbParams);
    return content;
  } catch (e) {
    // throw `Error - Ensure you have a this ${slug} in storyblok`;
  }
};
