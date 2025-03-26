/**
 * Text processing utilities for TamkeenAI Career System
 */

/**
 * Extract keywords from text
 * @param {string} text Input text
 * @param {Array} stopWords Words to exclude
 * @returns {Array} Array of keywords with frequencies
 */
const extractKeywords = (text, stopWords = []) => {
  if (!text) return [];
  
  // Default English stopwords
  const defaultStopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'to', 'from', 'in', 'out', 'on', 'off',
    'over', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
  ];
  
  // Combine default and custom stopwords
  const combinedStopWords = new Set([...defaultStopWords, ...stopWords]);
  
  // Clean and tokenize the text
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split on whitespace
    .filter(word => word.length > 2 && !combinedStopWords.has(word)); // Remove stopwords and short words
  
  // Count word frequencies
  const wordFrequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
  
  // Convert to array and sort by frequency
  return Object.entries(wordFrequency)
    .map(([word, frequency]) => ({ word, frequency }))
    .sort((a, b) => b.frequency - a.frequency);
};

/**
 * Calculate text readability (Flesch-Kincaid reading ease)
 * @param {string} text Input text
 * @returns {Object} Readability metrics
 */
const calculateReadability = (text) => {
  if (!text) return { score: 0, level: 'Unknown', analysis: {} };
  
  // Count words
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Count sentences
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  
  // Count syllables (simplified approximation)
  const syllableCount = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);
  
  // Calculate average sentence length
  const avgSentenceLength = wordCount / sentenceCount;
  
  // Calculate average syllables per word
  const avgSyllablesPerWord = syllableCount / Math.max(1, wordCount);
  
  // Calculate Flesch Reading Ease score
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Determine readability level
  let level;
  if (fleschScore >= 90) level = 'Very Easy';
  else if (fleschScore >= 80) level = 'Easy';
  else if (fleschScore >= 70) level = 'Fairly Easy';
  else if (fleschScore >= 60) level = 'Standard';
  else if (fleschScore >= 50) level = 'Fairly Difficult';
  else if (fleschScore >= 30) level = 'Difficult';
  else level = 'Very Difficult';
  
  return {
    score: Math.round(fleschScore),
    level,
    analysis: {
      wordCount,
      sentenceCount,
      syllableCount,
      avgSentenceLength: avgSentenceLength.toFixed(1),
      avgSyllablesPerWord: avgSyllablesPerWord.toFixed(1),
    }
  };
};

/**
 * Count syllables in a word (approximate)
 * @param {string} word Input word
 * @returns {number} Estimated syllable count
 */
const countSyllables = (word) => {
  if (!word) return 0;
  
  word = word.toLowerCase().trim();
  
  // Remove punctuation
  word = word.replace(/[^\w\s]|_/g, '');
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  
  if (!vowelGroups) return 1;
  
  let count = vowelGroups.length;
  
  // Adjust for silent 'e' at the end
  if (word.endsWith('e') && word.length > 2) count--;
  
  // Ensure at least one syllable
  return Math.max(1, count);
};

/**
 * Check text for common issues
 * @param {string} text Input text
 * @returns {Array} Issues found in the text
 */
const checkTextIssues = (text) => {
  if (!text) return [];
  
  const issues = [];
  
  // Check for passive voice (simplified)
  const passivePattern = /\b(is|are|was|were|be|been|being)\s+(\w+ed)\b/gi;
  const passiveMatches = [...text.matchAll(passivePattern)];
  if (passiveMatches.length > 0) {
    issues.push({
      type: 'passive',
      severity: 'warning',
      message: 'Consider using active voice instead of passive voice',
      matches: passiveMatches.map(match => ({
        text: match[0],
        index: match.index,
      })),
    });
  }
  
  // Check for filler words
  const fillerWords = ['actually', 'basically', 'literally', 'really', 'very', 'just', 'quite', 'simply', 'totally'];
  fillerWords.forEach(word => {
    const pattern = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      issues.push({
        type: 'filler',
        severity: 'info',
        message: `Consider removing the filler word "${word}"`,
        matches: matches.map(match => ({
          text: match[0],
          index: match.index,
        })),
      });
    }
  });
  
  // Check for repeated words
  const repeatedPattern = /\b(\w+)\s+\1\b/gi;
  const repeatedMatches = [...text.matchAll(repeatedPattern)];
  if (repeatedMatches.length > 0) {
    issues.push({
      type: 'repeated',
      severity: 'error',
      message: 'Repeated word found',
      matches: repeatedMatches.map(match => ({
        text: match[0],
        index: match.index,
      })),
    });
  }
  
  // Long sentences (more than 25 words)
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  sentences.forEach((sentence, index) => {
    const wordCount = sentence.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 25) {
      issues.push({
        type: 'long_sentence',
        severity: 'warning',
        message: 'Consider breaking this long sentence into smaller ones',
        sentence: sentence.trim(),
        index,
      });
    }
  });
  
  return issues;
};

