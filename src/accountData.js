/***********************************************************************
 * New functions to resolve handle and service endpoint
 ***********************************************************************/

// Resolve a handle (e.g., "dame.bsky.social") into a DID using the atproto resolveHandle endpoint.
async function resolveHandleToDid(inputHandle) {
    const url = `${publicServiceEndpoint}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(inputHandle)}`;
    const data = await getJSON(url);
    if (!data.did) {
      throw new Error("Could not resolve handle to DID.");
    }
    return data.did;
  }
  
  // Get the service endpoint for the DID by querying the PLC directory.
  async function getServiceEndpointForDid(resolvedDid) {
    const url = `${plcDirectoryEndpoint}/${encodeURIComponent(resolvedDid)}`;
    const data = await getJSON(url);
    if (!data.service || !Array.isArray(data.service)) {
      throw new Error("Could not determine service endpoint for DID.");
    }
    // Look for the service entry with type "AtprotoPersonalDataServer"
    const svcEntry = data.service.find(svc => svc.type === "AtprotoPersonalDataServer");
    if (!svcEntry || !svcEntry.serviceEndpoint) {
      throw new Error("Could not determine service endpoint for DID.");
    }
    return svcEntry.serviceEndpoint;
  }
  
  /***********************************************************************
   * Global settings and basic caching
   ***********************************************************************/
  let did = null;            // Will be resolved from the handle.
  let handle = null;         // Will be set by the caller (from the URL/searchbar).
  let serviceEndpoint = null; // Will be derived from the PLC Directory.
  const plcDirectoryEndpoint = "https://plc.directory";
  const publicServiceEndpoint = "https://public.api.bsky.app";
  
  // Basic in-memory cache to avoid duplicate API calls.
  const cache = {};
  
  /***********************************************************************
   * Helper Functions
   ***********************************************************************/
  async function getJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} error for ${url}`);
      }
      return await response.json();
    } catch (err) {
      console.error("Error in getJSON for", url, err);
      throw err;
    }
  }
  
  async function cachedGetJSON(url) {
    if (cache[url]) return cache[url];
    const data = await getJSON(url);
    cache[url] = data;
    return data;
  }
  
  /***********************************************************************
   * Endpoint calls with pagination and caching
   ***********************************************************************/
  
  // 1. Fetch Profile data (one-shot)
  async function fetchProfile() {
    const url = `${publicServiceEndpoint}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`;
    return await cachedGetJSON(url);
  }
  
  // 2. Fetch all blobs (paginated)
  // expectedPages default is 2 (adjust as needed)
  // The onPage callback receives an increment – here each page adds (weight / expectedPages)
  async function fetchAllBlobsCount(onPage = (inc) => {}, expectedPages = 2) {
    let urlBase = `${serviceEndpoint}/xrpc/com.atproto.sync.listBlobs?did=${encodeURIComponent(did)}&limit=1000`;
    let count = 0, cursor = null;
    do {
      const url = urlBase + (cursor ? `&cursor=${cursor}` : "");
      const data = await cachedGetJSON(url);
      count += Array.isArray(data.cids) ? data.cids.length : 0;
      onPage(1 / expectedPages);
      cursor = data.cursor || null;
    } while (cursor);
    return count;
  }
  
  // 3. Fetch repo description (one-shot)
  async function fetchRepoDescription() {
    const url = `${serviceEndpoint}/xrpc/com.atproto.repo.describeRepo?repo=${encodeURIComponent(did)}`;
    return await cachedGetJSON(url);
  }
  
  // 4. Fetch records from a collection (paginated)
  // expectedPages default is 50 (adjust based on typical page count)
  async function fetchRecordsForCollection(collectionName, onPage = (inc) => {}, expectedPages = 50) {
    let urlBase = `${serviceEndpoint}/xrpc/com.atproto.repo.listRecords?repo=${encodeURIComponent(did)}&collection=${encodeURIComponent(collectionName)}&limit=100`;
    let records = [];
    let cursor = null;
    do {
      const url = urlBase + (cursor ? `&cursor=${cursor}` : "");
      const data = await cachedGetJSON(url);
      if (Array.isArray(data.records)) {
        records = records.concat(data.records);
      }
      onPage(1 / expectedPages);
      cursor = data.cursor || null;
    } while (cursor);
    return records;
  }
  
  // 5. Fetch audit log from PLC Directory (one-shot)
  async function fetchAuditLog() {
    const url = `${plcDirectoryEndpoint}/${encodeURIComponent(did)}/log/audit`;
    return await cachedGetJSON(url);
  }
  
  // 6. Fetch author feed (paginated)
  // expectedPages default is 10 (adjust as needed)
  async function fetchAuthorFeed(onPage = (inc) => {}, expectedPages = 10) {
    let urlBase = `${publicServiceEndpoint}/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(did)}&limit=100`;
    let feed = [];
    let cursor = null;
    do {
      const url = urlBase + (cursor ? `&cursor=${cursor}` : "");
      const data = await cachedGetJSON(url);
      if (Array.isArray(data.feed)) {
        feed = feed.concat(data.feed);
      }
      onPage(1 / expectedPages);
      cursor = data.cursor || null;
    } while (cursor);
    return feed;
  }
  
  /***********************************************************************
   * Calculation Functions
   ***********************************************************************/
  function roundToTwo(num) {
    return Number(num.toFixed(2));
  }
  
  function roundNumbers(obj) {
    if (Array.isArray(obj)) {
      return obj.map(roundNumbers);
    } else if (typeof obj === "object" && obj !== null) {
      const newObj = {};
      for (let key in obj) {
        newObj[key] = roundNumbers(obj[key]);
      }
      return newObj;
    } else if (typeof obj === "number") {
      return roundToTwo(obj);
    } else {
      return obj;
    }
  }
  
  function calculateAge(createdAt) {
    const created = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - created);
    const ageInDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const refDate = new Date("2022-11-17T00:35:16.391Z");
    const daysSinceRef = Math.floor(Math.abs(today - refDate) / (1000 * 60 * 60 * 24));
    const agePercentage = daysSinceRef > 0 ? ageInDays / daysSinceRef : 0;
    return { ageInDays, agePercentage };
  }
  
  function getReplyAuthors(reply) {
    const authors = [];
    if (reply.parent && reply.parent.author) {
      authors.push(reply.parent.author);
    }
    if (reply.root && reply.root.author) {
      authors.push(reply.root.author);
    }
    if (reply.grandparent && reply.grandparent.author) {
      authors.push(reply.grandparent.author);
    }
    return authors;
  }
  
  function calculatePostingStyle(stats) {
    const {
      onlyPostsPerDay = 0,
      replyOtherPercentage = 0,
      textPercentage = 0,
      imagePercentage = 0,
      videoPercentage = 0,
      linkPercentage = 0,
      altTextPercentage = 0,
      postsPerDay = 0,
    } = stats;
    if (postsPerDay < 0.1 && stats.totalBskyRecordsPerDay > 0.3) {
      return "Lurker";
    }
    if (onlyPostsPerDay > 0.8 && replyOtherPercentage >= 0.3) {
      if (textPercentage > linkPercentage && textPercentage > imagePercentage && textPercentage > videoPercentage) {
        return "Engaged Text Poster";
      }
      if (imagePercentage > linkPercentage && imagePercentage > textPercentage && imagePercentage > videoPercentage) {
        return altTextPercentage <= 0.3 ? "Engaged Image Poster who's bad at alt text" : "Engaged Image Poster";
      }
      if (linkPercentage > imagePercentage && linkPercentage > textPercentage && linkPercentage > videoPercentage) {
        return "Engaged Link Poster";
      }
      if (videoPercentage > imagePercentage && videoPercentage > textPercentage && videoPercentage > linkPercentage) {
        return "Engaged Video Poster";
      }
      return "Engaged Poster";
    } else if (onlyPostsPerDay > 0.8 && replyOtherPercentage < 0.3) {
      if (textPercentage > linkPercentage && textPercentage > imagePercentage && textPercentage > videoPercentage) {
        return "Unengaged Text Poster";
      }
      if (imagePercentage > linkPercentage && imagePercentage > textPercentage && imagePercentage > videoPercentage) {
        return altTextPercentage <= 0.3 ? "Unengaged Image Poster who's bad at alt text" : "Unengaged Image Poster";
      }
      if (linkPercentage > imagePercentage && linkPercentage > textPercentage && linkPercentage > videoPercentage) {
        return "Unengaged Link Poster";
      }
      if (videoPercentage > imagePercentage && videoPercentage > textPercentage && videoPercentage > linkPercentage) {
        return "Unengaged Video Poster";
      }
      return "Unengaged Poster";
    }
    if (replyOtherPercentage >= 0.5) return "Reply Guy";
    if (stats.quoteOtherPercentage >= 0.5) return "Quote Guy";
    if (stats.repostOtherPercentage >= 0.5) return "Repost Guy";
    return "Unknown";
  }
  
  function calculateSocialStatus({ ageInDays, followersCount, followsCount }) {
    const followPercentage = followersCount > 0 ? followsCount / followersCount : 0;
    if (ageInDays < 30) return "Newbie";
    if (followPercentage < 0.5) {
      if (followersCount >= 500 && followersCount < 10000) return "Micro Influencer";
      if (followersCount >= 10000 && followersCount < 100000) return "Influencer";
      if (followersCount >= 100000) return "Celebrity";
    }
    return "Community Member";
  }
  
  function calculateActivityStatus(rate) {
    if (rate === 0) return "inactive";
    if (rate > 0 && rate < 1) return "eepy";
    if (rate >= 1 && rate < 10) return "awake";
    if (rate >= 10) return "wired";
  }
  
  function calculateProfileCompletion(profile) {
    const hasDisplayName = Boolean(profile.displayName && profile.displayName.trim());
    const hasBanner = Boolean(profile.banner && profile.banner.trim());
    const hasDescription = Boolean(profile.description && profile.description.trim());
    if (hasDisplayName && hasBanner && hasDescription) return "complete";
    if (hasDisplayName || hasBanner || hasDescription) return "incomplete";
    return "not started";
  }
  
  function calculateDomainRarity(handle) {
    if (handle.includes("bsky.social")) {
      const len = handle.length;
      if (len >= 21) return "very common";
      if (len >= 18 && len <= 20) return "common";
      if (len === 17) return "uncommon";
      if (len === 16) return "rare";
      if (len === 15) return "very rare";
      if (len <= 14) return "extremely rare";
    } else {
      const standardTLDs = [".com", ".org", ".net"];
      const hasStandardTLD = standardTLDs.some((tld) => handle.endsWith(tld));
      let len;
      if (hasStandardTLD) {
        const parts = handle.split(".");
        const domain = parts.slice(1).join(".");
        len = domain.length;
        if (len >= 15) return "very common";
        if (len >= 12 && len <= 14) return "common";
        if (len >= 9 && len <= 11) return "uncommon";
        if (len >= 7 && len <= 8) return "rare";
        if (len === 6) return "very rare";
        if (len <= 5) return "extremely rare";
      } else {
        len = handle.length;
        if (len >= 14) return "very common";
        if (len >= 11 && len <= 13) return "common";
        if (len >= 8 && len <= 10) return "uncommon";
        if (len >= 6 && len <= 7) return "rare";
        if (len === 5) return "very rare";
        if (len <= 4) return "extremely rare";
      }
    }
    return "unknown";
  }
  
  function calculateEra(createdAt) {
    const created = new Date(createdAt);
    if (created >= new Date("2022-11-16") && created <= new Date("2023-01-31")) {
      return "pre-history";
    } else if (created >= new Date("2023-02-01") && created <= new Date("2024-01-31")) {
      return "invite-only";
    } else if (created > new Date("2024-01-31")) {
      return "public-release";
    }
    return "unknown";
  }
  
  // Calculate aggregate records for the account by iterating over each collection.
  async function calculateRecordsAggregate(collectionNames, ageInDays) {
    let totalRecords = 0;
    let totalBskyRecords = 0;
    let totalNonBskyRecords = 0;
    const collectionStats = {};
    for (const col of collectionNames) {
      // We treat this as one step (no additional page weighting here).
      const recs = await fetchRecordsForCollection(col, () => {});
      const count = recs.length;
      const perDay = ageInDays ? count / ageInDays : 0;
      collectionStats[col] = {
        count: roundToTwo(count),
        perDay: roundToTwo(perDay),
      };
      totalRecords += count;
      if (col.indexOf("app.bsky") !== -1) {
        totalBskyRecords += count;
      } else {
        totalNonBskyRecords += count;
      }
    }
    return { totalRecords, totalBskyRecords, totalNonBskyRecords, collectionStats };
  }
  
  // Calculate aggregate records for a recent period (in days) by filtering records based on createdAt.
  async function calculateRecordsAggregateForPeriod(collectionNames, periodDays) {
    let totalRecords = 0;
    let totalBskyRecords = 0;
    let totalNonBskyRecords = 0;
    const collectionStats = {};
    const cutoffTime = Date.now() - periodDays * 24 * 60 * 60 * 1000;
    for (const col of collectionNames) {
      const recs = await fetchRecordsForCollection(col, () => {});
      const filtered = recs.filter((rec) => {
        const recordTime = new Date(rec.value.createdAt).getTime();
        return recordTime >= cutoffTime;
      });
      const count = filtered.length;
      const perDay = periodDays ? count / periodDays : 0;
      collectionStats[col] = {
        count: roundToTwo(count),
        perDay: roundToTwo(perDay),
      };
      totalRecords += count;
      if (col.indexOf("app.bsky") !== -1) {
        totalBskyRecords += count;
      } else {
        totalNonBskyRecords += count;
      }
    }
    return { totalRecords, totalBskyRecords, totalNonBskyRecords, collectionStats };
  }
  
  // Calculate engagements for the account using the author feed.
  async function calculateEngagements() {
    // Use the paginated author feed; expectedPages = 15.
    const feed = await fetchAuthorFeed(() => {}, 15);
    let likesReceived = 0;
    let repostsReceived = 0;
    let quotesReceived = 0;
    let repliesReceived = 0;
    for (const item of feed) {
      if (item && item.post) {
        if (JSON.stringify(item.post).includes("#reasonRepost")) continue;
        likesReceived += item.post.likeCount || 0;
        repostsReceived += item.post.repostCount || 0;
        quotesReceived += item.post.quoteCount || 0;
        repliesReceived += item.post.replyCount || 0;
      }
    }
    return {
      likesReceived: roundToTwo(likesReceived),
      repostsReceived: roundToTwo(repostsReceived),
      quotesReceived: roundToTwo(quotesReceived),
      repliesReceived: roundToTwo(repliesReceived),
    };
  }
  
  // Build the analysis narrative paragraphs.
  function buildAnalysisNarrative(accountData) {
    const { profile, activityAll, alsoKnownAs } = accountData;
    const { agePercentage } = calculateAge(profile.createdAt);
    let accountAgeStatement = "";
    if (agePercentage >= 0.97) {
      accountAgeStatement = "since the very beginning and is";
    } else if (agePercentage >= 0.7) {
      accountAgeStatement = "for a very long time and is";
    } else if (agePercentage >= 0.5) {
      accountAgeStatement = "for a long time and is";
    } else if (agePercentage >= 0.1) {
      accountAgeStatement = "for awhile and is";
    } else if (agePercentage >= 0.02) {
      accountAgeStatement = "for only a short period of time and is";
    } else {
      accountAgeStatement = "for barely any time at all";
    }
    const totalBskyCollections = activityAll.totalBskyCollections || 0;
    let blueskyFeatures = "";
    if (totalBskyCollections >= 12) {
      blueskyFeatures = "they are using all of Bluesky's core features";
    } else if (totalBskyCollections >= 8) {
      blueskyFeatures = "they are using most of Bluesky’s core features";
    } else if (totalBskyCollections >= 3) {
      blueskyFeatures = "they are using some of Bluesky’s core features";
    } else {
      blueskyFeatures = "they haven't used any of Bluesky's core features yet";
    }
    const totalNonBskyCollections = activityAll.totalNonBskyCollections || 0;
    const totalNonBskyRecords = activityAll.totalNonBskyRecords || 0;
    let atprotoEngagement = "";
    if (totalNonBskyCollections >= 10 && totalNonBskyRecords > 100) {
      atprotoEngagement = "is extremely engaged, having used many different services or tools";
    } else if (totalNonBskyCollections >= 5 && totalNonBskyRecords > 50) {
      atprotoEngagement = "is very engaged, having used many different services or tools";
    } else if (totalNonBskyCollections > 0 && totalNonBskyRecords > 5) {
      atprotoEngagement = "has dipped their toes in the water, but has yet to go deeper";
    } else {
      atprotoEngagement = "has not yet explored what's out there";
    }
    let domainHistoryStatement = "";
    if (alsoKnownAs.totalCustomAkas > 0 && profile.handle.includes("bsky.social")) {
      domainHistoryStatement = "They've used a custom domain name at some point but are currently using a default Bluesky handle";
    } else if (!profile.handle.includes("bsky.social")) {
      domainHistoryStatement = "They currently are using a custom domain";
    } else if (alsoKnownAs.totalAkas > 2 && !profile.handle.includes("bsky.social")) {
      domainHistoryStatement = "They have a custom domain set and have a history of using different aliases";
    } else {
      domainHistoryStatement = "They still have a default Bluesky handle";
    }
    let rotationKeyStatement = accountData.rotationKeys === 2 
      ? "They don't have their own rotation key set" 
      : "They have their own rotation key set";
    let pdsHostStatement = serviceEndpoint.includes("bsky.network")
      ? "their PDS is hosted by a Bluesky mushroom"
      : "their PDS is hosted by either a third-party or themselves";
    
    const narrative1 =
      `${profile.displayName} has been on the network ${accountAgeStatement} ${calculateActivityStatus(activityAll.totalRecordsPerDay)}. ` +
      `Their profile is ${calculateProfileCompletion(profile)}, and ${blueskyFeatures}. ` +
      `When it comes to the broader AT Proto ecosystem, this identity ${atprotoEngagement}. ` +
      `${domainHistoryStatement} which is ${calculateDomainRarity(profile.handle)}. ` +
      `${rotationKeyStatement}, and ${pdsHostStatement}.`;
    
    const era = calculateEra(profile.createdAt);
    const postingStyle = accountData.postingStyle;
    const socialStatus = accountData.socialStatus;
    const mediaType = "a mix of text, images, and video";
    const followRatio = profile.followersCount > 0 ? roundToTwo(profile.followsCount / profile.followersCount) : 0;
    const narrative2 =
      `${profile.displayName} first joined Bluesky during the ${era} era. ` +
      `Their style of posting is "${postingStyle}". ` +
      `Their posts consist of ${mediaType}. ` +
      `They are ${socialStatus} as is indicated by their follower count of ${profile.followersCount} and their follower/following ratio of ${followRatio}.`;
    
    return narrative1 + "\n\n" + narrative2;
  }
  
  /***********************************************************************
   * Main Function – Build accountData and final JSON object.
   ***********************************************************************/
  export async function loadAccountData(inputHandle, onProgress = () => {}) {
    try {
      // First, set the handle from input and resolve to DID and service endpoint.
      if (!inputHandle) throw new Error("Handle is not provided");
      handle = inputHandle;
      did = await resolveHandleToDid(handle);
      serviceEndpoint = await getServiceEndpointForDid(did);
      
      // Define weights for each phase (the sum should equal 1.0)
      const progressWeights = {
        resolve: 0.05,         // resolving handle to DID and serviceEndpoint
        fetchProfile: 0.05,
        calculateAge: 0.05,
        blobs: 0.10,
        repoDesc: 0.05,
        targetCollections: 0.05,
        aggregateRecords: 0.05,
        listRecords: 0.30,     // detailed post statistics (listRecords calls)
        auditLog: 0.05,
        overallStatus: 0.05,   // posting style, social status, and narrative
        aggregates30: 0.05,
        final: 0.05
      };
      
      // currentProgress is a fraction (0 to 1)
      let currentProgress = 0;
      const updateProgress = (increment = 1) => {
        currentProgress += increment;
        if (currentProgress > 1) currentProgress = 1;
        onProgress(currentProgress * 100);
      };
      
      // 1. Resolve handle phase.
      updateProgress(progressWeights.resolve);
      
      // 2. Fetch profile (one-shot)
      const profile = await fetchProfile();
      updateProgress(progressWeights.fetchProfile);
      
      // 3. Calculate age (one-shot)
      const { ageInDays, agePercentage } = calculateAge(profile.createdAt);
      updateProgress(progressWeights.calculateAge);
      
      // 4. Fetch blobs (paginated)
      // Expected pages: 10
      const blobsCount = await fetchAllBlobsCount(
        (inc) => { updateProgress(inc * progressWeights.blobs); },
        10
      );
      // (The entire blobs phase contributes progressWeights.blobs)
      updateProgress(0); // Just ensuring phase complete if needed.
      
      // 5. Repo description (one-shot)
      const repoDescription = await fetchRepoDescription();
      let collections = repoDescription.collections || [];
      const totalCollections = collections.length;
      const bskyCollectionNames = collections.filter((col) => col.indexOf("app.bsky") !== -1);
      const totalBskyCollections = bskyCollectionNames.length;
      const totalNonBskyCollections = totalCollections - totalBskyCollections;
      updateProgress(progressWeights.repoDesc);
      
      // 6. Build targetCollections array (one-shot)
      const targetCollections = [...new Set(collections)];
      updateProgress(progressWeights.targetCollections);
      
      // 7. Aggregate record counts (one-shot)
      const { totalRecords, totalBskyRecords, totalNonBskyRecords, collectionStats } =
        await calculateRecordsAggregate(targetCollections, ageInDays);
      const totalRecordsPerDay = ageInDays ? totalRecords / ageInDays : 0;
      const totalBskyRecordsPerDay = ageInDays ? totalBskyRecords / ageInDays : 0;
      const totalNonBskyRecordsPerDay = ageInDays ? totalNonBskyRecords / ageInDays : 0;
      const totalBskyRecordsPercentage = totalRecords ? totalBskyRecords / totalRecords : 0;
      const totalNonBskyRecordsPercentage = totalRecords ? totalNonBskyRecords / totalRecords : 0;
      updateProgress(progressWeights.aggregateRecords);
      
      // 8. Detailed post statistics (paginated listRecords for "app.bsky.feed.post")
      // Expected pages: 20
      const postsRecords = await fetchRecordsForCollection(
        "app.bsky.feed.post",
        (inc) => { updateProgress(inc * progressWeights.listRecords); },
        20
      );
      const postsCount = profile.postsCount || postsRecords.length;
      function filterRecords(records, testFunc) {
        return records.filter(testFunc).length;
      }
      const onlyPosts = filterRecords(postsRecords, (rec) => !rec.value.hasOwnProperty("reply"));
      const onlyReplies = filterRecords(postsRecords, (rec) => rec.value.hasOwnProperty("reply"));
      const onlyRepliesToSelf = postsRecords.filter((rec) => {
        if (!rec.value || !rec.value.reply || !rec.value.reply.parent) return false;
        return rec.value.reply.parent.uri.includes(did);
      }).length;
      const onlyRepliesToOthers = onlyReplies - onlyRepliesToSelf;
      const onlyQuotes = filterRecords(
        postsRecords,
        (rec) =>
          rec.value.embed && rec.value.embed["$type"] === "app.bsky.embed.record"
      );
      const onlySelfQuotes = filterRecords(postsRecords, (rec) => {
        if (
          !rec.value ||
          !rec.value.embed ||
          (rec.value.embed["$type"] !== "app.bsky.embed.record" &&
           rec.value.embed["$type"] !== "app.bsky.embed.recordWithMedia")
        ) {
          return false;
        }
        const embedRecord = rec.value.embed.record;
        return (
          (embedRecord.record && embedRecord.record.uri && embedRecord.record.uri.includes(did)) ||
          (embedRecord.uri && embedRecord.uri.includes(did))
        );
      });
      const onlyOtherQuotes = onlyQuotes - onlySelfQuotes;
      // Also, for reposts (paginated, expected pages: 10)
      const repostRecords = await fetchRecordsForCollection(
        "app.bsky.feed.repost",
        (inc) => { updateProgress(inc * (progressWeights.listRecords * 0.5)); },
        10
      );
      const onlyReposts = repostRecords.length;
      const onlySelfReposts = filterRecords(repostRecords, (rec) => {
        if (!rec.value || !rec.value.subject || !rec.value.subject.uri) return false;
        return rec.value.subject.uri.includes(did);
      });
      const onlyOtherReposts = onlyReposts - onlySelfReposts;
      const postsWithImages = filterRecords(
        postsRecords,
        (rec) =>
          rec.value.embed && rec.value.embed["$type"] === "app.bsky.embed.images"
      );
      const imagePostsAltText = filterRecords(postsRecords, (rec) => {
        if (!rec.value.embed || rec.value.embed["$type"] !== "app.bsky.embed.images") {
          return false;
        }
        return (
          rec.value.embed.images &&
          rec.value.embed.images.some((image) => image.alt && image.alt.trim())
        );
      });
      const imagePostsNoAltText = postsWithImages - imagePostsAltText;
      const altTextPercentage = postsWithImages ? imagePostsAltText / postsWithImages : 0;
      const postsWithOnlyText = filterRecords(
        postsRecords,
        (rec) =>
          !rec.value.embed &&
          !rec.value.reply &&
          !(rec.value.facets && JSON.stringify(rec.value.facets).indexOf("app.bsky.richtext.facet#link") !== -1)
      );
      const postsWithMentions = filterRecords(postsRecords, (rec) => {
        if (!rec.value || !rec.value.facets) return false;
        return rec.value.facets.some((facet) =>
          facet.features && facet.features.some((feature) => feature["$type"] === "app.bsky.richtext.facet#mention")
        );
      });
      const postsWithVideo = filterRecords(
        postsRecords,
        (rec) =>
          rec.value.embed && rec.value.embed["$type"] === "app.bsky.embed.video"
      );
      const postsWithLinks = filterRecords(postsRecords, (rec) => {
        if (
          rec.value.facets &&
          rec.value.facets.features &&
          rec.value.facets.features.some((f) => f["$type"] === "app.bsky.richtext.facet#link")
        )
          return true;
        if (rec.value.embed && rec.value.embed["$type"] === "app.bsky.embed.external")
          return true;
        return false;
      });
      updateProgress(); // End of detailed post stats phase.
      
      const postStats = {
        postsCount: roundToTwo(postsCount),
        postsPerDay: ageInDays ? roundToTwo(postsCount / ageInDays) : 0,
        onlyPosts: roundToTwo(onlyPosts),
        onlyPostsPerDay: ageInDays ? roundToTwo(onlyPosts / ageInDays) : 0,
        onlyReplies: roundToTwo(onlyReplies),
        onlyRepliesPerDay: ageInDays ? roundToTwo(onlyReplies / ageInDays) : 0,
        onlyRepliesToSelf: roundToTwo(onlyRepliesToSelf),
        onlyRepliesToSelfPerDay: ageInDays ? roundToTwo(onlyRepliesToSelf / ageInDays) : 0,
        onlyRepliesToOthers: roundToTwo(onlyRepliesToOthers),
        onlyRepliesToOthersPerDay: ageInDays ? roundToTwo(onlyRepliesToOthers / ageInDays) : 0,
        onlyQuotes: roundToTwo(onlyQuotes),
        onlyQuotesPerDay: ageInDays ? roundToTwo(onlyQuotes / ageInDays) : 0,
        onlySelfQuotes: roundToTwo(onlySelfQuotes),
        onlySelfQuotesPerDay: ageInDays ? roundToTwo(onlySelfQuotes / ageInDays) : 0,
        onlyOtherQuotes: roundToTwo(onlyOtherQuotes),
        onlyOtherQuotesPerDay: ageInDays ? roundToTwo(onlyOtherQuotes / ageInDays) : 0,
        onlyReposts: roundToTwo(onlyReposts),
        onlyRepostsPerDay: ageInDays ? roundToTwo(onlyReposts / ageInDays) : 0,
        onlySelfReposts: roundToTwo(onlySelfReposts),
        onlySelfRepostsPerDay: ageInDays ? roundToTwo(onlySelfReposts / ageInDays) : 0,
        onlyOtherReposts: roundToTwo(onlyOtherReposts),
        onlyOtherRepostsPerDay: ageInDays ? roundToTwo(onlyOtherReposts / ageInDays) : 0,
        postsWithImages: roundToTwo(postsWithImages),
        imagePostsPerDay: ageInDays ? roundToTwo(postsWithImages / ageInDays) : 0,
        imagePostsAltText: roundToTwo(imagePostsAltText),
        imagePostsNoAltText: roundToTwo(imagePostsNoAltText),
        altTextPercentage: roundToTwo(altTextPercentage),
        postsWithOnlyText: roundToTwo(postsWithOnlyText),
        textPostsPerDay: ageInDays ? roundToTwo(postsWithOnlyText / ageInDays) : 0,
        postsWithMentions: roundToTwo(postsWithMentions),
        mentionPostsPerDay: ageInDays ? roundToTwo(postsWithMentions / ageInDays) : 0,
        postsWithVideo: roundToTwo(postsWithVideo),
        videoPostsPerDay: ageInDays ? roundToTwo(postsWithVideo / ageInDays) : 0,
        postsWithLinks: roundToTwo(postsWithLinks),
        linkPostsPerDay: ageInDays ? roundToTwo(postsWithLinks / ageInDays) : 0,
        replyPercentage: postsCount ? roundToTwo(onlyReplies / postsCount) : 0,
        replySelfPercentage: postsCount ? roundToTwo(onlyRepliesToSelf / postsCount) : 0,
        replyOtherPercentage: postsCount ? roundToTwo(onlyRepliesToOthers / postsCount) : 0,
        quotePercentage: postsCount ? roundToTwo(onlyQuotes / postsCount) : 0,
        quoteSelfPercentage: postsCount ? roundToTwo(onlySelfQuotes / postsCount) : 0,
        quoteOtherPercentage: postsCount ? roundToTwo(onlyOtherQuotes / postsCount) : 0,
        repostPercentage: postsCount ? roundToTwo(onlyReposts / postsCount) : 0,
        repostSelfPercentage: postsCount ? roundToTwo(onlySelfReposts / postsCount) : 0,
        repostOtherPercentage: postsCount ? roundToTwo(onlyOtherReposts / postsCount) : 0,
        textPercentage: postsCount ? roundToTwo(postsWithOnlyText / postsCount) : 0,
        linkPercentage: postsCount ? roundToTwo(postsWithLinks / postsCount) : 0,
        imagePercentage: postsCount ? roundToTwo(postsWithImages / postsCount) : 0,
        videoPercentage: postsCount ? roundToTwo(postsWithVideo / postsCount) : 0,
        totalBskyRecordsPerDay: roundToTwo(totalBskyRecordsPerDay),
        totalNonBskyRecordsPerDay: roundToTwo(totalNonBskyRecordsPerDay),
      };
    
      // 8. Parse audit log (one-shot)
      const rawAuditData = await fetchAuditLog();
      let auditRecords = Array.isArray(rawAuditData) ? rawAuditData : Object.values(rawAuditData);
      const plcOperations = auditRecords.length;
      let rotationKeys = 0;
      let activeAkas = 0;
      let akaSet = new Set();
      if (plcOperations > 0) {
        auditRecords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const latestRecord = auditRecords[auditRecords.length - 1];
        if (latestRecord.operation && Array.isArray(latestRecord.operation.rotationKeys)) {
          rotationKeys = latestRecord.operation.rotationKeys.length;
        }
        if (latestRecord.operation && Array.isArray(latestRecord.operation.alsoKnownAs)) {
          activeAkas = latestRecord.operation.alsoKnownAs.length;
        }
        auditRecords.forEach((record) => {
          if (record.operation && Array.isArray(record.operation.alsoKnownAs)) {
            record.operation.alsoKnownAs.forEach((alias) => {
              akaSet.add(alias);
            });
          }
        });
      }
      const totalAkas = akaSet.size;
      const totalBskyAkas = Array.from(akaSet).filter((alias) => alias.includes("bsky.social")).length;
      const totalCustomAkas = roundToTwo(totalAkas - totalBskyAkas);
      const rotationKeysRounded = roundToTwo(rotationKeys);
      const activeAkasRounded = roundToTwo(activeAkas);
      updateProgress(progressWeights.auditLog);
    
      // 9. Compute engagements (paginated author feed)
      const engagementsReceived = await calculateEngagements();
      updateProgress(progressWeights.authorFeed);
    
      // 10. Compute overall activity statuses (one-shot)
      const overallActivityStatus = calculateActivityStatus(totalRecordsPerDay);
      const bskyActivityStatus = calculateActivityStatus(totalBskyRecordsPerDay);
      const atprotoActivityStatus = calculateActivityStatus(totalNonBskyRecordsPerDay);
      updateProgress(progressWeights.overallStatus);
    
      // 11. Compute posting style (one-shot)
      const postingStyleCalc = calculatePostingStyle({
        ...postStats,
        totalBskyRecordsPerDay,
      });
      updateProgress(progressWeights.postingStyle);
    
      // 12. Compute social status (one-shot)
      const socialStatusCalc = calculateSocialStatus({
        ageInDays,
        followersCount: profile.followersCount || 0,
        followsCount: profile.followsCount || 0,
      });
      updateProgress(progressWeights.socialStatus);
    
      // 13. Build analysis narrative (one-shot)
      const narrative = buildAnalysisNarrative({
        profile,
        activityAll: {
          totalRecords,
          totalRecordsPerDay,
          totalBskyCollections,
          totalNonBskyCollections,
          totalBskyRecords,
          totalBskyRecordsPerDay,
          totalBskyRecordsPercentage,
          totalNonBskyRecords,
          totalNonBskyRecordsPerDay,
          totalNonBskyRecordsPercentage,
          plcOperations,
          ...collectionStats,
          "app.bsky.feed.post": {
            ...postStats,
            engagementsReceived,
          },
        },
        postingStyle: postingStyleCalc,
        socialStatus: socialStatusCalc,
        alsoKnownAs: {
          totalAkas,
          totalCustomAkas,
          totalBskyAkas,
        },
      });
      updateProgress(progressWeights.narrative);
    
      // 14b. Compute aggregate records for last 30 days (one-shot)
      const periodDays = 30;
      const {
        totalRecords: totalRecords30,
        totalBskyRecords: totalBskyRecords30,
        totalNonBskyRecords: totalNonBskyRecords30,
        collectionStats: collectionStats30,
      } = await calculateRecordsAggregateForPeriod(targetCollections, periodDays);
      const totalRecordsPerDay30 = periodDays ? totalRecords30 / periodDays : 0;
      const totalBskyRecordsPerDay30 = periodDays ? totalBskyRecords30 / periodDays : 0;
      const totalNonBskyRecordsPerDay30 = periodDays ? totalNonBskyRecords30 / periodDays : 0;
      updateProgress(progressWeights.aggregates30);
    
      // 15. Construct final accountData JSON.
      const accountDataFinal = {
        profile: {
          ...profile,
          did: profile.did || did,
        },
        displayName: profile.displayName,
        handle: profile.handle,
        did: profile.did || did,
        profileEditedDate: profile.indexedAt,
        profileCompletion: calculateProfileCompletion(profile),
        scoreGeneratedAt: new Date().toISOString(),
        serviceEndpoint,
        pdsType: serviceEndpoint.includes("bsky.network") ? "Bluesky" : "Third-party",
        createdAt: profile.createdAt,
        ageInDays: roundToTwo(ageInDays),
        agePercentage: roundToTwo(agePercentage),
        blobsCount: roundToTwo(blobsCount),
        blobsPerDay: ageInDays ? roundToTwo(blobsCount / ageInDays) : 0,
        blobsPerPost: postsCount ? roundToTwo(blobsCount / postsCount) : 0,
        blobsPerImagePost: postsWithImages ? roundToTwo(blobsCount / postsWithImages) : 0,
        followersCount: roundToTwo(profile.followersCount),
        followsCount: roundToTwo(profile.followsCount),
        followPercentage: profile.followersCount ? roundToTwo(profile.followsCount / profile.followersCount) : 0,
        postsCount: roundToTwo(postsCount),
        rotationKeys: rotationKeysRounded,
        era: calculateEra(profile.createdAt),
        postingStyle: postingStyleCalc,
        socialStatus: socialStatusCalc,
        activityAll: {
          activityStatus: overallActivityStatus,
          bskyActivityStatus,
          atprotoActivityStatus,
          totalCollections: roundToTwo(totalCollections),
          totalBskyCollections: roundToTwo(totalBskyCollections),
          totalNonBskyCollections: roundToTwo(totalNonBskyCollections),
          totalRecords: roundToTwo(totalRecords),
          totalRecordsPerDay: roundToTwo(totalRecordsPerDay),
          totalBskyRecords: roundToTwo(totalBskyRecords),
          totalBskyRecordsPerDay: roundToTwo(totalBskyRecordsPerDay),
          totalBskyRecordsPercentage: roundToTwo(totalBskyRecordsPercentage),
          totalNonBskyRecords: roundToTwo(totalNonBskyRecords),
          totalNonBskyRecordsPerDay: roundToTwo(totalNonBskyRecordsPerDay),
          totalNonBskyRecordsPercentage: roundToTwo(totalNonBskyRecordsPercentage),
          plcOperations: roundToTwo(plcOperations),
          ...collectionStats,
          "app.bsky.feed.post": {
            ...postStats,
            engagementsReceived,
          },
        },
        activityLast30Days: {
          profileEdited: new Date(profile.indexedAt) > new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000),
          totalRecords: roundToTwo(totalRecords30),
          totalRecordsPerDay: roundToTwo(totalRecordsPerDay30),
          totalBskyRecords: roundToTwo(totalBskyRecords30),
          totalBskyRecordsPerDay: roundToTwo(totalBskyRecordsPerDay30),
          totalNonBskyRecords: roundToTwo(totalNonBskyRecords30),
          totalNonBskyRecordsPerDay: roundToTwo(totalNonBskyRecordsPerDay30),
          collections: collectionStats30,
        },
        alsoKnownAs: {
          totalAkas: roundToTwo(totalAkas),
          activeAkas: activeAkasRounded,
          totalBskyAkas: roundToTwo(totalBskyAkas),
          totalCustomAkas: roundToTwo(totalCustomAkas),
          domainRarity: calculateDomainRarity(profile.handle),
          handleType: profile.handle.includes("bsky.social") ? "default" : "custom",
        },
        analysis: {
          narrative: narrative,
        },
      };
      updateProgress(progressWeights.final);
      
      // 16. Build final output JSON.
      const finalOutput = {
        message: "accountData retrieved successfully",
        accountData: accountDataFinal,
      };
      
      return roundNumbers(finalOutput);
    } catch (err) {
      console.error("Error loading account data:", err);
      return {
        message: "Error retrieving accountData",
        error: err.toString(),
      };
    }
  }
  