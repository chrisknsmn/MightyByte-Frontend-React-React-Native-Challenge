# MightyByte Frontend React Native Web — YouTube Grid Clone

A YouTube-style video grid built with React Native Web, featuring infinite scroll and hover preview functionality.

## Features

- **YouTube-style Grid UI** - Video thumbnails, titles, channel names, and publish dates
- **Hover Preview Popup** - Smooth fade/scale animation on web (thumbnail enlargement)
- **Infinite Scrolling** - Automatically loads more videos using YouTube API's `nextPageToken`
- **Responsive Layout** - Adapts from 1 to 6 columns based on screen width
- **Pure React Native Styling** - Uses only `StyleSheet`, no CSS frameworks
- **Secure API Key Management** - API key stored in localStorage, not committed to repo

## Tech Stack

- React Native Web
- React Query (@tanstack/react-query) for data fetching and infinite scroll
- TypeScript
- YouTube Data API v3

## Project Structure

```
/src
  /api
    youtube.ts          # YouTube API integration
  /components
    EnterApiKey.tsx     # API key input screen
    VideoCard.tsx       # Individual video card with hover preview
  /hooks
    useYoutubeSearch.ts # React Query hook for infinite scroll
  /screens
    Home.tsx           # Main grid screen
  /utils
    env.ts             # API key retrieval utility
    layout.ts          # Responsive column layout hook
  App.tsx              # Root component
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get a YouTube Data API v3 Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API Key)

3. **Run the application:**
   ```bash
   npm start
   ```

4. **Enter your API key:**
   - When the app loads, you'll see a prompt to enter your YouTube API key
   - The key is stored in your browser's localStorage
   - The key is NOT saved to any files in the repository

## Environment Variables

The project includes a `.env.example` file showing the expected format:

```
YT_API_KEY=
```

**IMPORTANT:** Do not commit actual API keys to the repository. The app is designed to accept the API key at runtime via the in-app interface.

## Features Breakdown

### Responsive Grid
- 6 columns: ≥1400px
- 5 columns: ≥1200px
- 4 columns: ≥992px
- 3 columns: ≥768px
- 2 columns: ≥520px
- 1 column: <520px

### Hover Preview
- Shows after 250ms hover delay
- Smooth fade-in (150ms) and scale animation
- Displays enlarged thumbnail with shadow
- Web only (Platform.OS === 'web')

### Infinite Scroll
- Loads 50 videos per page
- Triggers next page at 60% scroll threshold
- Shows loading indicator while fetching
- Uses React Query's `useInfiniteQuery`

## Implementation Notes

This project was created following the MightyByte Frontend Challenge specifications:
- Uses React Native Web for cross-platform compatibility
- Implements infinite scrolling with React Query
- Features hover preview with smooth animations
- Responsive grid layout with breakpoints
- Secure API key handling (localStorage only)
- Pure React Native styling (no external CSS frameworks)

## License

MIT
