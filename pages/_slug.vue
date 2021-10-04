/**
 * This file display markdown pages defined in /content directory
 */
<template>
  <div class="antialiased">
    <Header />
      <section class="bg-gray-50">
        <nuxt-content
          :document="page"
          class="mx-auto py-8 prose prose-sm sm:prose-sm"
        />
      </section>
    <Footer />
  </div>
</template>

<script>
export default {
  async asyncData({ $content, params, error }) {
    const slug = params.slug || "index";
    const page = await $content(slug)
      .fetch()
      .catch(err => {
        error({ statusCode: 404, message: `Page not found (${err})` });
      });

    return {
      page
    };
  }
};
</script>
