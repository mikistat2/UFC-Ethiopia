import React, { useState } from 'react';


const defaultProfile = 'https://ui-avatars.com/api/?name=User&background=333&color=fff&size=64';

const WatchPage = () => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const nickname = localStorage.getItem('ufc_nickname') || '';
  const [liked, setLiked] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && nickname) {
      setComments([
        ...comments,
        {
          name: nickname,
          text: input.trim(),
          likes: 0,
          profile: defaultProfile.replace('User', encodeURIComponent(nickname)),
          likedBy: []
        }
      ]);
      setInput('');
    }
  };

  const handleLike = idx => {
    const user = nickname || 'Anonymous';
    setComments(comments =>
      comments.map((c, i) => {
        if (i !== idx) return c;
        if (c.likedBy.includes(user)) {
          // Unlike
          return { ...c, likes: c.likes - 1, likedBy: c.likedBy.filter(n => n !== user) };
        } else {
          // Like
          return { ...c, likes: c.likes + 1, likedBy: [...c.likedBy, user] };
        }
      })
    );
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-4 px-2 flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full">
        <div className="flex-[3] aspect-video bg-black rounded-xl shadow-lg flex items-center justify-center mb-4 md:mb-0 p-1">
          {/* Replace with actual video player */}
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/JcALYkho0lA"
            title="UFC Live Stream"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-xl"
            style={{ minHeight: '400px', maxHeight: '80vh' }}
          ></iframe>
        </div>
        <div
          className="bg-white rounded-xl shadow p-3 md:p-4 flex flex-col min-w-[260px] max-w-[350px] h-full md:h-auto self-start md:self-stretch w-full md:w-auto"
          style={{ marginRight: '8px' }}
        >
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-ufcRed">Comments</h2>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <input style={{ color: 'black' }}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1"
              placeholder={nickname ? `Comment as ${nickname}` : 'Sign up to comment'}
              required
              disabled={!nickname}
            />
            <button type="submit" className="bg-ufcRed text-white px-3 py-1 rounded" disabled={!nickname}>Post</button>
          </form>
          <ul className="space-y-2">
            {[...comments.slice(-9)].reverse().map((comment, idx, arr) => {
              const commentIndex = comments.length - 1 - idx;
              return (
                <li key={idx} className="border-b pb-2 text-gray-800 flex items-start gap-3">
                  <img src={comment.profile} alt={comment.name} className="w-9 h-9 rounded-full border border-gray-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-ufcRed break-all">{comment.name}</span>
                      <button
                        className={`ml-auto flex items-center gap-1 px-2 py-1 rounded text-sm ${comment.likedBy.includes(nickname) ? 'text-ufcRed' : 'text-gray-600 hover:text-ufcRed'}`}
                        onClick={() => handleLike(commentIndex)}
                        aria-label="Like"
                        disabled={!nickname}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="16" height="16"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656l-6.364 6.364a2 2 0 01-2.828 0l-6.364-6.364a4 4 0 010-5.656z"/></svg>
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap break-words leading-snug text-sm md:text-base">{comment.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .md\\:flex-row {
            flex-direction: column !important;
          }
          .md\\:mb-0 {
            margin-bottom: 0 !important;
          }
          .md\\:self-stretch {
            align-self: stretch !important;
          }
          .md\\:w-auto {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WatchPage;
