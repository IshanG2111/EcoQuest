'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

// This is the new, detailed homepage component for unauthenticated users.
const UnauthenticatedHomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // This replicates the typing animation from your script.
    const phrases = ["Educating Today for Sustainable Tomorrow", "Explore. Discover. Act."];
    let typedTextElem = document.getElementById('typed-text');
    if (!typedTextElem) return;

    let idx = 0, chr = 0, del = false;
    let timeoutId: NodeJS.Timeout;

    function type() {
      if (!typedTextElem) return;
      let txt = phrases[idx];
      typedTextElem.textContent = del ? txt.slice(0, --chr) : txt.slice(0, ++chr);

      if (!del && chr === txt.length) {
        del = true;
        timeoutId = setTimeout(type, 2000);
        return;
      }
      if (del && chr === 0) {
        del = false;
        idx = (idx + 1) % phrases.length;
      }
      timeoutId = setTimeout(type, del ? 50 : 100);
    }
    type();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        body {
          font-family: 'Press Start 2P', cursive;
          color: #2a5d34;
          height: 100%;
          margin: 0; padding: 0;
          overflow-x: hidden;
        }

        #bg-video {
          position: fixed;
          top: 0;
          left: 0;         
          width: auto;      
          min-width: 225vh; 
          height: 100vh;    
          object-fit: cover; 
          border: 3px solid #2a5d34; 
          border-radius: 1px;        
          background-size: cover;
          z-index: -1;
        }
        #overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          z-index: -1;
        }

        .homepage-container header, .homepage-container footer, .homepage-container .btn {
          border: 3px solid #2a5d34;
          background: rgba(76, 175, 80, 0.9);
          box-shadow: inset -3px -3px 0 0 rgba(129, 199, 132, 0.8);
          text-transform: uppercase;
          color: white;
          position: relative;
          z-index: 10;
          backdrop-filter: blur(2px);
        }
        .homepage-container header {
          padding: 20px 0;
          text-align: center;
          font-size: 1.8em;
          margin: 0;
        }

        .homepage-container .banner {
          margin: 24px auto;
          width: calc(100% - 40px);
          max-width: 900px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-shadow: 2px 2px 5px #000;
          position: relative;
          z-index: 10;
          padding: 32px 32px 28px 32px;
          user-select: none;
          box-sizing: border-box;
        }

        .homepage-container .hero-text {
          font-size: 1.2em; /* decreased font size */
          white-space: nowrap;
          overflow-x: auto;
          max-width: 100%;
          text-align: center;
          border-right: none;
          line-height: 1.2;
          color: white;
          margin-bottom: 20px;
          padding: 12px 0 12px 0;
        }

        .homepage-container .content {
          max-width: 900px;
          margin: 32px auto;
          background: rgba(255, 255, 255, 0.85);
          padding: 32px 28px 28px 28px;
          border: 3px solid #2a5d34;
          box-shadow: inset -3px -3px 0 0 rgba(129, 199, 132, 0.8), 0 4px 8px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(5px);
          position: relative;
          z-index: 10;
          box-sizing: border-box;
        }
        
        .homepage-container section {
          margin-bottom: 40px;
        }

        .homepage-container h2 {
          margin: 0 0 15px;
          font-size: 1.2em;
          border-bottom: 4px solid #4caf50;
          padding-bottom: 8px;
        }

        .homepage-container ul {
          list-style: square;
          padding-left: 20px;
        }

        .homepage-container p {
          line-height: 1.6;
        }

        .homepage-container .btn-group {
          text-align: center;
          margin-top: 20px;
        }

        .homepage-container .btn {
          display: inline-block;
          padding: 16px 40px;
          margin: 0 12px;
          background: rgba(76, 175, 80, 0.9);
          color: white;
          text-decoration: none;
          font-weight: bold;
          box-shadow: inset -5px -5px 0 0 rgba(129, 199, 132, 0.8);
          transition: 0.2s;
          font-family: 'Press Start 2P', cursive;
          cursor: pointer;
          border-radius: 10px;
        }

        .homepage-container .btn:hover {
          background: rgba(56, 142, 60, 0.9);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 5px 5px 10px 0 #18351e99;
        }
        .homepage-container .btn:active {
          transform: translateY(0) scale(0.97);
          box-shadow: inset -5px -5px 0 0 rgba(129, 199, 132, 0.8);
        }
        .homepage-container footer {
          background: rgba(216, 240, 211, 0.9);
          text-align: center;
          padding: 15px 0;
          font-size: 0.9em;
          margin-top: 50px;
          border: 3px solid #2a5d34;
          box-shadow: inset -3px -3px 0 0 rgba(129, 199, 132, 0.8);
          font-family: 'Press Start 2P', cursive;
          position: relative;
          z-index: 10;
        }
      `}</style>
      <div className="homepage-container">
        <video id="bg-video" autoPlay loop muted playsInline>
          <source src="/videos/mylivewallpapers.com-Pixel-Waterfall.mp4" type="video/mp4" />
        </video>
        <div id="overlay"></div>

        <header>EcoQuest</header>
        <div className="banner">
          <div className="hero-text"><span id="typed-text"></span></div>
        </div>
        <div className="content">
          <section>
            <h2>Welcome to EcoQuest</h2>
            <p>EcoQuest is a gamified platform designed to educate and inspire action on important environmental issues. Engage with interactive lessons, complete exciting challenges, and earn rewards as you help create a sustainable future.</p>
          </section>
          <section>
            <h2>Why Choose EcoQuest?</h2>
            <ul>
              <li>Interactive and fun learning modules</li>
              <li>Earn points, badges, and climb leaderboards</li>
              <li>Take part in real-world environmental challenges</li>
              <li>Join a community passionate about making a difference</li>
            </ul>
          </section>
          <div className="btn-group">
            <Link href="/signup" className="btn">Get Started</Link>
          </div>
        </div>
        <footer>
          &copy; 2025 EcoQuest | Making Environmental Education Fun and Impactful
        </footer>
      </div>
    </>
  );
};


export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/desktop');
    }
  }, [user, loading, router]);

  // While loading or if the user is authenticated, show a loading screen or nothing
  if (loading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Only show the detailed homepage if the user is not logged in.
  return <UnauthenticatedHomePage />;
}
