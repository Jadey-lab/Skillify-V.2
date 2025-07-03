// Spotify.js
import React, { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const Spotify = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  
  // Initialize Spotify Web API
  const spotifyApi = new SpotifyWebApi();

  useEffect(() => {
    // Retrieve the access token from the URL (after redirect from Spotify login)
    const token = new URLSearchParams(window.location.hash).get('access_token');
    if (token) {
      setAccessToken(token);
      spotifyApi.setAccessToken(token);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      // Fetch user's playlists
      spotifyApi.getUserPlaylists().then((data) => {
        setPlaylists(data.items);
      });
    }
  }, [accessToken]);

  return (
    <div>
      <h1>Your Spotify Playlists</h1>
      {accessToken ? (
        <div>
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                  {playlist.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button onClick={() => window.location.href = 'https://accounts.spotify.com/authorize?client_id=YOUR_SPOTIFY_CLIENT_ID&response_type=token&redirect_uri=YOUR_REDIRECT_URI&scope=user-library-read user-read-playback-state'}>Login with Spotify</button>
      )}
    </div>
  );
};

export default Spotify;
