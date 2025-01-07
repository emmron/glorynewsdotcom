<script>
  import "../app.css";
</script>

<nav class="bg-white shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex">
        <div class="flex-shrink-0 flex items-center">
          <a href="/" class="text-xl font-bold text-purple-900">Perth Glory</a>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
          <a href="/" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
            News
          </a>
          <a href="/ladder" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
            Ladder
          </a>
        </div>
      </div>
    </div>
  </div>
</nav>

<slot /> 