// OurStory.tsx
import React, { useState } from 'react';

const OurStory: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleStory = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-20 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" 
             style={{ backgroundColor: 'rgb(50, 140, 129)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10" 
             style={{ backgroundColor: 'rgb(50, 140, 129)' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Hero Image Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <img 
              src="/story.png" 
              alt="MamaTiffin Story - From Kitchen Conflicts to Food Solutions" 
              className="mx-auto w-full max-w-4xl h-80 object-cover rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              style={{ 
                filter: 'brightness(0.95) contrast(1.1)',
                border: '4px solid rgb(50, 140, 129)'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-div');
                if (fallback) {
                  (fallback as HTMLElement).style.display = 'flex';
                }
              }}
            />
            {/* Fallback if image doesn't load */}
            <div className="fallback-div hidden mx-auto w-full max-w-4xl h-80 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl shadow-2xl items-center justify-center">
              <div className="text-white text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-bold">Our Story</h3>
                <p className="text-lg opacity-90">Ghar Jaisa Khana, Dil Se</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Our <span style={{ color: 'rgb(50, 140, 129)' }}>Story</span>
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-2xl md:text-3xl text-gray-700 leading-relaxed font-medium">
              <span className="italic" style={{ color: 'rgb(50, 140, 129)' }}>
                "Khana Ki Wajah Se Bhai-Chara Aur Dosti Toot Jaati Hai,<br/>
                Isiliye Ek Ghar Jaisa Tiffin Solution Aaya Hai"
              </span>
            </p>
          </div>
          
          {/* Decorative Line */}
          <div className="flex justify-center mt-8">
            <div className="w-32 h-1 rounded-full" style={{ backgroundColor: 'rgb(50, 140, 129)' }}></div>
          </div>
        </div>

        {/* Story Toggle Button */}
        <div className="text-center mb-12">
          <button
            onClick={toggleStory}
            className="group relative inline-flex items-center px-12 py-5 text-xl font-bold text-white rounded-full overflow-hidden transition-all duration-300 transform hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50 active:scale-95"
            style={{ 
              backgroundColor: 'rgb(50, 140, 129)',
              boxShadow: '0 8px 25px rgba(50, 140, 129, 0.4)'
            }}
          >
            {/* Button Background Animation */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <span className="relative z-10">
              {isExpanded ? '📖 Story Collapse Kariye' : '👆 PURI STORY PADHIYE'}
            </span>
            
            <span className="relative z-10 ml-3 transition-transform duration-300 group-hover:scale-125">
              <svg 
                className={`w-6 h-6 transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
        </div>

        {/* Expandable Story Content */}
        <div className="overflow-hidden">
          <div 
            className={`transition-all duration-1000 ease-in-out ${
              isExpanded 
                ? 'max-h-[5000px] opacity-100 transform translate-y-0' 
                : 'max-h-0 opacity-0 transform -translate-y-8'
            }`}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border-l-8 mt-8" 
                 style={{ borderLeftColor: 'rgb(50, 140, 129)' }}>
              
              {/* Story Content */}
              <div className="prose prose-lg max-w-none">
                <div className="space-y-8 text-gray-800 leading-relaxed">
                  
                  {/* Introduction */}
                  <div className="text-center mb-10">
                    <p className="text-2xl font-semibold">
                      <span className="text-4xl">🙏</span> <strong style={{ color: 'rgb(50, 140, 129)' }}>Namaste!</strong> 
                      Mera naam <strong>Millennium</strong> hai.
                    </p>
                    <p className="text-lg mt-4 text-gray-600">
                      Yeh kahani tab shuru hoti hai jab main 10th pass kar ke science lene ka decision liya tha...
                    </p>
                  </div>

                  {/* Chapter 1 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border-l-6" 
                       style={{ borderLeftColor: 'rgb(50, 140, 129)' }}>
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                      <span className="text-3xl mr-3">🎒</span>
                      <span style={{ color: 'rgb(50, 140, 129)' }}>Hazaribagh ka Safar</span>
                    </h3>
                    <p className="text-lg">
                      Padhne ke liye mujhe ghar chhor ke <strong>Hazaribagh</strong> aana pada. Matwari ke ek lodge ke ek room me humare gaon ke teen dost rehte the. Hum log subah-shaam <strong>Babu Gaon coaching</strong> jaaya karte the.
                    </p>
                  </div>

                  {/* Daily Struggle */}
                  <div className="flex items-center space-x-4 text-lg">
                    <span className="text-3xl">⏰</span>
                    <p>
                      Subah uthke <strong>6 baje khana banate</strong>, kabhi kabhi nahi bana pate the. Coaching se aane ke baad <strong>10 baje banate</strong> the. Yahan se problems shuru hui...
                    </p>
                  </div>

                  {/* Chapter 2 */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-2xl border-l-6 border-red-400">
                    <h3 className="text-2xl font-bold mb-4 flex items-center text-red-700">
                      <span className="text-3xl mr-3">😰</span>
                      Problem ki Shuruaat
                    </h3>
                    <p className="text-lg">
                      Phir kuch deeno ke liye main <strong>Ghumne ke liye chala gaya tha</strong> 1 month ke liye.
                    </p>
                  </div>

                  {/* Transition */}
                  <div className="text-center py-6">
                    <div className="inline-flex items-center space-x-4">
                      <div className="w-16 h-1 bg-gray-300 rounded"></div>
                      <span className="text-2xl">🔄</span>
                      <div className="w-16 h-1 bg-gray-300 rounded"></div>
                    </div>
                  </div>

                  {/* Chapter 3 */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl border-l-6 border-yellow-400">
                    <h3 className="text-2xl font-bold mb-4 flex items-center text-yellow-700">
                      <span className="text-3xl mr-3">🏠</span>
                      Dusra Room - Naya Chapter
                    </h3>
                    <p className="text-lg">
                      Phir apne <strong>Cousin bhai</strong> ke saath rehne laga jahan khud se khana banana padta tha. 1 month achha se sab kuch chala, phir khana banane ko lekar aur owner ke wajah se problems hone lagi.
                    </p>
                    <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                      <p className="font-medium">
                        💡 Uske baad main dusre room mein shift ho gaya. Wahan jane ke baad maine ek <strong>tiffin service</strong> dekha - uss waqt Matwari mein ek family tiffin service deta tha.
                      </p>
                    </div>
                  </div>

                  {/* Chapter 4 */}
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-8 rounded-2xl border-l-6 border-red-500">
                    <h3 className="text-2xl font-bold mb-4 flex items-center text-red-800">
                      <span className="text-3xl mr-3">💔</span>
                      Relationships ka Breakdown
                    </h3>
                    <div className="space-y-4">
                      <p className="text-lg">
                        Yahan aane ke baad 12th exam dene tak koi problem nahi hui. Par iss room mein rehte waqt dusre room mein <strong>2 Cousin bhai</strong> Deoghar se padhne aaye the.
                      </p>
                      <div className="bg-red-100 p-4 rounded-lg">
                        <p className="font-medium text-red-800">
                          ⚠️ Wo ek saath rehte the par aapas mein <strong>koi baat-chit nahi karte</strong> the kyunki khana banane ko lekar koi baat ho gayi thi.
                        </p>
                      </div>
                      <p className="text-lg">
                        Jab main pehle room chhora tha, toh 2 dost reh rahe the - unlog mein khana banane ko lekar problem hua toh wo bhi <strong>alag-alag room</strong> mein chale gaye.
                      </p>
                    </div>
                  </div>

                  {/* The Solution */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-10 rounded-3xl border-4" 
                       style={{ borderColor: 'rgb(50, 140, 129)' }}>
                    <div className="text-center">
                      <div className="text-6xl mb-6">💡</div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'rgb(50, 140, 129)' }}>
                        The Solution - MamaTiffin
                      </h3>
                      <div className="max-w-2xl mx-auto">
                        <p className="text-xl md:text-2xl leading-relaxed">
                          <strong>Iss story se yahi batana chahta hoon:</strong> Khana ke wajah se <span className="text-red-600 font-bold">bhai-chara mein ladayi</span> ho jaati hai, <span className="text-red-600 font-bold">dost mein ladayi</span> ho jaati hai.
                        </p>
                        <div className="my-6">
                          <div className="text-4xl">🤝</div>
                        </div>
                        <p className="text-xl md:text-2xl font-bold" style={{ color: 'rgb(50, 140, 129)' }}>
                          Toh bhai-chara bane rahe, dosti achhi se bane rahe - isiliye <span className="underline">MamaTiffin ek ghar jaisa tiffin service</span> le kar aaya hai!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Final Message */}
                  <div className="text-center pt-8">
                    <div className="inline-block p-8 bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 rounded-3xl shadow-lg">
                      <div className="text-4xl mb-4">❤️</div>
                      <p className="text-2xl md:text-3xl font-bold" style={{ color: 'rgb(50, 140, 129)' }}>
                        "Ab na koi jhagda, na koi tension -<br/>
                        sirf ghar jaisa khana aur pyaar!"
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
};

export default OurStory;