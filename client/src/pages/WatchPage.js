import React, { useState, useEffect, useRef } from 'react';
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
  const [likeLoading, setLikeLoading] = useState({}); // { [commentId]: boolean }
  const commentsRef = useRef([]);
  const [input, setInput] = useState('');
  const nickname = localStorage.getItem('ufc_nickname') || '';
  const userId = localStorage.getItem('ufc_user_id') || '';

  // keep ref in sync
  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  // Fetch comments and set up socket listeners (single effect)
  useEffect(() => {
    async function fetchComments() {
      if (selectedEvent.id) {
        try {
          const dbComments = await getCommentsByEvent(selectedEvent.id);
          const mapped = dbComments.map(c => ({
            id: c.id,
            name: c.nickname,
            text: c.body,
            likes: c.like_count || 0,
            profile: getProfileUrl(c.nickname),
            likedBy: []
          }));
          setComments(mapped);
        } catch {
          setComments([]);
        }
      }
    }
    fetchComments();

    const handleNewComment = (comment) => {
      console.log('[SOCKET] new-comment received:', comment);
      if (String(comment.event_id) === String(selectedEvent.id)) {
        setComments(prev => {
          // Find temp comment (optimistic) and real comment (by DB id)
          const tempIdx = prev.findIndex(c => typeof c.id === 'string' && c.text === comment.body && c.name === comment.nickname);
          const realIdx = prev.findIndex(c => c.id === comment.id);
          // If real comment already exists, do nothing
          if (realIdx !== -1) return prev;
          // If temp exists, replace it
          if (tempIdx !== -1) {
            const likedBy = prev[tempIdx].likedBy;
            const newArr = [...prev];
            newArr[tempIdx] = {
              id: comment.id,
              name: comment.nickname,
              text: comment.body,
              likes: comment.like_count || 0,
              profile: getProfileUrl(comment.nickname),
              likedBy
            };
            return newArr;
          }
          // Otherwise, add new comment to top
          return [
            {
              id: comment.id,
              name: comment.nickname,
              text: comment.body,
              likes: comment.like_count || 0,
              profile: getProfileUrl(comment.nickname),
              likedBy: []
            },
            ...prev
          ];
        });
      }
    };
    const handleLikeCountUpdate = ({ commentId, like_count }) => {
      setComments(prev =>
        prev.map(c =>
          c.id === commentId ? { ...c, likes: like_count } : c
        )
      );
    };
    socket.on('new-comment', handleNewComment);
    socket.on('like-count-update', handleLikeCountUpdate);
    return () => {
      socket.off('new-comment', handleNewComment);
      socket.off('like-count-update', handleLikeCountUpdate);
    };
  }, [selectedEvent.id]);

  // instant post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !nickname || !userId || !selectedEvent.id) return;

    const tempId = `temp-${Date.now()}`;
    const tempComment = {
      id: tempId,
      name: nickname,
      text: input.trim(),
      likes: 0,
      profile: getProfileUrl(nickname),
      likedBy: []
    };

    setComments(prev => [tempComment, ...prev]);
    setInput('');

    try {
      await postComment(userId, selectedEvent.id, selectedEvent.name, nickname, input.trim());
    } catch {
      alert('Failed to post comment.');
      setComments(prev => prev.filter(c => c.id !== tempId));
    }
  };

  // Like logic with loading and backend confirmation
  const handleLike = async (commentId) => {
    if (typeof commentId !== 'number' || likeLoading[commentId]) return;
    const user = nickname || 'Anonymous';
    const alreadyLiked = comments.find(c => c.id === commentId)?.likedBy.includes(user);
    setLikeLoading(prev => ({ ...prev, [commentId]: true }));
    try {
      await likeComment(commentId, alreadyLiked ? 'unlike' : 'like');
      // Update likedBy only after backend confirms
      setComments(prev => prev.map(c => {
        if (c.id !== commentId) return c;
        if (alreadyLiked) {
          return { ...c, likedBy: c.likedBy.filter(n => n !== user) };
        } else {
          return { ...c, likedBy: [...c.likedBy, user] };
        }
      }));
    } catch (err) {
      alert('Failed to update like.');
    } finally {
      setLikeLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };


  return (
    <div className="w-full mx-auto py-4 px-3 flex flex-col min-h-screen">
      {selectedEvent.name && (
        <div className="mb-4 text-center">
          <h1 className="text-2xl md:text-3xl font-headline text-ufcRed">{selectedEvent.name}</h1>
          <p className="text-sm md:text-lg text-gray-300">Event ID: {selectedEvent.id}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 h-full w-full">
        {/* Video player */}
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

        {/* Comments */}
        <div className="bg-white rounded-xl shadow p-2 md:p-3 flex flex-col w-full lg:w-[calc(25%+80px)] h-auto">
          <h2 className="text-lg md:text-xl font-bold mb-2 text-ufcRed">Comments</h2>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
            <input
              style={{ color: "black" }}
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
            {[...comments]
              .sort((a, b) => {
                // Sort: real comments by id desc, temp comments (string id) always on top
                if (typeof b.id === 'string' && typeof a.id === 'number') return 1;
                if (typeof a.id === 'string' && typeof b.id === 'number') return -1;
                return (b.id > a.id ? 1 : b.id < a.id ? -1 : 0);
              })
              .slice(0, 9)
              .map((comment) => (
                <li key={comment.id} className="border-b pb-2 text-gray-800 flex items-start gap-2">
                  <img src={comment.profile} alt={comment.name} className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-bold text-ufcRed break-all text-xs md:text-sm">{comment.name}</span>
                      <button
                        className={`ml-auto flex items-center gap-1 px-1 py-0.5 rounded text-xs ${comment.likedBy.includes(nickname) ? 'text-ufcRed' : 'text-gray-600 hover:text-ufcRed'}`}
                        onClick={() => handleLike(comment.id)}
                        aria-label="Like"
                        disabled={!nickname || likeLoading[comment.id]}
                      >
                        {likeLoading[comment.id] ? (
                          <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="12" height="12"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656l-6.364 6.364a2 2 0 01-2.828 0l-6.364-6.364a4 4 0 010-5.656z"/></svg>
                        )}
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