/**
 * Get sentiment score for text (-1.0 to 1.0)
 * This is a simple implementation; in production, use a proper NLP library
 * @param {string} text Input text
 * @returns {Object} Sentiment analysis result
 */
const analyzeSentiment = (text) => {
  if (!text) return { score: 0, label: 'neutral', confidence: 0 };
  
  // Simple word lists for demonstration
  const positiveWords = [
    'good', 'great', 'excellent', 'positive', 'outstanding', 'amazing',
    'fantastic', 'wonderful', 'superb', 'brilliant', 'impressive',
    'exceptional', 'favorable', 'pleasant', 'satisfactory', 'terrific',
    'accomplished', 'achieved', 'active', 'advantage', 'beneficial'
  ];
  
  const negativeWords = [
    'bad', 'poor', 'terrible', 'negative', 'awful', 'horrible',
    'disappointing', 'inadequate', 'mediocre', 'subpar', 'unsatisfactory',
    'unfavorable', 'unpleasant', 'unsuccessful', 'fail', 'failure',
    'problem', 'difficult', 'trouble', 'challenging', 'issue'
  ];
  
  // Normalize text to lowercase
  const normalizedText = text.toLowerCase();
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Check positive words
  positiveWords.forEach(word => {
    const pattern = new RegExp(`\\b${word}\\b`, 'g');
    const matches = normalizedText.match(pattern);
    if (matches) {
      positiveCount += matches.length;
    }
  });
  
  // Check negative words
  negativeWords.forEach(word => {
    const pattern = new RegExp(`\\b${word}\\b`, 'g');
    const matches = normalizedText.match(pattern);
    if (matches) {
      negativeCount += matches.length;
    }
  });
  
  // Calculate total sentiment mentions
  const totalMentions = positiveCount + negativeCount;
  
  // If no sentiment words found, return neutral
  if (totalMentions === 0) {
    return { score: 0, label: 'neutral', confidence: 0 };
  }
  
  // Calculate sentiment score (-1 to 1)
  const score = (positiveCount - negativeCount) / totalMentions;
  
  // Determine sentiment label
  let label;
  if (score > 0.25) label = 'positive';
  else if (score < -0.25) label = 'negative';
  else label = 'neutral';
  
  // Rough confidence estimation based on total mentions
  const confidence = Math.min(1, totalMentions / 10);
  
  return {
    score: parseFloat(score.toFixed(2)),
    label,
    confidence: parseFloat(confidence.toFixed(2)),
    counts: {
      positive: positiveCount,
      negative: negativeCount,
      total: totalMentions
    }
  };
};

/**
 * Generate a simple text summary (extractive)
 * @param {string} text Input text
 * @param {number} sentences Number of sentences for summary
 * @returns {string} Summary text
 */
const summarizeText = (text, sentences = 3) => {
  if (!text) return '';
  
  // Split into sentences
  const allSentences = text
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .filter(s => s.trim().length > 0);
  
  if (allSentences.length <= sentences) {
    return text;
  }
  
  // Calculate sentence scores based on word frequency
  const wordFrequencies = {};
  allSentences.forEach(sentence => {
    sentence
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .forEach(word => {
        wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
      });
  });
  
  // Score each sentence
  const sentenceScores = allSentences.map(sentence => {
    let score = 0;
    const words = sentence
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    words.forEach(word => {
      if (wordFrequencies[word]) {
        score += wordFrequencies[word];
      }
    });
    
    // Normalize by sentence length to avoid favoring long sentences too much
    score = score / Math.max(1, words.length);
    
    return { sentence, score };
  });
  
  // Sort by score and get top sentences
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, sentences)
    // Sort back to original order
    .sort((a, b) => {
      return allSentences.indexOf(a.sentence) - allSentences.indexOf(b.sentence);
    })
    .map(item => item.sentence);
  
  return topSentences.join(' ');
};

/**
 * Compare two texts and calculate similarity
 * @param {string} text1 First text
 * @param {string} text2 Second text
 * @returns {Object} Similarity metrics
 */
