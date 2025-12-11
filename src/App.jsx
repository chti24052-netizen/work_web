import React, { useState } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [artistResults, setArtistResults] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  // ページング用
  const [page, setPage] = useState(1);
  const songsPerPage = 20;

  // ひらがな・ローマ字 → カタカナ変換
  const toKatakana = (str) => {
    return str
      .replace(/[ぁ-ん]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60))
      .replace(/([a-zA-Z]+)/g, (r) =>
        r
          .toLowerCase()
          .replace(/tu/g, "ツ")
          .replace(/zu/g, "ズ")
      );
  };

  // アーティスト検索
  const searchArtist = async () => {
    if (!query) return;
    setLoading(true);
    setArtistResults([]);
    setSongs([]);
    setSelectedArtist(null);
    setPage(1);

    const keyword = toKatakana(query);

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          keyword
        )}&entity=musicArtist&country=jp&limit=5`
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
    setPage(1);

    try {
      const res = await fetch(
        `https://itunes.apple.com/lookup?id=${artistId}&entity=song&country=jp&limit=200`
      );
      const data = await res.json();

      // data.results[0] はアーティスト情報なので除外
      const allSongs = data.results.slice(1);

      setSongs(allSongs);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  // ページング
  const start = (page - 1) * songsPerPage;
  const end = start + songsPerPage;
  const paginatedSongs = songs.slice(start, end);
  const totalPages = Math.ceil(songs.length / songsPerPage);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">日本アーティスト全曲検索アプリ</h1>

      {/* 検索欄 */}
      <div className="flex gap-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="アーティスト名を入力（例：ずとまよ）"
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
      {!loading && artistResults.length > 0 && !selectedArtist && (
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
          <h2 className="text-2xl font-bold mb-4">
            {selectedArtist} の曲一覧（{songs.length} 曲）
          </h2>

          {/* ページボタン（上） */}
          <div className="flex justify-between mb-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              ← 前へ
            </button>

            <span className="font-semibold">
              {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              次へ →
            </button>
          </div>

          {/* 曲20件 */}
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

          {/* ページボタン（下） */}
          <div className="flex justify-between mt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              ← 前へ
            </button>

            <span className="font-semibold">
              {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              次へ →
            </button>
          </div>
        </div>
      )}

      {/* 曲が見つからない場合 */}
      {selectedArtist && songs.length === 0 && !loading && (
        <p className="text-red-500 font-semibold">
          このアーティストの曲データは見つかりませんでした。
        </p>
      )}
    </div>
  );
}

export default App;
