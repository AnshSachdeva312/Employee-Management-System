// Normalize date (remove time component)
exports.normalizeDate = (date) => {
  try {
    // Handle multiple input types:
    // - Date object
    // - ISO date string
    // - Timestamp number
    let normalized;
    
    if (date instanceof Date) {
      normalized = new Date(date);
    } else if (typeof date === 'string' || typeof date === 'number') {
      normalized = new Date(date);
    } else {
      throw new Error('Input must be a Date object, date string, or timestamp');
    }

    // Check if the date is valid
    if (isNaN(normalized.getTime())) {
      throw new Error('Invalid date value');
    }
    
    normalized.setHours(0, 0, 0, 0);
    console.log('Normalized date result:', normalized.toISOString());
    return normalized;
  } catch (error) {
    console.error('Date normalization failed:', error);
    throw new Error(`Date normalization error: ${error.message}`);
  }
};
  
  // Get all dates between start and end (inclusive)
  exports.getDatesBetween = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const normalizedEndDate = new Date(endDate);
    
    while (currentDate <= normalizedEndDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  // Calculate working hours between two dates
  exports.calculateWorkingHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0;
    const diffInMs = new Date(clockOut) - new Date(clockIn);
    return parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2));
  };