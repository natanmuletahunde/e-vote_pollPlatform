/**
 * Serializes a MongoDB poll document to a plain JavaScript object
 * @param {Object} poll - The MongoDB poll document
 * @returns {Object} - A plain JavaScript object with all MongoDB-specific types converted
 */
export const serializePoll = (poll) => {
    // Handle null/undefined poll
    if (!poll) return null;
  
    return {
      ...poll,
      // Convert MongoDB ObjectId to string
      _id: poll._id?.toString() || null,
      // Serialize creator field if it exists
      creator: poll.creator ? {
        ...poll.creator,
        _id: poll.creator._id?.toString() || null
      } : null,
      // Serialize each option
      options: poll.options?.map(option => ({
        ...option,
        _id: option._id?.toString() || null
      })) || [],
      // Convert dates to ISO strings
      createdAt: poll.createdAt?.toISOString() || null,
      updatedAt: poll.updatedAt?.toISOString() || null,
      closesAt: poll.closesAt?.toISOString() || null
    };
  };
  
  /**
   * Serializes an array of polls
   * @param {Array} polls - Array of MongoDB poll documents
   * @returns {Array} - Array of serialized poll objects
   */
  export const serializePollArray = (polls) => {
    return polls?.map(poll => serializePoll(poll)) || [];
  };