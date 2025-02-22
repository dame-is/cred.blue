# cred.blue

- Generate a Bluesky score. 
- Understand your AT Proto data footprint. 
- Vibe check strangers and new accounts.

## About

The **cred.blue** platform allows anyone to better understand the data footprint that an **AT Protocol** or **Bluesky** identity is creating. During its beta launch, **cred.blue** provides an early version of its custom scoring algorithm that generates a score based on an identity's activity in the ecosystem. Additionally, there is an **Alt Text Rating Tool** that allows you to see how consistently an account includes accessibility alt-text when posting images on Bluesky.

The **cred.blue** scoring methodology is intended to provide a helpful contextual analysis of the public data associated with an AT Protocol or Bluesky identity. The hope is that the scoring system might help incentivize healthier behaviors and activity patterns on the network.

Future versions of cred.blue may include authenticated data analysis (for your personal AT Proto data that isn't public), a custom score/tracking lexicon, and an in-app labeler for the Bluesky platform.

## The Scoring Methodology

Your cred.blue score is generated based on two major categories...

1. Bluesky Data
- Profile content (avatar, description, etc)
- Posts, likes, lists, etc
- Social graph
- Labelers and moderation
- etc.

2. AT Protocol Data
- Personal Data Server (PDS)
- Third-party lexicon usage
- Domain name
- PLC logs
- etc.

Seperate scores are generated for each category and then combined to produce your final cred.blue score, allowing you to easily see which major category (Bluesky vs AT Proto) has the most impact on your score.

For Version 1 of the scoring algorithm, there is a max score of 1,000 points. This may change in the future, or it could theoritically even be scaled down depending on feedback and usage.

A score between 0-300 likely indicates that an account is either very new to the network or isn't very active. A score of 300-700 is within a "healthy" range. Scores that are 700+ typically indicate accounts that have been around awhile and are very active. The different score ranges are still in early development along with the algorithm, so these details are likely to change.

### What are the different social statuses?

Rather than displaying follower counts on profiles, the cred.blue analysis categorizes each identity into one of four social statuses base on its follower count, social graph ratio, engagement rate, and age. There are additional labels placed before the social status to indicate how engaging the account actually is.

1. Newcomer
2. Explorer
3. Pathfinder
4. Guide
5. Leader

### How do I increase my score?

The scoring methodology is fairly complex and not all of the variables can be easily changed (for instance, an account's age), but there are some specific actions you can take that can help give you a boost.

1. Fully complete your Bluesky profile
2. Focus on posting things people will enjoy or find helpful.
3. Use more of Bluesky's features
4. Add a custom domain name
5. Use a third-party PDS
6. Remember to add alt text to images
7. Add your own rotation key
8. Set your pronouns

This is not an exhaustive list by any means, but it should get you started. The goal of the cred.blue score isn't to attempt to max it out... rather, the point is to foster healthy behavior andn activity that benefits the entire community.

## FAQs

### Who created cred.blue?

It was created by [@dame.is](https://bsky.app/profile/dame.is)! Dame has been a part of the Bluesky community from almost the very beginning and is passionate about the AT Protocol. Dame was Bluesky user #1,216 and is building cred.blue independently.

### Why was cred.blue created?

Since its inception, Bluesky has relied upon an innovative domain verification system to help identities establish their and authority. This system is powerful and should be taken advantage of, but it can only do so much in its current form. The cred.blue platform is just one experiment among many that is attempting to help people understand which social media accounts are more (or less) trustworthy.

### Is this just a social credit score like they have in China?

Not at all! To begin with, the often imagined "social credit" system that many people think exists in China is not really real... to better understand the prevelant misconceptions people have about this subject, check out [the Wikipedia article](https://en.wikipedia.org/wiki/Social_Credit_System).

At its core, the cred.blue scoring system is just an attempt to help people understand the data footprint that is being left behind by every Bluesky or AT Protocol identity. In a world saturated in fake profiles or AI-controlled accounts, it's never been more vital to have resources that can help humans effectively and safely navigate their online spaces.

### Why is cred.blue in a "beta" state?

To put it simply, cred.blue is very experimental and at this early stage things will likely change a lot. The first version of the scoring algorithm lays a foundation for future plans, but it will take some time (and real-world usage) to calibrate the model's weights and variables.