'use client';
import { useState } from 'react';
import { csrfFetch } from '@/lib/csrf';

export default function GenerateVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await csrfFetch('/api/ai/generate/', {
        method: 'POST',
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <VideoItem key={video.id} video={video} />
          ))}
        </div>
      </main>
    </div>
  );
}

const VideoItem = ({ video }: { video: any }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
    <div className="p-4">
      <h5 className="text-lg font-semibold text-violet-900 mb-2">{video.prompt}</h5>
      
      <div className="video-player mb-3 rounded-lg overflow-hidden">
        <video controls className="w-full aspect-video bg-gray-100">
          <source src={video.finalVideo} type="video/mp4" />
        </video>
      </div>

      <a 
        href={video.finalVideo} 
        download
        className="inline-block w-full bg-violet-100 hover:bg-violet-200 text-violet-800 text-center font-medium py-2 px-4 rounded-lg mb-3 transition-colors"
      >
        Download Video
      </a>

      <ImageCarousel images={video.arrImages} />
    </div>
  </div>
);

const ImageCarousel = ({ images }: { images: string[] }) => (
  <div id={`carousel-${images[0]}`} className="carousel slide">
    <div className="carousel-inner rounded-lg overflow-hidden">
      {images.map((img, index) => (
        <div 
          key={img} 
          className={`carousel-item ${index === 0 ? 'active' : ''}`}
        >
          <img 
            src={img} 
            className="d-block w-full aspect-square object-cover" 
            alt="Generated frame" 
          />
        </div>
      ))}
    </div>
    <button className="carousel-control-prev hover:bg-violet-100/30" type="button" data-bs-target={`#carousel-${images[0]}`} data-bs-slide="prev">
      <span className="carousel-control-prev-icon !bg-violet-600" aria-hidden="true" />
    </button>
    <button className="carousel-control-next hover:bg-violet-100/30" type="button" data-bs-target={`#carousel-${images[0]}`} data-bs-slide="next">
      <span className="carousel-control-next-icon !bg-violet-600" aria-hidden="true" />
    </button>
  </div>
);

