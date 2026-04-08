<script lang="ts">
  import { page } from '$app/stores';

  interface Props {
    title?: string;
    description?: string;
    image?: string;
    canonical?: string;
    ogType?: 'website' | 'article' | 'profile';
    noindex?: boolean;
  }

  let { 
    title = 'Brandname', 
    description = 'Brandname is a platform that helps you to track and manage your inventory.',
    image = '/og-image.png',
    canonical,
    ogType = 'website',
    noindex = false
  }: Props = $props();

  const siteName = 'Brandname';
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const url = $page.url.href;
</script>

<svelte:head>
  <!-- Basic -->
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if canonical}
    <link rel="canonical" href={canonical} />
  {/if}
  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
  {/if}

  <!-- OpenGraph -->
  <meta property="og:site_name" content={siteName} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:type" content={ogType} />
  <meta property="og:image" content={image} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
</svelte:head>
