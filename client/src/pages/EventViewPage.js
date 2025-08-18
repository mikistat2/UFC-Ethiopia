import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EventViewPage = () => {
  const { id } = useParams();
  const query = useQuery();
  const eventName = query.get('name') || 'Event';
  return (
    <div className="min-h-screen bg-ufcBlack text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-headline text-ufcRed mb-6">{eventName}</h1>
      <p className="text-lg">Event ID: {id}</p>
      {/* TODO: Add more event details here */}
    </div>
  );
};

export default EventViewPage;
