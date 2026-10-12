

function tokenize(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 1)
  );
}

function descriptionSimilarity(a, b) {
  const wordsA = tokenize(a);
  const wordsB = tokenize(b);

  const intersection = [...wordsA].filter(word => wordsB.has(word));
  const union = new Set([...wordsA, ...wordsB]);

  if (union.size === 0) return 0;

  return intersection.length / union.size;
}

function calculateMatchScore(lost, found) {
  if (lost.type !== "lost" || found.type !== "found") {
    return { score: 0, reasons: [] };
  }

  let score = 0;
  const reasons = [];

  if (lost.category.toLowerCase() === found.category.toLowerCase()) {
    score += 40;
    reasons.push("Same category");
  }

  if (lost.location.toLowerCase() === found.location.toLowerCase()) {
    score += 25;
    reasons.push("Same location");
  }

  const similarity = descriptionSimilarity(
    lost.title + " " + lost.description,
    found.title + " " + found.description
  );

  score += Math.round(similarity * 35);

  if (similarity > 0) {
    reasons.push("Similar descriptions");
  }

  return {
    score: Math.min(score, 100),
    reasons
  };
}

module.exports = {
  tokenize,
  descriptionSimilarity,
  calculateMatchScore
};