const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return { score: 0, common: [], unique1: [], unique2: [] };
  
  // Tokenize texts
  const getTokens = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
  };
  
  const tokens1 = getTokens(text1);
  const tokens2 = getTokens(text2);
  
  // Get unique words
  const uniqueTokens1 = new Set(tokens1);
  const uniqueTokens2 = new Set(tokens2);
  
  // Find common words
  const commonWords = [...uniqueTokens1].filter(word => uniqueTokens2.has(word));
  
  // Find words unique to each text
  const uniqueToText1 = [...uniqueTokens1].filter(word => !uniqueTokens2.has(word));
  const uniqueToText2 = [...uniqueTokens2].filter(word => !uniqueTokens1.has(word));
  
  // Calculate Jaccard similarity
  const unionSize = uniqueTokens1.size + uniqueTokens2.size - commonWords.length;
  const similarityScore = unionSize === 0 ? 0 : commonWords.length / unionSize;
  
  return {
    score: parseFloat(similarityScore.toFixed(2)),
    common: commonWords,
    unique1: uniqueToText1,
    unique2: uniqueToText2
  };
};

/**
 * Extract key phrases from text
 * @param {string} text Input text
 * @param {number} maxPhrases Maximum number of phrases to return
 * @returns {Array} Key phrases
 */
const extractKeyPhrases = (text, maxPhrases = 5) => {
  if (!text) return [];
  
  // Split into sentences
  const sentences = text
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .filter(s => s.trim().length > 0);
  
  // Process sentences to extract noun phrases (simple approximation)
  const phrases = [];
  const nounPhrasePattern = /\b(?:(?:the|a|an|my|your|our|their|this|that|these|those)\s+)?(?:\w+\s+){0,2}(?:\w+(?:er|est|ing|ed)?\s+)?(?:\w+)\b/gi;
  
  sentences.forEach(sentence => {
    const matches = sentence.match(nounPhrasePattern) || [];
    matches.forEach(match => {
      // Filter out short or very long phrases
      if (match.length > 4 && match.length < 40 && match.split(/\s+/).length <= 5) {
        phrases.push({
          text: match.trim(),
          words: match.trim().split(/\s+/).length
        });
      }
    });
  });
  
  // Score phrases based on frequency and length
  const phraseFrequency = {};
  phrases.forEach(phrase => {
    const normalized = phrase.text.toLowerCase();
    phraseFrequency[normalized] = (phraseFrequency[normalized] || 0) + 1;
  });
  
  // Create unique phrases with scores
  const uniquePhrases = Array.from(new Set(phrases.map(p => p.text.toLowerCase())))
    .map(phrase => {
      const wordCount = phrase.split(/\s+/).length;
      // Score formula: frequency * (word count weight)
      const score = phraseFrequency[phrase] * (0.5 + (wordCount * 0.5));
      return { phrase, score, wordCount };
    })
    .sort((a, b) => b.score - a.score || b.wordCount - a.wordCount)
    .slice(0, maxPhrases)
    .map(item => item.phrase);
  
  return uniquePhrases;
};

/**
 * Detect the language of a text (simplified version)
 * For production use, consider using a dedicated library
 * @param {string} text Input text
 * @returns {Object} Detected language info
 */
const detectLanguage = (text) => {
  if (!text || text.trim().length < 10) {
    return { code: 'unknown', name: 'Unknown', confidence: 0 };
  }
  
  // Common words/patterns by language
  const languagePatterns = {
    en: {
      name: 'English',
      words: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their']
    },
    ar: {
      name: 'Arabic',
      // Arabic characters range
      pattern: /[\u0600-\u06FF]/
    },
    es: {
      name: 'Spanish',
      words: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro']
    },
    fr: {
      name: 'French',
      words: ['le', 'la', 'de', 'et', 'est', 'en', 'un', 'une', 'du', 'que', 'qui', 'dans', 'pour', 'ce', 'il', 'au', 'à', 'pas', 'je', 'on', 'par', 'plus', 'ne', 'se', 'des', 'sont', 'avec', 'vous', 'nous', 'mais', 'ou', 'leur']
    }
  };
  
  // Simple text normalization
  const normalizedText = text.toLowerCase();
  
  // Check for Arabic characters
  if (languagePatterns.ar.pattern.test(normalizedText)) {
    const arabicChars = normalizedText.match(languagePatterns.ar.pattern) || [];
    const arabicRatio = arabicChars.length / normalizedText.length;
    
    if (arabicRatio > 0.4) {
      return {
        code: 'ar',
        name: 'Arabic',
        confidence: Math.min(1, arabicRatio)
      };
    }
  }
  
  // Check word frequencies for other languages
  const results = {};
  
  Object.keys(languagePatterns).forEach(langCode => {
    if (langCode === 'ar') return; // Already checked Arabic
    
    const lang = languagePatterns[langCode];
    if (!lang.words) return;
    
    let matches = 0;
    lang.words.forEach(word => {
      const pattern = new RegExp(`\\b${word}\\b`, 'g');
      const wordMatches = (normalizedText.match(pattern) || []).length;
      matches += wordMatches;
    });
    
    // Calculate score based on matches and language dictionary size
    results[langCode] = matches / lang.words.length;
  });
  
  // Find language with highest score
  let bestLang = 'unknown';
  let bestScore = 0;
  
  Object.keys(results).forEach(langCode => {
    if (results[langCode] > bestScore) {
      bestScore = results[langCode];
      bestLang = langCode;
    }
  });
  
  if (bestScore < 0.1) {
    return { code: 'unknown', name: 'Unknown', confidence: 0 };
  }
  
  return {
    code: bestLang,
    name: languagePatterns[bestLang]?.name || 'Unknown',
    confidence: Math.min(1, bestScore)
  };
};

