import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const EventsSection = React.forwardRef(function EventsSection(props, ref) {
  const [mmaEvents, setMmaEvents] = useState([]);
  const [ufcNumber, setUfcNumber] = useState("");
  const [searched, setSearched] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const abortRef = useRef(false);

  const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY; // (public access key only)
  const SPORTSDATA_KEY = process.env.REACT_APP_SPORTSDATAIO_KEY; // from client .env
  // Fallback to known key if env var not injected (ensures functionality even if dev server not restarted)
  const RESOLVED_SPORTSDATA_KEY = (SPORTSDATA_KEY && SPORTSDATA_KEY.trim()) ? SPORTSDATA_KEY.trim() : '38b2281a37454f079a7bc8fc0e4da641';
  const PLACEHOLDER_IMAGE = '/images/caeasel-1.avif';
  if (process.env.NODE_ENV === 'development') {
    // Helpful one-time diagnostics
    if (!window.__ufcEnvLogged) {
  console.log('[EnvCheck] REACT_APP_SPORTSDATAIO_KEY present?', !!SPORTSDATA_KEY, 'Using:', RESOLVED_SPORTSDATA_KEY.slice(0,6)+'...');
      console.log('[EnvCheck] REACT_APP_UNSPLASH_ACCESS_KEY present?', !!UNSPLASH_KEY);
      window.__ufcEnvLogged = true;
    }
  }

  // Simple localStorage cache for event images
  const getCache = () => {
    try { return JSON.parse(localStorage.getItem('ufc_event_img_cache') || '{}'); } catch { return {}; }
  };
  const setCache = (obj) => {
    try { localStorage.setItem('ufc_event_img_cache', JSON.stringify(obj)); } catch {}
  };

  let warnedNoUnsplash = useRef(false);
  function extractUfcNumber(title) {
    if (!title) return null;
    const match = title.match(/UFC\s+(\d{2,4})/i);
    return match ? match[1] : null;
  }

  async function fetchImageForEvent(eventObj) {
    if (!UNSPLASH_KEY) {
      if (!warnedNoUnsplash.current) {
        console.warn('No REACT_APP_UNSPLASH_ACCESS_KEY set. Skipping event image fetching.');
        warnedNoUnsplash.current = true;
      }
      return null;
    }
    if (!eventObj) return null;
    const title = eventObj.title || '';
    const number = extractUfcNumber(title);
    const triedQueries = [];
    const queries = number
      ? [
          `UFC ${number} official poster`,
          `UFC ${number} poster`,
          `UFC ${number}`
        ]
      : [
          `${title} official poster`,
          `${title} poster`,
          title
        ];
    for (const q of queries) {
      triedQueries.push(q);
      const query = encodeURIComponent(q);
      try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=portrait&client_id=${UNSPLASH_KEY}`);
        if (!res.ok) continue;
        const data = await res.json();
        const first = data.results && data.results[0];
        if (first) {
          return {
            url: first.urls?.regular || first.urls?.full || first.urls?.small,
            credit: first.user?.name,
            creditUrl: first.user?.links?.html,
            number: number,
            queryUsed: q
          };
        }
      } catch (e) {
        // try next
      }
    }
    return null;
  }

  async function hydrateImagesForList(listSetter, listGetter) {
    const cache = getCache();
    const list = listGetter();
    // Treat placeholder (current configured placeholder image) or empty as needing fetch
    const need = list.filter(ev => !ev.image || ev.image === PLACEHOLDER_IMAGE);
    if (!need.length) return;
    setImageLoading(true);
    const limited = [...need];
    const CONCURRENCY = 4;
    async function worker() {
      while (limited.length && !abortRef.current) {
        const ev = limited.shift();
        const key = `ev_${ev.id}`;
        if (cache[key]) continue;
        const img = await fetchImageForEvent(ev);
        if (img) {
          // if we have a UFC number, also cache by number for future events with same number reference
          cache[key] = img;
          const num = img.number || extractUfcNumber(ev.title);
            if (num) {
              cache[`num_${num}`] = img;
            }
          setCache(cache);
          // update state list immutably
          listSetter(prev => prev.map(p => p.id === ev.id ? { ...p, image: img.url, imageCredit: img.credit, imageCreditUrl: img.creditUrl } : p));
        } else {
          // Mark that we attempted to fetch to avoid tight loop retries (optional flag)
          cache[key] = { attempted: true };
          setCache(cache);
        }
      }
    }
    const workers = Array.from({ length: Math.min(CONCURRENCY, limited.length) }, () => worker());
    await Promise.all(workers);
    setImageLoading(false);
  }

  // Fetch upcoming UFC events from SportsDataIO on mount
  useEffect(() => {
    async function fetchUpcomingUfcEvents() {
      try {
        const year = new Date().getFullYear();
          if (!RESOLVED_SPORTSDATA_KEY) {
            setError('SportsDataIO key missing. Set REACT_APP_SPORTSDATAIO_KEY in client/.env');
            setLoading(false);
            return;
          }
          const url = `https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/${year}?key=${RESOLVED_SPORTSDATA_KEY}`;
        const res = await axios.get(url);
        const data = res.data;
        const now = new Date();
        const upcoming = Array.isArray(data)
          ? data.filter(ev => {
              if (!ev.DateTime) return false;
              const eventDate = new Date(ev.DateTime);
              return eventDate > now;
            }).map(ev => ({
              id: ev.EventId,
              title: ev.Name,
              date: ev.DateTime,
              location: {
                venue: ev.ShortName || '',
                city: '',
                country: '',
              },
              image: PLACEHOLDER_IMAGE,
              fights: [],
              fightType: '',
              status: ev.Status,
              active: ev.Active,
            }))
          : [];
        // Merge cached images
        const cache = getCache();
        const withCached = upcoming.map(ev => {
          const c = cache[`ev_${ev.id}`];
          return c ? { ...ev, image: c.url, imageCredit: c.credit, imageCreditUrl: c.creditUrl } : ev;
        });
        setMmaEvents(withCached);
        // After setting, fetch missing images
        hydrateImagesForList(setMmaEvents, () => withCached);
        // Save events to backend
        if (withCached.length > 0) {
          fetch('http://localhost:5000/api/save-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: withCached.map(ev => ({ id: ev.id, name: ev.title })) })
          });
        }
      } catch (err) {
        setError('Failed to load events.');
        setMmaEvents([]);
      }
      setLoading(false);
    }

    setLoading(true);
    fetchUpcomingUfcEvents();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearched(true);
    setLoading(true);
    setError(null);

    try {
      const year = new Date().getFullYear();
        if (!RESOLVED_SPORTSDATA_KEY) {
          setError('SportsDataIO key missing. Set REACT_APP_SPORTSDATAIO_KEY in client/.env');
          setLoading(false);
          return;
        }
        const url = `https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/${year}?key=${RESOLVED_SPORTSDATA_KEY}`;
      const res = await axios.get(url);
      const data = res.data;
      // Filter for the event name
      const filtered = Array.isArray(data) ? data.filter(ev => ev.Name && ev.Name.includes(`UFC ${ufcNumber}`)) : [];
      if (filtered.length === 0) {
        setError('No event found for UFC ' + ufcNumber);
        setEvents([]);
        setLoading(false);
        return;
      }
      // Use the first matching event
      const ev = filtered[0];
  const cache = getCache();
  const evNumber = extractUfcNumber(ev.Name);
  const numberKey = evNumber ? 'num_' + evNumber : null;
  const key = 'ev_' + ev.EventId;
  const cached = cache[key] || (numberKey ? cache[numberKey] : null);
      const baseObj = {
        id: ev.EventId,
        title: ev.Name,
        date: ev.DateTime,
        location: {
          venue: ev.ShortName || '',
          city: '',
          country: '',
        },
        image: cached ? cached.url : PLACEHOLDER_IMAGE,
        imageCredit: cached ? cached.credit : undefined,
        imageCreditUrl: cached ? cached.creditUrl : undefined,
        fights: [],
        fightType: '',
        status: ev.Status,
        active: ev.Active,
      };
      setEvents([baseObj]);
      if (!cached) {
        fetchImageForEvent(baseObj).then(img => {
          if (img) {
            const freshCache = getCache();
            freshCache[key] = img;
            const num = img.number || extractUfcNumber(baseObj.title);
            if (num) {
              freshCache['num_' + num] = img;
            }
            setCache(freshCache);
            setEvents(cur => cur.map(c => c.id === baseObj.id ? { ...c, image: img.url, imageCredit: img.credit, imageCreditUrl: img.creditUrl } : c));
          }
        });
      }
    } catch (err) {
      setError('Failed to load event.');
      setEvents([]);
    }
    setLoading(false);
  };

  const handleView = async (event) => {
    // Save event to backend (ensure id and name)
    await fetch('http://localhost:5000/api/save-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [{ id: event.id, name: event.title }] })
    });
    // Store event info for WatchPage
    localStorage.setItem('ufc_selected_event_id', event.id);
    localStorage.setItem('ufc_selected_event_name', event.title);
    // Redirect to live section (watch page)
    window.location.href = '/watch';
  };

  return (
    <section style={{ minHeight: '100vh' }} ref={ref} className="w-full max-w-5xl mx-auto py-12 px-4" data-section="events">
      {loading && (
        <div className="text-center py-12 text-lg">Loading events...</div>
      )}
      {error && (
        <div className="text-center py-12 text-red-500 text-lg mt-24">{error}</div>
      )}
      <form
        className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8"
        onSubmit={handleSearch}
      >
        <input style={{ color: "black" }}
          type="text"
          placeholder="Enter UFC Number (e.g. 319)"
          value={ufcNumber}
          onChange={e => setUfcNumber(e.target.value)}
          className="border border-gray-400 rounded px-4 py-2 text-lg"
          required
        />
        <button
          type="submit"
          className="bg-ufcRed text-white px-6 py-2 rounded font-headline text-lg shadow hover:bg-red-700 transition-colors"
        >
          Search
        </button>
      </form>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="font-headline text-2xl md:text-3xl text-ufcRed mb-6 text-center"
      >
        Searched UFC Event
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {searched && events.length === 0 && !loading && !error && (
          <div className="text-center text-gray-400 col-span-2">No event found.</div>
        )}
        {events.map(event => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-ufcBlack rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-gray-800"
          >
            <div className="flex items-center gap-4" >
              <img src={event.image} alt={event.title} className="w-24 h-24 object-cover rounded-lg border border-ufcRed" onError={e => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} />
              <div>
                <h3 className="font-headline text-2xl text-ufcRed mb-1">{event.title}</h3>
                <p className="text-gray-300 text-sm">{event.date} | {event.location.venue}</p>
                {event.imageCredit && (
                  <p className="text-gray-500 text-[10px]">Image: <a className="underline" href={event.imageCreditUrl} target="_blank" rel="noreferrer">{event.imageCredit}</a></p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button onClick={() => handleView(event)} className="bg-green-600 text-white px-4 py-2 rounded-full font-headline text-sm shadow hover:bg-green-800 transition-colors">View</button>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="font-headline text-3xl md:text-4xl text-ufcRed mb-8 text-center"
      >
        Upcoming UFC Events
      </motion.h2>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => hydrateImagesForList(setMmaEvents, () => mmaEvents)}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50"
          disabled={imageLoading}
        >
          {imageLoading ? 'Fetching images...' : 'Refresh Images'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {mmaEvents.map(event => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-ufcBlack rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-gray-800"
          >
            <div className="flex items-center gap-4" >
              <img src={event.image} alt={event.title} className="w-24 h-24 object-cover rounded-lg border border-ufcRed" onError={e => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} />
              <div>
                <h3 className="font-headline text-2xl text-ufcRed mb-1">{event.title}</h3>
                <p className="text-gray-300 text-sm">{event.date} | {event.location.venue}{event.location.city ? ', ' + event.location.city : ''}{event.location.country ? ', ' + event.location.country : ''}</p>
                <p className="text-gray-400 text-xs">Fight Type: {event.fightType}</p>
                {event.imageCredit && (
                  <p className="text-gray-500 text-[10px] mt-1">Image: <a className="underline" href={event.imageCreditUrl} target="_blank" rel="noreferrer">{event.imageCredit}</a></p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <button onClick={() => handleView(event)} className="bg-blue-600 text-white px-4 py-2 rounded-full font-headline text-sm shadow hover:bg-blue-800 transition-colors">Watch</button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
});
export default EventsSection;
