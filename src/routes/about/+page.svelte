<script lang="ts">
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="About Perth Glory News"
  description="Your premier source for the latest Perth Glory FC news, match updates, and exclusive content"
  keywords="Perth Glory, Football, A-League, About, News"
/>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <div class="p-8">
      <h1 class="text-4xl font-bold mb-6 text-purple-800">About Perth Glory News</h1>

      <div class="prose prose-lg max-w-none">
        <p class="mb-4">
          Perth Glory News is dedicated to bringing you the latest and most comprehensive coverage of Perth Glory Football Club.
        </p>

        <h2 class="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p>
          Our mission is to be the premier resource for Glory fans, providing timely updates, in-depth analysis,
          and exclusive content about Perth's A-League team. We aggregate news from official sources and trusted
          sports outlets to ensure you never miss an important update about your favorite club.
        </p>

        <h2 class="text-2xl font-bold mt-8 mb-4">What We Cover</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>Match previews and reviews</li>
          <li>Player interviews and profiles</li>
          <li>Transfer news and rumors</li>
          <li>Club announcements and developments</li>
          <li>A-League updates relevant to Perth Glory</li>
          <li>Glory's youth and women's teams</li>
        </ul>

        <h2 class="text-2xl font-bold mt-8 mb-4">Our Sources</h2>
        <p>
          We compile news from multiple trusted sources, including:
        </p>
        <ul class="list-disc pl-6 space-y-2">
          <li>Perth Glory Official Website</li>
          <li>Keep Up</li>
          <li>Football Australia</li>
          <li>Official Perth Glory social media channels</li>
          <li>Reputable sports news outlets</li>
        </ul>

        <h2 class="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
        <p>
          Have a tip, suggestion, or feedback? We'd love to hear from you:
        </p>
        <p class="mt-2">
          <strong>Email:</strong> <a href="mailto:info@perthglorynews.com" class="text-purple-600 hover:underline">info@perthglorynews.com</a>
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #f9fafb;
  }
</style>