/**
 * Extract job-related skills from text
 * @param {string} text Resume or job description text
 * @returns {Array} Extracted skills with categories
 */
const extractSkills = (text) => {
  if (!text) return [];
  
  // Common skill categories and related keywords
  const skillCategories = {
    technical: [
      'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift',
      'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
      'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'devops',
      'sql', 'mysql', 'postgresql', 'mongodb', 'database', 'nosql',
      'git', 'jenkins', 'ci/cd', 'agile', 'scrum', 'jira', 'confluence',
      'html', 'css', 'sass', 'less', 'bootstrap', 'material-ui',
      'rest', 'graphql', 'api', 'microservices', 'architecture',
      'linux', 'unix', 'windows', 'macos', 'android', 'ios', 'mobile',
      'testing', 'junit', 'selenium', 'cypress', 'jest', 'mocha'
    ],
    soft: [
      'communication', 'teamwork', 'leadership', 'problem-solving',
      'critical thinking', 'creativity', 'time management', 'adaptability',
      'collaboration', 'presentation', 'negotiation', 'persuasion',
      'conflict resolution', 'decision making', 'mentoring', 'coaching',
      'emotional intelligence', 'accountability', 'reliability', 'flexibility',
      'initiative', 'attention to detail', 'organization', 'planning',
      'patience', 'empathy', 'networking', 'customer service'
    ],
    management: [
      'project management', 'team management', 'resource management',
      'budget', 'forecasting', 'strategy', 'stakeholder', 'delegation',
      'risk management', 'change management', 'process improvement',
      'performance management', 'reporting', 'analytics', 'metrics',
      'kpis', 'operation', 'scaling', 'growth', 'objective',
      'product management', 'program management', 'portfolio management',
      'scrum master', 'agile coach', 'sprint planning', 'retrospective'
    ],
    industry: [
      'marketing', 'sales', 'finance', 'accounting', 'hr', 'recruiting',
      'healthcare', 'medical', 'pharmaceutical', 'legal', 'compliance',
      'automotive', 'manufacturing', 'retail', 'e-commerce', 'logistics',
      'supply chain', 'education', 'research', 'data science', 'machine learning',
      'artificial intelligence', 'blockchain', 'iot', 'cybersecurity',
      'networking', 'telecommunications', 'media', 'entertainment', 'gaming',
      'hospitality', 'tourism', 'real estate', 'construction', 'architecture'
    ]
  };
  
  // Flatten skill lists with categories
  const skillsMap = {};
  
  Object.keys(skillCategories).forEach(category => {
    skillCategories[category].forEach(skill => {
      skillsMap[skill] = category;
    });
  });
  
  // Extract skills from text
  const extractedSkills = [];
  const processedSkills = new Set();
  
  Object.keys(skillsMap).forEach(skill => {
    // Create regex pattern for skill
    // Handle multi-word skills and variants with hyphens
    const pattern = new RegExp(
      `\\b${skill.replace(/[-\/]/g, '[-/]?')}(?:ing|ed|er|s)?\\b`,
      'gi'
    );
    
    // Find matches
    const matches = text.match(pattern);
    
    if (matches && matches.length > 0) {
      // Only add if not already processed
      if (!processedSkills.has(skill)) {
        extractedSkills.push({
          skill: skill,
          category: skillsMap[skill],
          frequency: matches.length,
          variations: [...new Set(matches)].map(m => m.toLowerCase())
        });
        
        processedSkills.add(skill);
      }
    }
  });
  
  // Sort by frequency
  return extractedSkills.sort((a, b) => b.frequency - a.frequency);
};

