/**
 * Returns a highly curated, premium cinematic Unsplash image URL 
 * based on the title or genre list of a movie.
 */
export function getMoviePosterUrl(title: string, genres: string[] = []): string {
  const lowerTitle = title.toLowerCase().trim();
  
  // Curated premium high-definition mappings for common films and presets
  if (lowerTitle === "inception") {
    return "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "the dark knight" || lowerTitle.includes("dark knight") || lowerTitle.includes("batman") || lowerTitle === "joker") {
    return "https://images.unsplash.com/photo-1542204113-e9354172559f?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "interstellar") {
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "parasite") {
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "spirited away" || lowerTitle.includes("ghibli") || lowerTitle.includes("spirited away")) {
    return "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "pulp fiction") {
    return "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "la la land") {
    return "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "whiplash") {
    return "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "the matrix" || lowerTitle.includes("matrix")) {
    return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle.includes("spotless mind") || lowerTitle.includes("eternal sunshine")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "the godfather" || lowerTitle.includes("godfather")) {
    return "https://images.unsplash.com/photo-1485646979142-66bb57c91d35?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "alien") {
    return "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "get out") {
    return "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "gladiator") {
    return "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle === "avatar") {
    return "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=600&auto=format&fit=crop"; 
  }
  if (lowerTitle.includes("dune") || lowerTitle.includes("blade runner") || lowerTitle.includes("neon reckoning")) {
    return "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600&auto=format&fit=crop"; 
  }

  // Genre-based beautiful fallback photography
  const genreSet = new Set(genres.map(g => g.toLowerCase().trim()));
  
  if (genreSet.has("sci-fi") || genreSet.has("science fiction") || genreSet.has("space")) {
    return "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop";
  }
  if (genreSet.has("fantasy")) {
    return "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop";
  }
  if (genreSet.has("horror") || genreSet.has("spooky") || genreSet.has("thriller") || genreSet.has("mystery")) {
    return "https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=600&auto=format&fit=crop";
  }
  if (genreSet.has("action") || genreSet.has("adventure")) {
    return "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop";
  }
  if (genreSet.has("romance") || genreSet.has("romantic") || genreSet.has("love")) {
    return "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop";
  }
  if (genreSet.has("comedy")) {
    return "https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=600&auto=format&fit=crop";
  }
  if (genreSet.has("anime") || genreSet.has("animation")) {
    return "https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=600&auto=format&fit=crop";
  }
  if (genreSet.has("documentary") || genreSet.has("biography") || genreSet.has("history")) {
    return "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop";
  }
  if (genreSet.has("drama") || genreSet.has("crime")) {
    return "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=600&auto=format&fit=crop";
  }

  // General elegant cinema theme fallbacks with slight variety based on the movie name character count
  const fallbacks = [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop", // Movie tickets/theatre
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600&auto=format&fit=crop", // Cinema projector
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop", // Vintage theatre chairs
  ];
  
  const charSum = title.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return fallbacks[charSum % fallbacks.length];
}
