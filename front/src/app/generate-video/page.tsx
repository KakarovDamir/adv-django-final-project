'use client';
import { useState, useEffect } from 'react';
import { getCSRFToken } from '@/lib/csrf';

interface VideoData {
  id: number;
  prompt: string;
  finalVideo: string;
  arrImages: string[];
}

export default function GenerateVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://138.68.87.67:8000/ai/generate/', {
          credentials: 'include',
        });
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };
    
    fetchVideos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://138.68.87.67:8000/ai/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': await getCSRFToken(),
        },
        credentials: 'include',
        body: JSON.stringify({ prompt }),
      });
      
      if (response.ok) {
        const newVideo = await response.json();
        setVideos(prev => [newVideo, ...prev]);
        setPrompt('');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Error generating video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-violet-50">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-violet-900 mb-8 text-center">
          Generate AI Video
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="form-group mb-4">
            <label 
              htmlFor="prompt" 
              className="block text-violet-700 font-medium mb-2 text-lg"
            >
              Video Prompt
            </label>
            <input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Create Video'}
          </button>
        </form>

        <div className="grid grid-cols-1 gap-6 mt-8">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-violet-800 mb-4">Prompt: {video.prompt}</h3>
                
                <div className="mb-6">
                  <video controls className="w-full rounded-lg aspect-video">
                    <source src={video.finalVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <a 
                    href={video.finalVideo} 
                    download="GeneratedVideo.mp4"
                    className="mt-3 inline-flex items-center justify-center px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Download Video
                  </a>
                </div>

                <div className="relative group">
                  <div className="flex overflow-hidden rounded-xl aspect-square bg-gray-100">
                    {video.arrImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          index === activeIndex ? 'translate-x-0' : 'translate-x-full absolute'
                        }`}
                        alt={`Generated content ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  {/* Navigation Arrows */}
                  {video.arrImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveIndex(prev => (prev - 1 + video.arrImages.length) % video.arrImages.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setActiveIndex(prev => (prev + 1) % video.arrImages.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Dots Indicator */}
                  {video.arrImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {video.arrImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === activeIndex ? 'bg-violet-600 scale-125' : 'bg-white/80 scale-100'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

