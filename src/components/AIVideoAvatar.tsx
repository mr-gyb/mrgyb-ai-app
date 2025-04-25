import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIVideoAvatar: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create and inject the HeyGen script
    const script = document.createElement('script');
    script.innerHTML = `!function(window){const host="https://labs.heygen.com",url=host+"/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJlZjA4MDM5YTQxMzU0ZWQ1YTIwNTY1ZGI4%0D%0AOTkzNzNmMyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3Yz%0D%0AL2VmMDgwMzlhNDEzNTRlZDVhMjA1NjVkYjg5OTM3M2YzL2Z1bGwvMi4yL3ByZXZpZXdfdGFyZ2V0%0D%0ALndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6ImZl%0D%0AZDMwZTNjYWI4ODRhNzA4YmY4N2NjYzFiNGE2OTg1IiwidXNlcm5hbWUiOiIzYzRiZDY4M2I4Njk0%0D%0AMDY0OTYwNDE5MDZkYjk0YzdkNSJ9&inIFrame=1",clientWidth=document.body.clientWidth,wrapDiv=document.createElement("div");wrapDiv.id="heygen-streaming-embed";const container=document.createElement("div");container.id="heygen-streaming-container";const stylesheet=document.createElement("style");stylesheet.innerHTML=\`\n  #heygen-streaming-embed {\n    width: 100%;\n    height: 100%;\n    min-height: 400px;\n    border-radius: 12px;\n    overflow: hidden;\n    background: #000;\n  }\n  #heygen-streaming-container {\n    width: 100%;\n    height: 100%;\n  }\n  #heygen-streaming-container iframe {\n    width: 100%;\n    height: 100%;\n    border: 0;\n  }\n  \`;const iframe=document.createElement("iframe");iframe.allowFullscreen=!1,iframe.title="AI Video Avatar",iframe.role="application",iframe.allow="microphone",iframe.src=url;let visible=!0,initial=!0;window.addEventListener("message",(e=>{e.origin===host&&e.data&&e.data.type&&"streaming-embed"===e.data.type&&("init"===e.data.action?(initial=!0,wrapDiv.classList.toggle("show",initial)):"show"===e.data.action?(visible=!0,wrapDiv.classList.toggle("expand",visible)):"hide"===e.data.action&&(visible=!1,wrapDiv.classList.toggle("expand",visible)))})),container.appendChild(iframe),wrapDiv.appendChild(stylesheet),wrapDiv.appendChild(container),document.getElementById("avatar-container").appendChild(wrapDiv)}(globalThis);`;
    document.body.appendChild(script);

    // Cleanup function to remove the script and avatar when component unmounts
    return () => {
      document.body.removeChild(script);
      const embedDiv = document.getElementById('heygen-streaming-embed');
      if (embedDiv) {
        embedDiv.remove();
      }
    };
  }, []);

  return (
    <div className="bg-white text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          {/* <Link to="/dashboard" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link> */}
          <h1 className="text-3xl font-bold text-navy-blue">AI Video Avatar</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Preview Section */}
          <div className="bg-gray-100 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4">Live Avatar</h2>
            <div
              id="avatar-container"
              className="w-full aspect-video bg-black rounded-lg"
              aria-label="AI Video Avatar Preview"
            />
          </div>

          {/* Instructions Section */}
          <div className="space-y-6">
            <div className="bg-gray-100 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">How to Interact</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-navy-blue text-white text-sm mr-3">
                    1
                  </span>
                  <span>
                    Allow microphone access when prompted by your browser
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-navy-blue text-white text-sm mr-3">
                    2
                  </span>
                  <span>Click the avatar to start the conversation</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-navy-blue text-white text-sm mr-3">
                    3
                  </span>
                  <span>
                    Speak naturally - the avatar will respond in real-time
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">
                Tips for Best Experience
              </h2>
              <ul className="space-y-2 list-disc list-inside text-gray-700">
                <li>Use a quiet environment for better voice recognition</li>
                <li>Speak clearly and at a normal pace</li>
                <li>Keep questions and statements concise</li>
                <li>
                  Wait for the avatar to finish speaking before responding
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVideoAvatar;
