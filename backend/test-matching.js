
const assert = require("node:assert/strict");

const {
  tokenize,
  descriptionSimilarity,
  calculateMatchScore,
} = require("./matching");

const lostWallet = {
  id: 1,
  type: "lost",
  title: "Black wallet",
  description: "Black leather wallet containing a student ID card",
  category: "Accessories",
  location: "University Library",
};

const foundWallet = {
  id: 2,
  type: "found",
  title: "Wallet found in library",
  description: "Found a black leather wallet near the library entrance",
  category: "Accessories",
  location: "University Library",
};

const foundPhone = {
  id: 3,
  type: "found",
  title: "Silver mobile phone",
  description: "Silver phone found near the cafeteria",
  category: "Electronics",
  location: "Cafeteria",
};

const anotherLostWallet = {
  ...lostWallet,
  id: 4,
};

function test(name, callback) {
  try {
    callback();
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

test("Tokenization removes duplicate words", () => {
  const words = tokenize("Wallet wallet BLACK");
  assert.equal(words.size, 2);
  assert.ok(words.has("wallet"));
  assert.ok(words.has("black"));
});

test("Similar descriptions have positive similarity", () => {
  const similarity = descriptionSimilarity(
    "black leather wallet",
    "black wallet found"
  );

  assert.ok(similarity > 0);
  assert.ok(similarity <= 1);
});

test("Matching category and location increases the score", () => {
  const result = calculateMatchScore(lostWallet, foundWallet);

  assert.ok(result.score > 0);
  assert.ok(result.reasons.includes("Same category"));
  assert.ok(result.reasons.includes("Same location"));
});

test("Different categories do not receive the category bonus", () => {
  const result = calculateMatchScore(lostWallet, foundPhone);

  assert.ok(!result.reasons.includes("Same category"));
});

test("Two lost reports cannot match each other", () => {
  const result = calculateMatchScore(lostWallet, anotherLostWallet);

  assert.equal(result.score, 0);
  assert.deepEqual(result.reasons, []);
});

test("Match score remains within the valid range", () => {
  const result = calculateMatchScore(lostWallet, foundWallet);

  assert.ok(result.score >= 0);
  assert.ok(result.score <= 100);
});
