// App.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [tracks, setTracks] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // ===== 追加：お気に入り（localStorage） =====
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ===== 追加：検索履歴（localStorage） =====
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("searchHistory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const ITEMS_PER_PAGE = 20;
  const HISTORY_LIMIT = 8;

  // localStorageへ同期（安全のためuseEffectでまとめて管理）
  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    } catch {}
  }, [searchHistory]);

  const addToHistory = (term) => {
    const t = (term || "").trim();
    if (!t) return;
    setSearchHistory((prev) => {
      const updated = [t, ...prev.filter((x) => x !== t)].slice(0, HISTORY_LIMIT);
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const isFavorite = (trackId) => favorites.some((f) => f.trackId === trackId);

  const toggleFavorite = (track) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.trackId === track.trackId);
      if (exists) return prev.filter((f) => f.trackId !== track.trackId);

      // 保存する情報を必要最低限に（容量節約）
      const slim = {
        trackId: track.trackId,
        trackName: track.trackName,
        artistName: track.artistName,
        artworkUrl100: track.artworkUrl100,
        previewUrl: track.previewUrl,
      };
      return [slim, ...prev];
    });
  };

  const searchArtists = async (termOverride) => {
    const term = (termOverride ?? query).trim();
    if (!term) return;

    // 履歴追加
    addToHistory(term);

    setLoading(true);
    setSelectedArtist(null);
    setTracks([]);
    setResults([]);

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          term
        )}&media=music&entity=musicArtist&attribute=artistTerm&limit=25&country=jp`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTracks = async (artistName) => {
    setLoading(true);
    setSelectedArtist(artistName);
    setCurrentPage(1);
    setTracks([]);

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
    } finally {
      setLoading(false);
    }
  };

  const paginatedTracks = useMemo(() => {
    return tracks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [tracks, currentPage]);

  const totalPages = Math.max(1, Math.ceil(tracks.length / ITEMS_PER_PAGE));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">音楽検索アプリ（日本のアーティスト対応）</h1>

      {/* 検索欄 */}
      <div className="flex gap-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="例：ZUTOMAYO, 米津玄師, Aimer など"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchArtists();
          }}
        />
        <button
          onClick={() => searchArtists()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          検索
        </button>
      </div>

      {/* 検索履歴 */}
      {searchHistory.length > 0 && (
        <div className="border rounded p-3 space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">検索履歴</h2>
            <button onClick={clearHistory} className="text-sm underline">
              履歴をクリア
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {searchHistory.map((h) => (
              <button
                key={h}
                onClick={() => {
                  setQuery(h);
                  searchArtists(h);
                }}
                className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                title="クリックで再検索"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* お気に入り */}
      <div className="border rounded p-3 space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">お気に入り（{favorites.length}）</h2>
          {favorites.length > 0 && (
            <button onClick={clearFavorites} className="text-sm underline">
              お気に入りを全削除
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          <p className="text-sm text-gray-600">曲一覧で「☆ お気に入り」を押すとここに保存されます。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favorites.map((f) => (
              <div key={f.trackId} className="border p-3 rounded">
                <img src={f.artworkUrl100} className="rounded" />
                <p className="font-semibold mt-2">{f.trackName}</p>
                <p className="text-sm text-gray-600">{f.artistName}</p>

                <div className="flex gap-2 items-center mt-2">
                  <button
                    onClick={() => toggleFavorite(f)}
                    className="text-sm px-2 py-1 bg-yellow-200 rounded hover:bg-yellow-300"
                  >
                    ★ 解除
                  </button>
                  {f.previewUrl && <audio controls src={f.previewUrl} className="w-full" />}
                </div>
              </div>
            ))}
          </div>
        )}
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
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                前へ
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          )}

          {/* トラック表示 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paginatedTracks.map((track) => {
              const fav = isFavorite(track.trackId);
              return (
                <div key={track.trackId} className="border p-3 rounded">
                  <img src={track.artworkUrl100} className="rounded" />
                  <p className="font-semibold mt-2">{track.trackName}</p>
                  <p className="text-sm text-gray-600">{track.artistName}</p>

                  <button
                    onClick={() => toggleFavorite(track)}
                    className="text-sm mt-1 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    {fav ? "★ お気に入り解除" : "☆ お気に入り"}
                  </button>

                  {track.previewUrl ? (
                    <audio controls src={track.previewUrl} className="mt-2 w-full" />
                  ) : (
                    <p className="text-sm text-gray-600 mt-2">試聴URLがありません</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* ページ下部のページネーション */}
          {tracks.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                前へ
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
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
              setResults([]);
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

