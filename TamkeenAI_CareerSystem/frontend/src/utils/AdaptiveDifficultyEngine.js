/**
 * AdaptiveDifficultyEngine
 * 
 * A utility class that handles adaptive difficulty adjustment for skills assessments.
 * It tracks user performance, emotional state, and adjusts question difficulty accordingly.
 */

class AdaptiveDifficultyEngine {
  constructor(options = {}) {
    // Configuration options with defaults
    this.config = {
      initialDifficulty: options.initialDifficulty || 'medium',
      adaptationSpeed: options.adaptationSpeed || 'normal', // 'slow', 'normal', 'fast'
      emotionAware: options.emotionAware !== undefined ? options.emotionAware : true,
      minDifficulty: options.minDifficulty || 'easy',
      maxDifficulty: options.maxDifficulty || 'hard',
      performanceWindow: options.performanceWindow || 3, // Number of questions to consider for adaptation
      ...options
    };
    
    // Difficulty levels and their numerical representations
    this.difficultyLevels = {
      easy: 1,
      medium: 2,
      hard: 3
    };
    
    // Internal state
    this.currentDifficulty = this.config.initialDifficulty;
    this.currentDifficultyScore = this.difficultyLevels[this.currentDifficulty];
    this.performanceHistory = [];
    this.emotionalState = 'neutral';
    this.adjustmentsHistory = [];
  }
  
  /**
   * Record a user's performance on a question
   * @param {string} questionId - Unique identifier for the question
   * @param {boolean} isCorrect - Whether the user answered correctly
   * @param {number} timeSpent - Time spent on the question in seconds
   * @return {Object} The updated difficulty state
   */
  recordPerformance(questionId, isCorrect, timeSpent = null) {
    // Add to performance history
    this.performanceHistory.push({
      questionId,
      isCorrect,
      timeSpent,
      difficulty: this.currentDifficulty,
      timestamp: new Date()
    });
    
    // Limit history to the configured window size
    if (this.performanceHistory.length > this.config.performanceWindow) {
      this.performanceHistory.shift();
    }
    
    // Calculate performance metrics
    const metrics = this._calculatePerformanceMetrics();
    
    // Adjust difficulty based on performance
    this._adjustDifficulty(metrics);
    
    // Return the current state
    return {
      currentDifficulty: this.currentDifficulty,
      performanceMetrics: metrics,
      adjustmentsMade: this.adjustmentsHistory.length
    };
  }
  
  /**
   * Update the user's emotional state
   * @param {string} emotion - The detected emotion (e.g., 'neutral', 'stressed', 'happy')
   * @return {Object} The updated difficulty state if emotion-aware mode is enabled
   */
  updateEmotionalState(emotion) {
    // Update internal state
    this.emotionalState = emotion;
    
    // If emotion-aware mode is enabled, adjust difficulty based on emotion
    if (this.config.emotionAware) {
      this._adjustDifficultyByEmotion(emotion);
      
      return {
        currentDifficulty: this.currentDifficulty,
        emotionalState: this.emotionalState
      };
    }
    
    return null;
  }
  
  /**
   * Get the current difficulty level
   * @return {string} The current difficulty level
   */
  getCurrentDifficulty() {
    return this.currentDifficulty;
  }
  
  /**
   * Get full performance history
   * @return {Array} The performance history
   */
  getPerformanceHistory() {
    return [...this.performanceHistory];
  }
  
  /**
   * Get difficulty adjustment history
   * @return {Array} The adjustment history
   */
  getAdjustmentsHistory() {
    return [...this.adjustmentsHistory];
  }
  
  /**
   * Reset the engine to initial state
   * @param {string} initialDifficulty - Optional new initial difficulty
   */
  reset(initialDifficulty = null) {
    this.currentDifficulty = initialDifficulty || this.config.initialDifficulty;
    this.currentDifficultyScore = this.difficultyLevels[this.currentDifficulty];
    this.performanceHistory = [];
    this.emotionalState = 'neutral';
    this.adjustmentsHistory = [];
  }
  
  /**
   * Calculate performance metrics based on recent history
   * @private
   * @return {Object} Performance metrics
   */
  _calculatePerformanceMetrics() {
    // Get recent history within the performance window
    const recentHistory = this.performanceHistory.slice(-this.config.performanceWindow);
    
    // Calculate success rate
    const correctCount = recentHistory.filter(entry => entry.isCorrect).length;
    const successRate = recentHistory.length > 0 ? correctCount / recentHistory.length : 0;
    
    // Calculate average time spent (if available)
    const timeEntries = recentHistory.filter(entry => entry.timeSpent !== null);
    const avgTimeSpent = timeEntries.length > 0 
      ? timeEntries.reduce((sum, entry) => sum + entry.timeSpent, 0) / timeEntries.length
      : null;
    
    // Calculate consistency (standard deviation of success)
    const consistency = this._calculateConsistency(recentHistory);
    
    return {
      successRate,
      avgTimeSpent,
      consistency,
      sampleSize: recentHistory.length
    };
  }
  
