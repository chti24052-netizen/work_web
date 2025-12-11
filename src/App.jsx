import React, { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const ITEMS_PER_PAGE = 20;

  const searchArtists = async () => {
    if (!query) return;
    setLoading(true);
    setSelectedArtist(null);
    setTracks([]);

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          query
        )}&media=music&entity=musicArtist&attribute=artistTerm&limit=25&country=jp`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  const loadTracks = async (artistName) => {
    setLoading(true);
    setSelectedArtist(artistName);
    setCurrentPage(1);

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          artistName
        )}&media=music&entity=song&country=jp&limit=200`
      );
      const data = await res.json();
      setTracks(data.results || []);
    } catch (e) {
      console.error(e);
      setTracks([]);
    }

    setLoading(false);
  };

  const paginatedTracks = tracks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(tracks.length / ITEMS_PER_PAGE);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">音楽検索アプリ（日本のアーティスト対応）</h1>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="例：ZUTOMAYO, 米津玄師, Aimer など"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={searchArtists}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          検索
        </button>
      </div>

      {loading && <p>検索中...</p>}

      {/* アーティスト候補表示 */}
      {!loading && !selectedArtist && results.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">アーティスト候補</h2>
          {results.map((artist) => (
            <div
              key={artist.artistId}
              className="border p-3 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => loadTracks(artist.artistName)}
            >
              {artist.artistName}
            </div>
          ))}
        </div>
      )}

      {/* 曲一覧 */}
      {selectedArtist && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{selectedArtist} の曲一覧</h2>

          {tracks.length === 0 && !loading && (
            <p>このアーティストの曲データは見つかりませんでした。</p>
          )}

          {/* ページ上部のページネーション */}
          {tracks.length > 0 && (
            <div className="flex justify-between items-center">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                前へ
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          )}

          {/* トラック表示 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paginatedTracks.map((track) => (
              <div key={track.trackId} className="border p-3 rounded">
                <img src={track.artworkUrl100} className="rounded" />
                <p className="font-semibold mt-2">{track.trackName}</p>
                <audio controls src={track.previewUrl} className="mt-2" />
              </div>
            ))}
          </div>

          {/* ページ下部のページネーション */}
          {tracks.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                前へ
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setSelectedArtist(null);
              setTracks([]);
            }}
            className="mt-4 px-4 py-2 bg-gray-400 rounded"
          >
            ← アーティスト一覧へ戻る
          </button>
        </div>
      )}
    </div>
  );
}
