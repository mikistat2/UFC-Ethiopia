import React, { useState, useEffect } from 'react';
import { postComment, getCommentsByEvent, likeComment } from '../api';
import socket from '../socket';

const defaultProfile = 'https://ui-avatars.com/api/?name=User&background=333&color=fff&size=64';

// Generate a random color for avatar background
function getRandomColor(nickname) {
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'FF1744','D500F9','2979FF','00E676','FFD600','FF9100','FF3D00','C51162','00B8D4','00C853',
    'FFEA00','FF6D00','AEEA00','6200EA','304FFE','00BFAE','FF5252','FF4081','536DFE','69F0AE'
  ];
  return colors[Math.abs(hash) % colors.length];
}

function getProfileUrl(nickname) {
  const bg = getRandomColor(nickname);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname)}&background=${bg}&color=fff&size=64`;
}

const getSelectedEvent = () => ({
  id: localStorage.getItem('ufc_selected_event_id') || '',
  name: localStorage.getItem('ufc_selected_event_name') || '',
});

const WatchPage = () => {
  const selectedEvent = getSelectedEvent();
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const nickname = localStorage.getItem('ufc_nickname') || '';
  const userId = localStorage.getItem('ufc_user_id') || '';
  const [liked, setLiked] = useState({});

  // Fetch last 10 comments
  useEffect(() => {
    async function fetchComments() {
      if (selectedEvent.id) {
        try {
          const dbComments = await getCommentsByEvent(selectedEvent.id);
          setComments(dbComments.map(c => ({
            id: c.id,
            name: c.nickname,
            text: c.body,
            likes: c.like_count || 0,
            profile: getProfileUrl(c.nickname),
            likedBy: []
          })));
        } catch {
          setComments([]);
        }
      }
    }
    fetchComments();

    socket.on('new-comment', (comment) => {
      if (comment.eventId === selectedEvent.id) {
        setComments(prev => [
          ...prev,
          {
            id: comment.id || Date.now(),
            name: comment.nickname,
            text: comment.body,
            likes: 0,
            profile: getProfileUrl(comment.nickname),
            likedBy: []
          }
        ]);
      }
    });
    return () => socket.off('new-comment');
  }, [selectedEvent.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && nickname && userId && selectedEvent.id && selectedEvent.name) {
      try {
        await postComment(userId, selectedEvent.id, selectedEvent.name, nickname, input.trim());
        setInput('');
      } catch {
        alert('Failed to post comment.');
      }
    }
  };

  const handleLike = async (commentId) => {
    const user = nickname || 'Anonymous';
    setComments(comments =>
      comments.map(c => {
        if (c.id !== commentId) return c;
        if (c.likedBy.includes(user)) {
          likeComment(commentId, 'unlike');
          return { ...c, likedBy: c.likedBy.filter(n => n !== user) };
        } else {
          likeComment(commentId, 'like');
          return { ...c, likedBy: [...c.likedBy, user] };
        }
      })
    );
  };

  useEffect(() => {
    socket.on('like-count-update', ({ commentId, like_count }) => {
      setComments(comments =>
        comments.map(c =>
          c.id === commentId ? { ...c, likes: like_count } : c
        )
      );
    });
    return () => socket.off('like-count-update');
  }, []);

  return (
    <div className="w-full mx-auto py-4 px-3 flex flex-col min-h-screen">
      {/* Event title */}
      {selectedEvent.name && (
        <div className="mb-4 text-center">
          <h1 className="text-2xl md:text-3xl font-headline text-ufcRed">{selectedEvent.name}</h1>
          <p className="text-sm md:text-lg text-gray-300">Event ID: {selectedEvent.id}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 h-full w-full">
        {/* Video player - takes more space */}
        <div className="bg-black rounded-xl shadow-lg flex items-center justify-center w-full lg:w-3/4 aspect-video">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/JcALYkho0lA"
            title="UFC Live Stream"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-xl"
          ></iframe>
        </div>

        {/* Comments panel - smaller */}
  <div className="bg-white rounded-xl shadow p-2 md:p-3 flex flex-col w-full lg:w-[calc(25%+80px)] h-auto">
          <h2 className="text-lg md:text-xl font-bold mb-2 text-ufcRed">Comments</h2>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
            <input style = {{color: "black"}}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder={nickname ? `Comment as ${nickname}` : 'Sign up to comment'}
              required
              disabled={!nickname}
            />
            <button
              type="submit"
              className="bg-ufcRed text-white px-3 py-1 rounded text-sm"
              disabled={!nickname}
            >
              Post
            </button>
          </form>
          <ul className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
            {[...comments.slice(-9)].reverse().map((comment) => (
              <li key={comment.id} className="border-b pb-2 text-gray-800 flex items-start gap-2">
                <img src={comment.profile} alt={comment.name} className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-ufcRed break-all text-xs md:text-sm">{comment.name}</span>
                    <button
                      className={`ml-auto flex items-center gap-1 px-1 py-0.5 rounded text-xs ${comment.likedBy.includes(nickname) ? 'text-ufcRed' : 'text-gray-600 hover:text-ufcRed'}`}
                      onClick={() => handleLike(comment.id)}
                      aria-label="Like"
                      disabled={!nickname}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="12" height="12"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656l-6.364 6.364a2 2 0 01-2.828 0l-6.364-6.364a4 4 0 010-5.656z"/></svg>
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap break-words leading-snug text-xs md:text-sm">{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
