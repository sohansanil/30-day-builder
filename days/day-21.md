# Day 21

Project: SoEchoes Backend & Maps

Goal:
Build an interactive map application that allows users to place pins anonymously and share memories tied to specific locations.

What I Built:
I integrated Leaflet with React using react-leaflet and built out the core map component. I set up a Supabase PostgreSQL database to store pins and memories anonymously, along with the RLS policies to ensure security. 

Challenges:
Working with Leaflet in a Next.js environment was challenging due to SSR issues. I had to dynamically import the map components to avoid `window is not defined` errors. Setting up Supabase RLS to allow anonymous inserts without user authentication while preventing abuse was also tricky.

Key Learnings:
- Supabase anonymous inserts & Row Level Security (RLS)
- React Leaflet and handling SSR in Next.js
- OpenStreetMap integration and custom map markers

Tech Stack:
- Next.js
- Leaflet / OpenStreetMap
- Supabase (PostgreSQL)
- Tailwind CSS

Links:

* GitHub: [SoEchoes Repo](https://github.com/sohansanil/30-day-builder/tree/main/projects/soechoes)
* Live Demo: [SoEchoes Live](https://soechoes.vercel.app)
