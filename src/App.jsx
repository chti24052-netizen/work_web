import React, { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [artistResults, setArtistResults] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  // ひらがな → カタカナ変換（安全版）
  const toKatakana = (str) => {
    return str.replace(/[ぁ-ん]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0x60)
    );
  };

  const searchArtist = async () => {
    if (!query) return;
    setLoading(true);
    setArtistResults([]);
    setSongs([]);

    const keyword = toKatakana(query);

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          keyword
        )}&entity=musicArtist&country=jp&limit=10`
      );
      const data = await res.json();
      setArtistResults(data.results || []);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  // アーティストの全曲取得
  const loadAllSongs = async (artistId, artistName) => {
    setLoading(true);
    setSelectedArtist(artistName);

    try {
      const res = await fetch(
        `https://itunes.apple.com/lookup?id=${artistId}&entity=song&country=jp&limit=200`
      );
      const data = await res.json();
      setSongs(data.results.slice(1)); // 0番目はアーティスト情報なので切る
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">日本アーティスト全曲検索アプリ</h1>

      {/* 検索欄 */}
      <div className="flex gap-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="アーティスト名（例：ずっと真夜中でいいのに）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={searchArtist}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          検索
        </button>
      </div>

      {loading && <p>検索中...</p>}

      {/* アーティスト候補 */}
      {!loading && artistResults.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">アーティスト候補</h2>
          {artistResults.map((a) => (
            <div
              key={a.artistId}
              className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => loadAllSongs(a.artistId, a.artistName)}
            >
              <p className="text-lg font-semibold">{a.artistName}</p>
            </div>
          ))}
        </div>
      )}

      {/* 曲一覧 */}
      {selectedArtist && songs.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">{selectedArtist} の曲一覧</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {songs.map((song) => (
              <div
                key={song.trackId}
                className="border p-3 rounded hover:bg-gray-100"
              >
                <img
                  src={song.artworkUrl100}
                  alt="art"
                  className="rounded"
                />
                <p className="font-semibold mt-2">{song.trackName}</p>
                <p className="text-sm text-gray-600">{song.collectionName}</p>
                <audio controls src={song.previewUrl} className="mt-2" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
