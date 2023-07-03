function tokenize(content) {
  // This regular expression matches spaces, punctuation, and individual Chinese characters.
  const regex = /(\s+|[.,!?;]|[\u4e00-\u9fa5])/g;

  // Use the regex to split the content into tokens
  const tokens = content.split(regex).filter(Boolean);

  return tokens;
}

module.exports = {
  tokenize,
};
