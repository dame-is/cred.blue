// server/utils/userUtils.js
async function fetchPublicUserData(handle) {
    try {
      // Use the Bluesky API to fetch public user data
      const response = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await response.json();
      
      return {
        handle: userData.handle,
        displayName: userData.displayName,
        avatar: userData.avatar,
        description: userData.description
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Return basic data if API call fails
      return {
        handle: handle,
        displayName: handle,
        avatar: null,
        description: ''
      };
    }
  }
  
  module.exports = { fetchPublicUserData };