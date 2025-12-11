import React, { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchMusic = async () => {
    if (!query) return;
    setLoading(true);
    setSelected(null);

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          query
        )}&media=music&limit=20&country=jp`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">音楽検索アプリ（日本の曲限定）</h1>

      {/* 検索欄 */}
      <div className="flex gap-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="例：ずっと真夜中でいいのに"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={searchMusic}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          検索
        </button>
      </div>

      {loading && <p>検索中...</p>}

      {/* 詳細 */}
      {selected && (
        <div className="p-4 border rounded-lg shadow">
          <h2 className="text-xl font-semibold">詳細</h2>
          <img
            src={selected.artworkUrl100}
            alt="art"
            className="rounded my-2"
          />
          <p>曲名：{selected.trackName}</p>
          <p>アーティスト：{selected.artistName}</p>
          <p>アルバム：{selected.collectionName}</p>
          <audio controls src={selected.previewUrl} className="mt-2" />

          <button
            className="mt-3 px-3 py-2 bg-gray-300 rounded"
            onClick={() => setSelected(null)}
          >
            戻る
          </button>
        </div>
      )}

      {/* 検索結果 */}
      {!selected && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map((item) => (
            <div
              key={item.trackId}
              className="border rounded-lg p-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => setSelected(item)}
            >
              <img src={item.artworkUrl100} alt="art" className="rounded" />
              <p className="font-semibold mt-2">{item.trackName}</p>
              <p className="text-sm text-gray-600">{item.artistName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