/**
 * Check text for common resume/CV mistakes
 * @param {string} text Resume text
 * @returns {Array} Resume issues with recommendations
 */
const checkResumeIssues = (text) => {
  if (!text) return [];
  
  const issues = [];
  
  // Check for first-person pronouns
  const firstPersonPattern = /\b(I|me|my|myself|mine)\b/gi;
  const firstPersonMatches = [...text.matchAll(firstPersonPattern)];
  if (firstPersonMatches.length > 0) {
    issues.push({
      type: 'first_person',
      severity: 'warning',
      message: 'Avoid using first-person pronouns in your resume',
      matches: firstPersonMatches.map(match => ({
        text: match[0],
        index: match.index,
      })),
    });
  }
  
  // Check for weak action verbs
  const weakVerbs = ['worked', 'handled', 'did', 'tried', 'helped', 'made', 'got', 'used'];
  const strongerAlternatives = {
    'worked': ['implemented', 'developed', 'executed', 'established'],
    'handled': ['managed', 'coordinated', 'directed', 'administered'],
    'did': ['accomplished', 'completed', 'performed', 'achieved'],
    'tried': ['tested', 'evaluated', 'assessed', 'examined'],
    'helped': ['assisted', 'supported', 'facilitated', 'contributed'],
    'made': ['created', 'produced', 'constructed', 'built'],
    'got': ['obtained', 'acquired', 'secured', 'gained'],
    'used': ['utilized', 'employed', 'applied', 'operated']
  };
  
  weakVerbs.forEach(verb => {
    const pattern = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      issues.push({
        type: 'weak_verb',
        severity: 'suggestion',
        message: `Consider replacing "${verb}" with stronger alternatives like: ${strongerAlternatives[verb].join(', ')}`,
        matches: matches.map(match => ({
          text: match[0],
          index: match.index,
        })),
      });
    }
  });
  
  // Check for clichés and buzzwords
  const cliches = [
    'team player', 'detail-oriented', 'hardworking', 'go-getter', 'think outside the box', 
    'results-driven', 'self-motivated', 'proactive', 'synergy', 'go above and beyond'
  ];
  
  cliches.forEach(cliche => {
    const pattern = new RegExp(`\\b${cliche.replace(/-/g, '[-]?')}\\b`, 'gi');
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      issues.push({
        type: 'cliche',
        severity: 'suggestion',
        message: `Replace the cliché "${cliche}" with specific achievements or metrics`,
        matches: matches.map(match => ({
          text: match[0],
          index: match.index,
        })),
      });
    }
  });
  
  // Check for missing metrics/numbers
  const accomplishmentIndicators = [
    'increased', 'decreased', 'improved', 'reduced', 'grew', 'saved',
    'generated', 'delivered', 'achieved', 'won', 'earned'
  ];
  
  let hasMetrics = false;
  const numberPattern = /\b\d+%?\b|\b\$\d+\b/g;
  if (text.match(numberPattern)) {
    hasMetrics = true;
  }
  
  if (!hasMetrics) {
    const accomplishmentVerbs = [];
    accomplishmentIndicators.forEach(verb => {
      const pattern = new RegExp(`\\b${verb}\\b`, 'gi');
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        matches.forEach(match => {
          // Check if a number appears within the next 10 words
          const followingText = text.substring(match.index, match.index + 100);
          const hasNumber = /\b\d+%?\b|\b\$\d+\b/g.test(followingText);
          
          if (!hasNumber) {
            accomplishmentVerbs.push(match[0]);
          }
        });
      }
    });
    
    if (accomplishmentVerbs.length > 0) {
      issues.push({
        type: 'missing_metrics',
        severity: 'suggestion',
        message: `Add specific metrics or numbers to quantify your achievements with verbs like: ${accomplishmentVerbs.join(', ')}`,
        verbs: accomplishmentVerbs
      });
    }
  }
  
  return issues;
};

export default {
  extractKeywords,
  calculateReadability,
  checkTextIssues,
  analyzeSentiment,
  summarizeText,
  calculateTextSimilarity,
  extractKeyPhrases,
  detectLanguage,
  extractSkills,
  checkResumeIssues
}; 