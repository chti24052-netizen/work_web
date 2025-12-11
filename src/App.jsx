{selectedArtist && (
  <div>
    <h2 className="text-2xl font-bold mb-4">{selectedArtist} の曲一覧</h2>

    {/* ⭐ 上のページネーション */}
    <div className="flex justify-between mb-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
      >
        ← 前へ
      </button>

      <p>
        {page} / {Math.ceil(songs.length / songsPerPage)}
      </p>

      <button
        disabled={end >= songs.length}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
      >
        次へ →
      </button>
    </div>

    {/* 曲一覧 */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {visibleSongs.map((song) => (
        <div key={song.trackId} className="border p-3 rounded">
          <img src={song.artworkUrl100} alt="" className="rounded" />
          <p className="font-semibold mt-2">{song.trackName}</p>
          <p className="text-sm text-gray-600">{song.collectionName}</p>
          <audio controls src={song.previewUrl} className="mt-2" />
        </div>
      ))}
    </div>

    {/* ⭐ 下のページネーション（今まで通り） */}
    <div className="flex justify-between mt-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
      >
        ← 前へ
      </button>

      <p>
        {page} / {Math.ceil(songs.length / songsPerPage)}
      </p>

      <button
        disabled={end >= songs.length}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
      >
        次へ →
      </button>
    </div>
  </div>
)}
