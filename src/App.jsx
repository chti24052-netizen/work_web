import React, { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [artistResults, setArtistResults] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  // ページネーション用
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; // 1ページ20曲

  // ひらがな → カタカナ変換
  const toKatakana = (str) =>
    str.replace(/[ぁ-ん]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0x60)
    );

  // アーティスト検索
  const searchArtist = async () => {
    if (!query) return;
    setLoading(true);
    setArtistResults([]);
    setSongs([]);
    setSelectedArtist(null);
    setCurrentPage(1);

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

  // 曲取得（artistNameで検索）
  const loadAllSongs = async (artistName) => {
    setLoading(true);
    setSongs([]);
    setSelectedArtist(artistName);
    setCurrentPage(1);

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          artistName
        )}&country=jp&entity=song&attribute=artistTerm&limit=200`
      );
      const data = await res.json();
      setSongs(data.results || []);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  // ページに応じた曲リストを返す
  const paginatedSongs = songs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(songs.length / pageSize);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">日本アーティスト全曲検索アプリ</h1>

      {/* 検索欄 */}
      {!selectedArtist && (
        <div className="flex gap-2">
          <input
            className="border p-2 rounded w-full"
            placeholder="アーティスト名（例：ずとまよ）"
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
      )}

      {loading && <p>検索中...</p>}

      {/* 戻るボタン */}
      {selectedArtist && (
        <button
          onClick={() => {
            setSelectedArtist(null);
            setSongs([]);
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-gray-300 rounded"
        >
          ← 戻る
        </button>
      )}

      {/* アーティスト候補 */}
      {!loading && !selectedArtist && artistResults.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">アーティスト候補</h2>
          {artistResults.map((a) => (
            <div
              key={a.artistId}
              className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => loadAllSongs(a.artistName)}
            >
              <p className="text-lg font-semibold">{a.artistName}</p>
            </div>
          ))}
        </div>
      )}

      {/* 曲一覧 */}
      {selectedArtist && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {selectedArtist} の曲一覧（全 {songs.length} 曲）
          </h2>

          {/* 曲が0件 */}
          {songs.length === 0 && !loading && (
            <p className="text-red-500">
              このアーティストの曲データは見つかりませんでした。
            </p>
          )}

          {/* 曲リスト（1ページ分） */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paginatedSongs.map((song) => (
              <div
                key={song.trackId}
                className="border p-3 rounded hover:bg-gray-100"
              >
                <img src={song.artworkUrl100} alt="art" className="rounded" />
                <p className="font-semibold mt-2">{song.trackName}</p>
                <p className="text-sm text-gray-600">{song.collectionName}</p>
                <audio controls src={song.previewUrl} className="mt-2" />
              </div>
            ))}
          </div>

          {/* ページネーション */}
          {songs.length > pageSize && (
            <div className="flex justify-center items-center gap-3 mt-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`px-3 py-2 rounded ${
                  currentPage <= 1
                    ? "bg-gray-300"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                ← 前へ
              </button>

              <span>
                {currentPage} / {totalPages} ページ
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`px-3 py-2 rounded ${
                  currentPage >= totalPages
                    ? "bg-gray-300"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                次へ →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