  /**
   * Calculate consistency in user performance
   * @private
   * @param {Array} history - Performance history entries
   * @return {number} Consistency score (0-1, higher is more consistent)
   */
  _calculateConsistency(history) {
    if (history.length < 2) return 1; // Not enough data
    
    // Convert boolean correctness to 1s and 0s
    const values = history.map(entry => entry.isCorrect ? 1 : 0);
    
    // Calculate average
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate sum of squared differences
    const sumSqDiff = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0);
    
    // Calculate standard deviation
    const stdDev = Math.sqrt(sumSqDiff / values.length);
    
    // Convert to a 0-1 scale where 1 is perfectly consistent
    return 1 - Math.min(1, stdDev * 2);
  }
  
  /**
   * Adjust difficulty based on performance metrics
   * @private
   * @param {Object} metrics - Performance metrics
   */
  _adjustDifficulty(metrics) {
    // Only adjust if we have enough data
    if (metrics.sampleSize < this.config.performanceWindow) return;
    
    // Base adjustment threshold on adaptation speed
    const thresholds = {
      slow: { increase: 0.9, decrease: 0.4 },
      normal: { increase: 0.8, decrease: 0.5 },
      fast: { increase: 0.7, decrease: 0.6 }
    };
    
    const threshold = thresholds[this.config.adaptationSpeed];
    
    // Determine if adjustment is needed
    let newDifficulty = this.currentDifficulty;
    
    if (metrics.successRate >= threshold.increase && metrics.consistency >= 0.7) {
      // User is performing well and consistently - increase difficulty
      newDifficulty = this._increaseDifficulty();
    } else if (metrics.successRate <= threshold.decrease || metrics.consistency <= 0.3) {
      // User is struggling or highly inconsistent - decrease difficulty
      newDifficulty = this._decreaseDifficulty();
    }
    
    // Record adjustment if difficulty changed
    if (newDifficulty !== this.currentDifficulty) {
      this.adjustmentsHistory.push({
        from: this.currentDifficulty,
        to: newDifficulty,
        reason: 'performance',
        metrics,
        timestamp: new Date()
      });
      
      this.currentDifficulty = newDifficulty;
      this.currentDifficultyScore = this.difficultyLevels[newDifficulty];
    }
  }
  
  /**
   * Adjust difficulty based on emotional state
   * @private
   * @param {string} emotion - Detected emotion
   */
  _adjustDifficultyByEmotion(emotion) {
    // Define emotions that should trigger difficulty adjustment
    const stressfulEmotions = ['stressed', 'anxious', 'angry'];
    const positiveEmotions = ['happy', 'calm'];
    
    let newDifficulty = this.currentDifficulty;
    
    // Adjust difficulty based on emotion
    if (stressfulEmotions.includes(emotion) && this.currentDifficulty !== 'easy') {
      // User is stressed - decrease difficulty to reduce stress
      newDifficulty = this._decreaseDifficulty();
    } else if (positiveEmotions.includes(emotion) && 
        this.currentDifficulty === 'easy' && 
        this.performanceHistory.length >= 2) {
      
      // User is in a positive emotional state and current difficulty is easy
      // Check if they're also performing well to increase difficulty
      const recentEntries = this.performanceHistory.slice(-2);
      const recentSuccess = recentEntries.filter(entry => entry.isCorrect).length / recentEntries.length;
      
      if (recentSuccess >= 0.5) {
        newDifficulty = this._increaseDifficulty();
      }
    }
    
    // Record adjustment if difficulty changed
    if (newDifficulty !== this.currentDifficulty) {
      this.adjustmentsHistory.push({
        from: this.currentDifficulty,
        to: newDifficulty,
        reason: 'emotion',
        emotion,
        timestamp: new Date()
      });
      
      this.currentDifficulty = newDifficulty;
      this.currentDifficultyScore = this.difficultyLevels[newDifficulty];
    }
  }
  
  /**
   * Increase difficulty by one level if possible
   * @private
   * @return {string} The new difficulty level
   */
  _increaseDifficulty() {
    const difficultyKeys = Object.keys(this.difficultyLevels);
    const currentIndex = difficultyKeys.indexOf(this.currentDifficulty);
    
    // If already at max difficulty, return current
    if (currentIndex >= difficultyKeys.length - 1) {
      return this.currentDifficulty;
    }
    
    // Get next difficulty level
    const newDifficulty = difficultyKeys[currentIndex + 1];
    
    // Check if we've reached the configured maximum
    if (this.difficultyLevels[newDifficulty] > this.difficultyLevels[this.config.maxDifficulty]) {
      return this.currentDifficulty;
    }
    
    return newDifficulty;
  }
  
  /**
   * Decrease difficulty by one level if possible
   * @private
   * @return {string} The new difficulty level
   */
  _decreaseDifficulty() {
    const difficultyKeys = Object.keys(this.difficultyLevels);
    const currentIndex = difficultyKeys.indexOf(this.currentDifficulty);
    
    // If already at min difficulty, return current
    if (currentIndex <= 0) {
      return this.currentDifficulty;
    }
    
    // Get previous difficulty level
    const newDifficulty = difficultyKeys[currentIndex - 1];
    
    // Check if we've reached the configured minimum
    if (this.difficultyLevels[newDifficulty] < this.difficultyLevels[this.config.minDifficulty]) {
      return this.currentDifficulty;
    }
    
    return newDifficulty;
  }
}

export default AdaptiveDifficultyEngine; 