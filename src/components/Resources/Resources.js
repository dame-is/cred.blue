// src/components/Resources/Resources.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './Resources.css';
import { Link } from 'react-router-dom';
import ResourceLoader from './ResourceLoader';

const Resources = () => {
  // State management
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Category emojis mapping
  const categoryEmojis = {
    'All': '🔍',
    'Analytics': '📊',
    'Services': '🛠️',
    'Data': '💾',
    'Network': '🔄',
    'Clients': '📱',
    'Moderation': '🛡️',
    'Feeds': '📰',
    'Visualizations': '🎨',
    'Development': '👨‍💻',
    'Guides': '📚',
    'Misc': '🔮'
  };

  // Resources data structure with expanded items from the second file
  const resourcesData = [
    // Analytics & Metrics - Personal Stats
    { 
      name: "Alt Text Rating Tool", 
      url: "https://dame.is/ratingalttext", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Check how consistently you use alt text", 
      domain: "dame.is",
      quality: 5,
      featured: true
    },
    { 
      name: "Skeet Reviewer", 
      url: "https://reviewer.skeet.tools", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Use the KonMari method to sort through your old posts", 
      domain: "skeet.tools",
      quality: 5,
      featured: true
    },
    { 
      name: "Venn Diagram", 
      url: "https://venn.aviva.gay/dame.bsky.social", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Visualize your social graph", 
      domain: "aviva.gay",
      quality: 4,
      featured: false
    },
    { 
      name: "SkyZoo", 
      url: "https://skyzoo.blue/", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Profile metrics and fun stats", 
      domain: "skyzoo.blue",
      quality: 4,
      featured: false
    },
    { 
      name: "SkyKit", 
      url: "http://skykit.blue", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Bluesky analytics", 
      domain: "skykit.blue",
      quality: 4,
      featured: true
    },
    { 
      name: "Skeetstats", 
      url: "https://bsky.app/profile/skeetstats.xyz", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Track your Bluesky stats", 
      domain: "skeetstats.xyz",
      quality: 3,
      featured: false
    },
    { 
      name: "Skircle", 
      url: "http://skircle.me", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Interaction circles visualization", 
      domain: "skircle.me",
      quality: 3,
      featured: false
    },
    { 
      name: "Bluesky Counter", 
      url: "https://blueskycounter.com/", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Count various metrics for your profile", 
      domain: "blueskycounter.com",
      quality: 3,
      featured: false
    },
    { 
      name: "ClearSky", 
      url: "http://clearsky.app", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Transparent block and list analytics", 
      domain: "clearsky.app",
      quality: 4,
      featured: true
    },
    { 
      name: "Blueview", 
      url: "https://blueview.app/login", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Insights and analytics for your profile", 
      domain: "blueview.app",
      quality: 4,
      featured: true
    },
    { 
      name: "Bskypt", 
      url: "https://bskypt.vercel.app", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Receipt-like profile stats", 
      domain: "vercel.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Posts Heatmap Generator", 
      url: "https://bluesky-heatmap.fly.dev", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Create a heatmap of your posting activity", 
      domain: "fly.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Dopplersky", 
      url: "https://dopplersky.com", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Find your Twitter-to-Bluesky doppelgangers", 
      domain: "dopplersky.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Skystats", 
      url: "https://skystats.mariozechner.at/", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Comprehensive profile statistics", 
      domain: "mariozechner.at",
      quality: 3,
      featured: false
    },
    { 
      name: "Best Time to Post", 
      url: "https://bluesky.notemation.com/best-time-to-post", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "See your social graph's active times", 
      domain: "notemation.com",
      quality: 3,
      featured: false
    },
    
    // Analytics & Metrics - Platform Stats
    { 
      name: "Bcounter", 
      url: "http://bcounter.nat.vg", 
      category: "Analytics",
      subcategory: "Platform Stats",
      description: "Realtime user growth dashboard", 
      domain: "nat.vg",
      quality: 4,
      featured: false
    },
    { 
      name: "Emojistats", 
      url: "https://emojistats.bsky.sh", 
      category: "Analytics",
      subcategory: "Platform Stats",
      description: "Real-time emoji usage data", 
      domain: "bsky.sh",
      quality: 3,
      featured: false
    },
    { 
      name: "Bluesky Post Count and Author Stats", 
      url: "https://bsky.jazco.dev/stats", 
      category: "Analytics",
      subcategory: "Platform Stats",
      description: "Platform-wide statistics", 
      domain: "jazco.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Bluesky Population Size Guide", 
      url: "https://observablehq.com/d/58c2cd234ca376b8", 
      category: "Analytics",
      subcategory: "Platform Stats",
      description: "Visual guide to Bluesky user population", 
      domain: "observablehq.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Top 500 Users List", 
      url: "https://vqv.app/index.html", 
      category: "Analytics",
      subcategory: "Platform Stats",
      description: "List of top Bluesky users by followers", 
      domain: "vqv.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Handles Directory", 
      url: "https://blue.mackuba.eu/directory/", 
      category: "Analytics",
      subcategory: "Platform Stats",
      description: "Browse Bluesky handles by domain", 
      domain: "mackuba.eu",
      quality: 3,
      featured: false
    },
    { 
      name: "BlueTube", 
      url: "https://bluetube.fyi/", 
      category: "Analytics",
      subcategory: "Platform Stats",
      description: "Hottest YouTube links on Bluesky", 
      domain: "bluetube.fyi",
      quality: 3,
      featured: false
    },
    { 
      name: "BSkyCharts", 
      url: "https://bskycharts.edavis.dev/bluesky-day.html", 
      category: "Analytics",
      subcategory: "Platform Stats",
      description: "Charts and statistics for Bluesky", 
      domain: "edavis.dev",
      quality: 3,
      featured: false
    },
    
    // Services & AppViews
    { 
      name: "Mutesky", 
      url: "https://mutesky.app/", 
      category: "Services",
      subcategory: "AppViews",
      description: "Manage your muted words in bulk", 
      domain: "mutesky.app",
      quality: 4,
      featured: false
    },
    { 
      name: "Frontpage", 
      url: "https://frontpage.fyi", 
      category: "Services",
      subcategory: "AppViews",
      description: "Decentralized link aggregator", 
      domain: "frontpage.fyi",
      quality: 5,
      featured: true
    },
    { 
      name: "WhiteWind", 
      url: "https://whtwnd.com/about", 
      category: "Services",
      subcategory: "AppViews",
      description: "Markdown blogging service", 
      domain: "whtwnd.com",
      quality: 4,
      featured: false
    },
    { 
      name: "Skylights", 
      url: "https://skylights.my/profile/watwa.re", 
      category: "Services",
      subcategory: "AppViews",
      description: "Track and review favorite media", 
      domain: "skylights.my",
      quality: 4,
      featured: false
    },
    { 
      name: "BookHive", 
      url: "https://bookhive.buzz/", 
      category: "Services",
      subcategory: "AppViews",
      description: "Goodreads on AT Proto", 
      domain: "bookhive.buzz",
      quality: 4,
      featured: false
    },
    { 
      name: "Linkat", 
      url: "https://linkat.blue", 
      category: "Services",
      subcategory: "AppViews",
      description: "Link in bio for Bluesky", 
      domain: "linkat.blue",
      quality: 4,
      featured: false
    },
    { 
      name: "psky.social", 
      url: "https://psky.social", 
      category: "Services",
      subcategory: "AppViews",
      description: "Chatroom for Bluesky users", 
      domain: "psky.social",
      quality: 3,
      featured: false
    },
    { 
      name: "atproto.camp", 
      url: "https://atproto.camp", 
      category: "Services",
      subcategory: "AppViews",
      description: "Earn badges for protocol activity", 
      domain: "atproto.camp",
      quality: 3,
      featured: false
    },
    { 
      name: "pinksea.art", 
      url: "https://pinksea.art/", 
      category: "Services",
      subcategory: "AppViews",
      description: "Oekaki (doodle) on the ATprotocol", 
      domain: "pinksea.art",
      quality: 4,
      featured: true
    },
    { 
      name: "poll.blue", 
      url: "https://poll.blue/post", 
      category: "Services",
      subcategory: "AppViews",
      description: "Polls for Bluesky", 
      domain: "poll.blue",
      quality: 4,
      featured: false
    },
    { 
      name: "Blue Bots, Done Quick", 
      url: "http://bluebotsdonequick.com", 
      category: "Services",
      subcategory: "AppViews",
      description: "Create bots for Bluesky easily", 
      domain: "bluebotsdonequick.com",
      quality: 3,
      featured: false
    },
    { 
      name: "teal.fm", 
      url: "https://teal.fm", 
      category: "Services",
      subcategory: "AppViews",
      description: "Music tracking and discovery", 
      domain: "teal.fm",
      quality: 4,
      featured: false
    },
    { 
      name: "Hugfairy", 
      url: "https://bsky.app/profile/hugfairy.bsky.social", 
      category: "Services",
      subcategory: "AppViews",
      description: "Send a hug to someone on Bluesky", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "BlueNotify", 
      url: "https://apps.apple.com/us/app/bluenotify/id6738239349", 
      category: "Services",
      subcategory: "AppViews",
      description: "Post notifications for Bluesky", 
      domain: "apple.com",
      quality: 4,
      featured: false
    },
    { 
      name: "ATFile", 
      url: "https://github.com/ziodotsh/atfile", 
      category: "Services",
      subcategory: "AppViews",
      description: "Share files on a PDS", 
      domain: "github.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Bluecast", 
      url: "https://www.bluecast.app", 
      category: "Services",
      subcategory: "AppViews",
      description: "Real-time audio streaming service", 
      domain: "bluecast.app",
      quality: 4,
      featured: false
    },
    { 
      name: "Blue Place", 
      url: "https://place.blue", 
      category: "Services",
      subcategory: "AppViews",
      description: "r/place, but for Bluesky", 
      domain: "place.blue",
      quality: 3,
      featured: false
    },
    { 
      name: "pastesphere", 
      url: "https://pastesphere.link/", 
      category: "Services",
      subcategory: "AppViews",
      description: "Paste-bin on the AT Protocol", 
      domain: "pastesphere.link",
      quality: 3,
      featured: false
    },
    { 
      name: "Recipe Exchange", 
      url: "https://recipe.exchange/", 
      category: "Services",
      subcategory: "AppViews",
      description: "Share and discover recipes", 
      domain: "recipe.exchange",
      quality: 4,
      featured: false
    },
    { 
      name: "skywatched", 
      url: "https://skywatched.app/", 
      category: "Services",
      subcategory: "AppViews",
      description: "Review and track movies", 
      domain: "skywatched.app",
      quality: 4,
      featured: false
    },
    { 
      name: "Ruthub", 
      url: "https://ruthub.com", 
      category: "Services",
      subcategory: "AppViews",
      description: "Kanban on AT Proto", 
      domain: "ruthub.com",
      quality: 3,
      featured: false
    },
    { 
      name: "dazzle.fm", 
      url: "https://dazzle.fm/trends", 
      category: "Services",
      subcategory: "AppViews",
      description: "What's happening on Bluesky", 
      domain: "dazzle.fm",
      quality: 3,
      featured: false
    },
    
    // Data Management
    { 
      name: "Bulk Thread Gating", 
      url: "https://boat.kelinci.net/bsky-threadgate-applicator", 
      category: "Data",
      subcategory: "Management",
      description: "Bulk retroactive thread gating", 
      domain: "kelinci.net",
      quality: 3,
      featured: false
    },
    { 
      name: "SkySweeper", 
      url: "https://skysweeper.p8.lu", 
      category: "Data",
      subcategory: "Management",
      description: "Auto-delete old skeets", 
      domain: "p8.lu",
      quality: 4,
      featured: false
    },
    { 
      name: "Skeetgen", 
      url: "https://mary-ext.github.io/skeetgen/", 
      category: "Data",
      subcategory: "Management",
      description: "Generate an easily viewable archive of your posts", 
      domain: "github.io",
      quality: 4,
      featured: false
    },
    { 
      name: "Profile Cleaner", 
      url: "https://bsky.jazco.dev/cleanup", 
      category: "Data",
      subcategory: "Management",
      description: "Clean up your Bluesky profile", 
      domain: "jazco.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Backup Tool", 
      url: "https://observablehq.com/@aendra/bluesky-backup-tool", 
      category: "Data",
      subcategory: "Management",
      description: "Back up your Bluesky data", 
      domain: "observablehq.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Tweet Deleter", 
      url: "http://tweetdeleter.com", 
      category: "Data",
      subcategory: "Management",
      description: "Delete your old tweets", 
      domain: "tweetdeleter.com",
      quality: 3,
      featured: false
    },
    { 
      name: "redact.dev", 
      url: "http://redact.dev", 
      category: "Data",
      subcategory: "Management",
      description: "Delete posts from various platforms", 
      domain: "redact.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Blockparty", 
      url: "http://blockpartyapp.com", 
      category: "Data",
      subcategory: "Management",
      description: "Manage blocks across platforms", 
      domain: "blockpartyapp.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Porto", 
      url: "https://chromewebstore.google.com/detail/porto-import-your-tweets/ckilhjdflnaakopknngigiggfpnjaaop", 
      category: "Data",
      subcategory: "Management",
      description: "Import your tweets to Bluesky", 
      domain: "google.com",
      quality: 4,
      featured: false
    },
    { 
      name: "BlueArk", 
      url: "https://blueark.app", 
      category: "Data",
      subcategory: "Management",
      description: "Move your tweets to Bluesky", 
      domain: "blueark.app",
      quality: 4,
      featured: false
    },
    
    // Network Management
    { 
      name: "Network Analyzer", 
      url: "http://bsky-follow-finder.theo.io", 
      category: "Network",
      subcategory: "Management",
      description: "Find and analyze your network connections", 
      domain: "theo.io",
      quality: 4,
      featured: true
    },
    { 
      name: "Gentle Unfollow", 
      url: "https://bsky.cam.fyi/unfollow", 
      category: "Network",
      subcategory: "Management",
      description: "Track and manage who you're following", 
      domain: "cam.fyi",
      quality: 4,
      featured: true
    },
    { 
      name: "Sky Follower Bridge", 
      url: "https://chromewebstore.google.com/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko/", 
      category: "Network",
      subcategory: "Management",
      description: "Find your Twitter follows", 
      domain: "google.com",
      quality: 4,
      featured: false
    },
    { 
      name: "StarterPacks.net", 
      url: "https://www.starterpacks.net", 
      category: "Network",
      subcategory: "Management",
      description: "Explore starter packs", 
      domain: "starterpacks.net",
      quality: 4,
      featured: false
    },
    { 
      name: "Follower Explorer", 
      url: "https://bluesky-followers.advaith.io", 
      category: "Network",
      subcategory: "Management",
      description: "Explore your followers", 
      domain: "advaith.io",
      quality: 3,
      featured: false
    },
    { 
      name: "cleanfollow", 
      url: "https://cleanfollow-bsky.pages.dev", 
      category: "Network",
      subcategory: "Management",
      description: "Select inactive or blocked accounts to unfollow", 
      domain: "pages.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Bluesky Follower Info", 
      url: "https://chromewebstore.google.com/detail/bluesky-follower-info/fokpfcfpgdlmnbjajbdeofkemfblbnbh", 
      category: "Network",
      subcategory: "Management",
      description: "Chrome extension for follower info", 
      domain: "google.com",
      quality: 3,
      featured: false
    },
    { 
      name: "unfollow.blue", 
      url: "https://unfollow.blue/", 
      category: "Network",
      subcategory: "Management",
      description: "Track unfollows and follows", 
      domain: "unfollow.blue",
      quality: 3,
      featured: false
    },
    { 
      name: "Blockenheimer", 
      url: "https://blockenheimer.click/", 
      category: "Network",
      subcategory: "Management",
      description: "Block large amounts of accounts", 
      domain: "blockenheimer.click",
      quality: 3,
      featured: false
    },
    { 
      name: "Convert Starter Pack to List", 
      url: "https://nws-bot.us/bskyStarterPack.php", 
      category: "Network",
      subcategory: "Management",
      description: "Convert starter packs to lists", 
      domain: "nws-bot.us",
      quality: 3,
      featured: false
    },
    { 
      name: "List Copier", 
      url: "https://bsky.cam.fyi/lists", 
      category: "Network",
      subcategory: "Management",
      description: "Copy lists between accounts", 
      domain: "cam.fyi",
      quality: 3,
      featured: false
    },
    { 
      name: "listfluff", 
      url: "https://github.com/mollypup/listfluff?tab=readme-ov-file", 
      category: "Network",
      subcategory: "Management",
      description: "Add and remove users from Bluesky lists", 
      domain: "github.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Which Pack", 
      url: "https://whichpack.com/", 
      category: "Network",
      subcategory: "Management",
      description: "See what starterpacks you're in", 
      domain: "whichpack.com",
      quality: 3,
      featured: false
    },
    { 
      name: "AT Orbital Laser", 
      url: "https://at-orbital-laser.aesthr.com/", 
      category: "Network",
      subcategory: "Management",
      description: "Block a user and their followers", 
      domain: "aesthr.com",
      quality: 3,
      featured: false
    },
    
    // Alternative Clients
    { 
      name: "deck.blue", 
      url: "http://deck.blue", 
      category: "Clients",
      subcategory: "Alternative",
      description: "TweetDeck for Bluesky", 
      domain: "deck.blue",
      quality: 4,
      featured: false
    },
    { 
      name: "Graysky", 
      url: "https://graysky.app", 
      category: "Clients",
      subcategory: "Alternative",
      description: "Alternative mobile client", 
      domain: "graysky.app",
      quality: 5,
      featured: false
    },
    { 
      name: "Skeets App", 
      url: "https://www.skeetsapp.com", 
      category: "Clients",
      subcategory: "Alternative",
      description: "Third-party Bluesky client", 
      domain: "skeetsapp.com",
      quality: 4,
      featured: false
    },
    { 
      name: "Ouranos", 
      url: "https://useouranos.app/", 
      category: "Clients",
      subcategory: "Alternative",
      description: "Alternative Bluesky client", 
      domain: "useouranos.app",
      quality: 4,
      featured: false
    },
    { 
      name: "Butterfly", 
      url: "https://apps.apple.com/us/app/butterfly-for-bluesky/id6738070758", 
      category: "Clients",
      subcategory: "Alternative",
      description: "Bluesky for Apple Watch", 
      domain: "apple.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Ucho-ten", 
      url: "https://app.ucho-ten.net/", 
      category: "Clients",
      subcategory: "Alternative",
      description: "Alternative Bluesky client", 
      domain: "ucho-ten.net",
      quality: 4,
      featured: false
    },
    { 
      name: "Swablu", 
      url: "https://swablu.pages.dev/#/login", 
      category: "Clients",
      subcategory: "Alternative",
      description: "Web-based Bluesky client", 
      domain: "pages.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Bluejeans", 
      url: "https://bluejeans.app/", 
      category: "Clients",
      subcategory: "Alternative",
      description: "Alternative Bluesky client", 
      domain: "bluejeans.app",
      quality: 3,
      featured: false
    },
    
    // Labelers & Moderation
    { 
      name: "US Politics Labeler", 
      url: "https://bsky.app/profile/uspol.bluesky.bot", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Labels political content", 
      domain: "bsky.app",
      quality: 4,
      featured: true
    },
    { 
      name: "Pronouns Labeler", 
      url: "https://bsky.app/profile/pronouns.adorable.mom", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Adds pronoun information to profiles", 
      domain: "bsky.app",
      quality: 4,
      featured: true
    },
    { 
      name: "Labeler List", 
      url: "https://blue.mackuba.eu/labellers/", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Directory of available labelers", 
      domain: "mackuba.eu",
      quality: 4,
      featured: false
    },
    { 
      name: "Label Scanner", 
      url: "https://blue.mackuba.eu/scanner/", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "See what labels are on your account", 
      domain: "mackuba.eu",
      quality: 4,
      featured: false
    },
    { 
      name: "Identity Decentralisation", 
      url: "https://bsky.app/profile/decentralise.goeo.lol", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Labeler for decentralization identification", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Official Moderation", 
      url: "https://bsky.app/profile/moderation.bsky.app", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Official Bluesky moderation account", 
      domain: "bsky.app",
      quality: 5,
      featured: false
    },
    { 
      name: "Profile Records", 
      url: "https://bsky.app/profile/profile-labels.bossett.social", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Profile record labeler", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Skywatch", 
      url: "https://bsky.app/profile/skywatch.blue", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Multipurpose labeler", 
      domain: "bsky.app",
      quality: 4,
      featured: false
    },
    { 
      name: "Khronos", 
      url: "https://bsky.app/profile/khronos.world", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Time zone labels", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Blacksky", 
      url: "https://bsky.app/profile/blacksky.app", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Content moderation labeler", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "US Gov Contributions", 
      url: "https://bsky.app/profile/us-gov-funding.bsky.social", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Labels users with government funding", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Screenshots", 
      url: "https://bsky.app/profile/xblock.aendra.dev", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Labels screenshots", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "AI Imagery", 
      url: "https://bsky.app/profile/aimod.social", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Labels AI-generated imagery", 
      domain: "bsky.app",
      quality: 4,
      featured: false
    },
    { 
      name: "Content Creator Labels", 
      url: "https://bsky.app/profile/creatorlabeler.bsky.social", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Labels content creators", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Shiny Posts", 
      url: "https://bsky.app/profile/shinyposts.awoo.blue", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Labels visually distinct posts", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Mushroom Server Labels", 
      url: "https://bsky.app/profile/mushroom-labeler.bsky.social", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Labels mushroom content", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Nations", 
      url: "https://bsky.app/profile/kickflip.renahlee.com", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Labels users by country/nationality", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    
    // Feeds & Discovery
    { 
      name: "Graze", 
      url: "https://www.graze.social/", 
      category: "Feeds",
      subcategory: "Feed Tools",
      description: "No-Code feed creator", 
      domain: "graze.social",
      quality: 5,
      featured: true
    },
    { 
      name: "goodfeeds.com", 
      url: "https://goodfeeds.co/all?p=1", 
      category: "Feeds",
      subcategory: "Feed Tools",
      description: "Discover feeds", 
      domain: "goodfeeds.co",
      quality: 4,
      featured: false
    },
    { 
      name: "Bluefeed", 
      url: "https://www.bluefeed.app", 
      category: "Feeds",
      subcategory: "Feed Tools",
      description: "Discover feeds", 
      domain: "bluefeed.app",
      quality: 4,
      featured: false
    },
    { 
      name: "Quiet Posters", 
      url: "https://bsky.app/profile/did:plc:vpkhqolt662uhesyj6nxm7ys/feed/infreq", 
      category: "Feeds",
      subcategory: "Discovery",
      description: "Feed of less frequent posters", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Popular with Friends", 
      url: "https://bsky.app/profile/bsky.app/feed/with-friends", 
      category: "Feeds",
      subcategory: "Discovery",
      description: "Posts popular with your friends", 
      domain: "bsky.app",
      quality: 4,
      featured: false
    },
    { 
      name: "Best of Friends", 
      url: "https://bsky.app/profile/bsky.app/feed/best-of-follows", 
      category: "Feeds",
      subcategory: "Discovery",
      description: "Best posts from who you follow", 
      domain: "bsky.app",
      quality: 4,
      featured: false
    },
    { 
      name: "Trending Links", 
      url: "https://bsky.app/profile/why.bsky.team/feed/links", 
      category: "Feeds",
      subcategory: "Discovery",
      description: "Popular links being shared", 
      domain: "bsky.app",
      quality: 4,
      featured: false
    },
    { 
      name: "Only Posts", 
      url: "https://bsky.app/profile/did:plc:tenurhgjptubkk5zf5qhi3og/feed/only-posts", 
      category: "Feeds",
      subcategory: "Discovery",
      description: "No reposts or replies", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Mentions Only", 
      url: "https://bsky.app/profile/flicknow.xyz/feed/mentions", 
      category: "Feeds",
      subcategory: "Discovery",
      description: "See only mentions", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "My Misses", 
      url: "https://bsky.app/profile/goeo.lol/feed/misses", 
      category: "Feeds",
      subcategory: "Discovery",
      description: "See your unliked posts", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "My Bangers", 
      url: "https://bsky.app/profile/jaz.bsky.social/feed/bangers", 
      category: "Feeds",
      subcategory: "Discovery",
      description: "See your most liked posts", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    
    // Visualizations
    { 
      name: "Bluesky by the Second", 
      url: "https://sky.flikq.dev", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Live visualization of the firehose", 
      domain: "flikq.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Final Words", 
      url: "https://deletions.bsky.bad-example.com", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Glimpses of deleted posts", 
      domain: "bad-example.com",
      quality: 3,
      featured: true
    },
    { 
      name: "Swearsky", 
      url: "http://swearsky.bagpuss.org", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Visualize swearing on Bluesky", 
      domain: "bagpuss.org",
      quality: 3,
      featured: false
    },
    { 
      name: "3D Firehose", 
      url: "https://firehose3d.theo.io", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "3D visualization of Bluesky posts", 
      domain: "theo.io",
      quality: 3,
      featured: false
    },
    { 
      name: "Firesky", 
      url: "https://firesky.tv", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Visualize the Bluesky firehose", 
      domain: "firesky.tv",
      quality: 3,
      featured: false
    },
    { 
      name: "ATProto Firehose Event Counter", 
      url: "https://atproto.netlify.app", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Count events in the firehose", 
      domain: "netlify.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Matrix Style Visualization", 
      url: "https://simone.computer/bluerain/", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Matrix-inspired visualization", 
      domain: "simone.computer",
      quality: 3,
      featured: false
    },
    { 
      name: "Spaceship Firehose Game", 
      url: "https://spaceshipfirehose.vercel.app/", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Game powered by Bluesky firehose", 
      domain: "vercel.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Live Word Cloud", 
      url: "https://flo-bit.dev/bluesky-visualizers/wordcloud", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Real-time word cloud of posts", 
      domain: "flo-bit.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Trending Hashtags", 
      url: "https://flo-bit.dev/bluesky-trending/", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "See trending hashtags", 
      domain: "flo-bit.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Emotions Analysis", 
      url: "https://flo-bit.dev/bluesky-visualizers/emotions", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Analyze emotions in posts", 
      domain: "flo-bit.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Imagehose", 
      url: "https://imagehose.net/", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Stream of images from Bluesky", 
      domain: "imagehose.net",
      quality: 3,
      featured: false
    },
    { 
      name: "Colors of Bluesky", 
      url: "https://www.bewitched.com/demo/rainbowsky/", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Color visualization of posts", 
      domain: "bewitched.com",
      quality: 3,
      featured: false
    },
    
    // Developer Tools
    { 
      name: "pdsls.dev", 
      url: "https://pdsls.dev/", 
      category: "Development",
      subcategory: "Tools",
      description: "Browse AtProto repositories", 
      domain: "pdsls.dev",
      quality: 5,
      featured: true
    },
    { 
      name: "sdk.blue", 
      url: "http://sdk.blue", 
      category: "Development",
      subcategory: "Tools",
      description: "Libraries & SDKs for the AT Protocol", 
      domain: "sdk.blue",
      quality: 4,
      featured: false
    },
    { 
      name: "atp.tools", 
      url: "https://atp.tools/", 
      category: "Development",
      subcategory: "Tools",
      description: "Developer tools for AT Protocol", 
      domain: "atp.tools",
      quality: 4,
      featured: false
    },
    { 
      name: "Resolve a Bluesky Handle", 
      url: "https://internect.info", 
      category: "Development",
      subcategory: "Tools",
      description: "Handle resolution tool", 
      domain: "internect.info",
      quality: 3,
      featured: false
    },
    { 
      name: "Boat", 
      url: "https://boat.kelinci.net/", 
      category: "Development",
      subcategory: "Tools",
      description: "Various technical tools", 
      domain: "kelinci.net",
      quality: 3,
      featured: false
    },
    { 
      name: "blue.badge", 
      url: "https://badge.blue", 
      category: "Development",
      subcategory: "Tools",
      description: "Define, issue, and verify badges", 
      domain: "badge.blue",
      quality: 3,
      featured: false
    },
    { 
      name: "browser.blue", 
      url: "https://browser.blue/types", 
      category: "Development",
      subcategory: "Tools",
      description: "Browse AT Protocol types", 
      domain: "browser.blue",
      quality: 3,
      featured: false
    },
    { 
      name: "SkyTools", 
      url: "https://skytools.anon5r.com/profile", 
      category: "Development",
      subcategory: "Tools",
      description: "Various developer tools", 
      domain: "anon5r.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Lexicon Community", 
      url: "https://github.com/lexicon-community", 
      category: "Development",
      subcategory: "Tools",
      description: "Community-made lexicons", 
      domain: "github.com",
      quality: 3,
      featured: false
    },
    { 
      name: "atproto-did-web", 
      url: "https://atproto-did-web.lukeacl.com/", 
      category: "Development",
      subcategory: "Tools",
      description: "DID web tools for AT Protocol", 
      domain: "lukeacl.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Manual", 
      url: "https://manual.renahlee.com/", 
      category: "Development",
      subcategory: "Tools",
      description: "Set a non-default PLC key", 
      domain: "renahlee.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Skeetbeaver", 
      url: "https://skeetbeaver.pages.dev/", 
      category: "Development",
      subcategory: "Tools",
      description: "Assorted tools for retrieving data", 
      domain: "pages.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Bsky Debug Page", 
      url: "https://bsky-debug.app/handle", 
      category: "Development",
      subcategory: "Tools",
      description: "Debug Bluesky handles and profiles", 
      domain: "bsky-debug.app",
      quality: 3,
      featured: false
    },
    { 
      name: "Skyware", 
      url: "https://skyware.js.org", 
      category: "Development",
      subcategory: "Tools",
      description: "Package collection for developers", 
      domain: "js.org",
      quality: 3,
      featured: false
    },
    { 
      name: "Atcute", 
      url: "https://github.com/mary-ext/atcute", 
      category: "Development",
      subcategory: "Tools",
      description: "Lightweight TypeScript packages for AT Protocol", 
      domain: "github.com",
      quality: 4,
      featured: false
    },
    { 
      name: "bluesky-embed", 
      url: "https://github.com/mary-ext/bluesky-embed", 
      category: "Development",
      subcategory: "Tools",
      description: "Custom element for embedding Bluesky posts", 
      domain: "github.com",
      quality: 4,
      featured: false
    },
    { 
      name: "Clearsky API", 
      url: "https://github.com/ClearskyApp06/clearskyservices/blob/main/api.md", 
      category: "Development",
      subcategory: "Tools",
      description: "API for ClearSky services", 
      domain: "github.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Hopper", 
      url: "https://hopper.at/", 
      category: "Development",
      subcategory: "Tools",
      description: "AT-URI redirection tool", 
      domain: "hopper.at",
      quality: 3,
      featured: false
    },
    { 
      name: "atproto-scraping", 
      url: "https://github.com/mary-ext/atproto-scraping", 
      category: "Development",
      subcategory: "Tools",
      description: "Scraping tools for AT Protocol", 
      domain: "github.com",
      quality: 3,
      featured: false
    },
    { 
      name: "TID converter", 
      url: "https://mary.my.id/tools/tid-converter", 
      category: "Development",
      subcategory: "Tools",
      description: "Convert between TIDs and dates", 
      domain: "mary.my.id",
      quality: 3,
      featured: false
    },
    { 
      name: "Weather Vane", 
      url: "https://verify.aviary.domains/", 
      category: "Development",
      subcategory: "Tools",
      description: "Domain verification tool", 
      domain: "aviary.domains",
      quality: 3,
      featured: false
    },
    { 
      name: "TID clock", 
      url: "https://retr0.id/stuff/atclock/", 
      category: "Development",
      subcategory: "Tools",
      description: "Visual TID clock", 
      domain: "retr0.id",
      quality: 3,
      featured: false
    },
    { 
      name: "handles.net", 
      url: "https://handles.net/", 
      category: "Development",
      subcategory: "Tools",
      description: "Manage Bluesky handles for your community", 
      domain: "handles.net",
      quality: 4,
      featured: false
    },
    { 
      name: "Lexidex", 
      url: "https://lexidex.bsky.dev/", 
      category: "Development",
      subcategory: "Tools",
      description: "Catalog of lexicons", 
      domain: "bsky.dev",
      quality: 3,
      featured: false
    },
    
    // Guides & Documentation
    { 
      name: "Verify Your Account", 
      url: "https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial", 
      category: "Guides",
      subcategory: "Documentation",
      description: "How to verify your Bluesky account", 
      domain: "bsky.social",
      quality: 4,
      featured: false
    },
    { 
      name: "Complete Guide to Bluesky", 
      url: "https://mackuba.eu/2024/02/21/bluesky-guide/", 
      category: "Guides",
      subcategory: "Documentation",
      description: "Comprehensive Bluesky guide", 
      domain: "mackuba.eu",
      quality: 5,
      featured: false
    },
    { 
      name: "Advanced Search Guide", 
      url: "https://bsky.social/about/blog/05-31-2024-search", 
      category: "Guides",
      subcategory: "Documentation",
      description: "Guide to using advanced search", 
      domain: "bsky.social",
      quality: 4,
      featured: false
    },
    { 
      name: "Run your own PDS Server", 
      url: "https://www.youtube.com/watch?v=7-VJvf39xVE&t=4s", 
      category: "Guides",
      subcategory: "Documentation",
      description: "How to run your own Bluesky PDS Server", 
      domain: "youtube.com",
      quality: 4,
      featured: false
    },
    
    // Miscellaneous
    { 
      name: "Thread Composer", 
      url: "https://bluesky-thread-composer.pages.dev", 
      category: "Misc",
      subcategory: "Tools",
      description: "Create and organize threads", 
      domain: "pages.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Skyview", 
      url: "https://skyview.social", 
      category: "Misc",
      subcategory: "Tools",
      description: "Share threads with people without an account", 
      domain: "skyview.social",
      quality: 4,
      featured: false
    },
    { 
      name: "down.blue", 
      url: "https://down.blue", 
      category: "Misc",
      subcategory: "Tools",
      description: "Video downloader", 
      domain: "down.blue",
      quality: 3,
      featured: false
    },
    { 
      name: "iOS Shortcuts Collection", 
      url: "https://matthewcassinelli.com/shortcuts/folders/bluesky/", 
      category: "Misc",
      subcategory: "Tools",
      description: "Useful iOS shortcuts for Bluesky", 
      domain: "matthewcassinelli.com",
      quality: 3,
      featured: false
    },
    { 
      name: "Bookmarks/Drafts Workaround", 
      url: "https://bsky.app/profile/dame.bsky.social/post/3lb5wrehvdc2g", 
      category: "Misc",
      subcategory: "Tools",
      description: "Workaround for saving bookmarks/drafts", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "cobalt.tools", 
      url: "https://cobalt.tools", 
      category: "Misc",
      subcategory: "Tools",
      description: "Media saver", 
      domain: "cobalt.tools",
      quality: 3,
      featured: false
    },
    { 
      name: "Social Profile Widget Generator", 
      url: "https://bsky-widget.srbh.dev", 
      category: "Misc",
      subcategory: "Tools",
      description: "Generate profile widgets", 
      domain: "srbh.dev",
      quality: 3,
      featured: false
    },
    { 
      name: "Bluesky Lore", 
      url: "https://bsky.app/profile/jay.bsky.team/post/3lbd2eaura22r", 
      category: "Misc",
      subcategory: "Tools",
      description: "Bluesky lore, as told by Jay", 
      domain: "bsky.app",
      quality: 3,
      featured: false
    },
    { 
      name: "The Fediverse Report", 
      url: "https://fediversereport.com", 
      category: "Misc",
      subcategory: "Tools",
      description: "Bluesky and ATmosphere newsletter", 
      domain: "fediversereport.com",
      quality: 3,
      featured: false
    }
  ];

  // Add UTM parameters to all URLs
  const resourcesWithUTM = resourcesData.map(resource => ({
    ...resource,
    url: `${resource.url}${resource.url.includes('?') ? '&' : '?'}utm_source=cred.blue&utm_medium=resources&utm_campaign=tools_directory`
  }));

  // Function to share the resources page on Bluesky
  const shareOnBluesky = () => {
    const shareText = `Check out this collection of Bluesky tools and resources from cred.blue! 🔧🦋\n\nFind analytics, feeds, alternative clients, and much more to enhance your Bluesky experience.\n\nExplore the tools: https://cred.blue/resources`;
    
    window.open(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  // Get all categories
  const categories = ['All', ...new Set(resourcesWithUTM.map(item => item.category))];

  // Filter resources based on active category, search query, and quality filter
  const filteredResources = useMemo(() => {
    return resourcesWithUTM.filter(resource => {
      // Filter by category
      const categoryMatch = activeCategory === 'All' || resource.category === activeCategory;
      
      // Filter by search query
      const searchMatch = 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.domain && resource.domain.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by quality
      const qualityMatch = 
        qualityFilter === 'All' || 
        (qualityFilter === 'High' && resource.quality >= 4) ||
        (qualityFilter === 'Medium' && resource.quality === 3) ||
        (qualityFilter === 'Low' && resource.quality <= 2);
      
      return categoryMatch && searchMatch && qualityMatch;
    });
  }, [resourcesWithUTM, activeCategory, searchQuery, qualityFilter]);

  // Get featured resources
  const featuredResources = useMemo(() => {
    return resourcesWithUTM.filter(resource => resource.featured);
  }, [resourcesWithUTM]);
  
  // Should show featured section only when All category is selected
  const shouldShowFeatured = activeCategory === 'All';
  
  // Simulate loading data
  useEffect(() => {
    // Simulate API fetch with a timeout
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(loadTimer);
  }, []);

  return (
    <>
      <main className="resources-page">
       <div className="alt-card">
        <div className="resources-header">
          <h1>Bluesky Resources</h1>
          <ul>
            <li>Find tools to enhance your Bluesky experience.</li>
            <li>Discover analytics, feeds, clients, and more.</li>
            <li>Explore community-built solutions.</li>
          </ul>
          <p className="resources-description">A curated collection of third-party tools, services, and guides for the Bluesky ecosystem</p>
          
          <div className="share-button-container">
            <button
              className="share-button"
              type="button"
              onClick={shareOnBluesky}
            >
              Share This Page
            </button>
          </div>
        </div>
        
        <div className="resources-disclaimer">
          <p><strong>Disclaimer:</strong> These resources are third-party tools and services not affiliated with cred.blue or Bluesky. 
          Use them at your own risk and exercise caution when providing access to your data.</p>
        </div>
        
        {isLoading ? (
          <ResourceLoader />
        ) : (
        <>
        <div className="resources-filters">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search resources..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-options">
            <div className="category-filters-container">
              <div className="category-filters">
                {categories.map(category => (
                  <button 
                    key={category}
                    className={`category-filter ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {categoryEmojis[category]} {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="quality-filter">
              <select 
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value)}
                className="quality-select"
              >
                <option value="All">All Quality Levels</option>
                <option value="High">High Quality</option>
                <option value="Medium">Medium Quality</option>
                <option value="Low">Low Quality</option>
              </select>
            </div>
          </div>
        </div>
        
        {shouldShowFeatured && featuredResources.length > 0 && (
          <div className="featured-section">
            <h2>Featured Resources</h2>
            <p className="featured-description">Hand-selected tools that we love and use regularly. These are not sponsored or paid placements.</p>
            <div className="resources-grid">
              {featuredResources.map((resource, index) => (
                <ResourceCard key={`featured-${index}`} resource={resource} />
              ))}
            </div>
          </div>
        )}
        
        <div className="all-resources-section">
          <h2>{activeCategory === 'All' ? 'All Resources' : `${categoryEmojis[activeCategory]} ${activeCategory} Resources`}</h2>
          {filteredResources.length > 0 ? (
            <div className="resources-grid">
              {filteredResources.map((resource, index) => (
                <ResourceCard key={index} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No resources found matching your filters.</p>
            </div>
          )}
        </div>
        </>
        )}
       </div>
      </main>
    </>
  );
};

// ResourceCard component for displaying individual resources
const ResourceCard = ({ resource }) => {
  // Function to render stars based on quality rating
  const renderQualityStars = (quality) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`quality-star ${i <= quality ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <a 
      href={resource.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="resource-card"
    >
      <div className="resource-content">
        <h3 className="resource-name">{resource.name}</h3>
        <p className="resource-description">{resource.description}</p>
        <p className="resource-domain">{resource.domain}</p>
        <div className="resource-meta">
          <span className="resource-category">{resource.category}</span>
          <div className="resource-quality">
            {renderQualityStars(resource.quality)}
          </div>
        </div>
      </div>
    </a>
  );
};

export default Resources;