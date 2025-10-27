import React, { useEffect, useState } from 'react';
import { Heart, Users, Home, ChefHat, Star, ArrowRight, Utensils } from 'lucide-react';

const OurStoryPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      {/* Custom Styles */}
      <style>{`
        body {
          margin: 0;
          padding: 0;
        }

        .hero-section {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(50, 140, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .watercolor-bg {
          background: linear-gradient(135deg, 
            rgba(50, 140, 129, 0.05) 0%,
            rgba(240, 248, 255, 0.8) 25%,
            rgba(230, 245, 255, 0.6) 50%,
            rgba(220, 240, 250, 0.8) 75%,
            rgba(50, 140, 129, 0.05) 100%
          );
          position: relative;
          overflow: hidden;
        }

        .watercolor-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(50, 140, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 60% 20%, rgba(50, 140, 129, 0.06) 0%, transparent 50%);
          pointer-events: none;
        }

        .story-card {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(240, 248, 255, 0.9) 50%,
            rgba(255, 255, 255, 0.95) 100%
          );
          backdrop-filter: blur(10px);
          border: 2px solid rgba(50, 140, 129, 0.2);
          box-shadow: 
            0 20px 50px rgba(50, 140, 129, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .story-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            0 30px 60px rgba(50, 140, 129, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .hero-title {
          background: linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-quote {
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          font-style: italic;
        }

        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }

        .floating-animation-delay {
          animation: float 6s ease-in-out infinite;
          animation-delay: -3s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(-10px) rotate(-1deg); }
        }

        .slide-in-left {
          opacity: 0;
          transform: translateX(-100px);
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .slide-in-right {
          opacity: 0;
          transform: translateX(100px);
          animation: slideInRight 0.8s ease-out forwards;
        }

        .fade-in-up {
          opacity: 0;
          transform: translateY(50px);
          animation: fadeInUp 1s ease-out forwards;
        }

        @keyframes slideInLeft {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gradient-text {
          background: linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .main-story-image {
          border-radius: 30px;
          box-shadow: 
            0 30px 60px rgba(50, 140, 129, 0.4),
            0 0 50px rgba(50, 140, 129, 0.2);
          border: 4px solid rgba(50, 140, 129, 0.3);
          transition: all 0.6s ease;
        }

        .main-story-image:hover {
          transform: scale(1.05);
          box-shadow: 
            0 40px 80px rgba(50, 140, 129, 0.5),
            0 0 80px rgba(50, 140, 129, 0.3);
        }

        .teal-accent {
          color: rgb(50, 140, 129);
        }
      `}</style>

      {/* Hero Section with Main Image */}
      <div className="hero-section min-h-screen flex items-center justify-center relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          {/* Hero Title */}
          <h1 className={`hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-10 lg:mb-12 ${isVisible ? 'slide-in-left' : ''}`}>
            Our Story
          </h1>
          
          {/* Hero Quote from Image */}
          <p className={`hero-quote text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-16 lg:mb-20 max-w-6xl mx-auto leading-relaxed ${isVisible ? 'fade-in-up' : ''}`}>
            "Khana ki wajah se bhai-chara aur dosti toot jaati hai,<br />
            isiliye ek ghar jaisa tiffin solution aaya hi"
          </p>

          {/* Main Story Image */}
          <div className={`flex justify-center mb-20 lg:mb-24 ${isVisible ? 'floating-animation' : ''}`}>
            <img 
              src="/story.png" 
              alt="Our Story - From Conflicts to Harmony"
              className="main-story-image w-full max-w-6xl"
            />
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <ArrowRight className="text-white mx-auto rotate-90" size={32} />
          </div>
        </div>
      </div>

      {/* Story Content Section */}
      <div className="watercolor-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
          
          {/* Story Introduction */}
          <div className="text-center mb-24 lg:mb-32">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-8 lg:mb-10">
              Kudrat ki kahani
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Ek sapne, sangharsh aur samadhaan ki yaatra
            </p>
          </div>

          {/* Main Story */}
          <div className="space-y-20 lg:space-y-28">
            
            {/* Story Section 1 */}
            <div className="story-section relative">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                <div className="lg:w-1/2">
                  <div className="story-card p-8 lg:p-12 xl:p-16 rounded-3xl">
                    <div className="flex items-center mb-8">
                      <Home className="text-[rgb(50,140,129)] mr-4 lg:mr-6" size={32} />
                      <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold gradient-text">Shuruat</h3>
                    </div>
                    <div className="space-y-6">
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        <span className="font-semibold teal-accent">Hi! Mera naam Kudrat hai.</span> Jab main 10th pass kar ke science lene ka decision liya, 
                        tab mujhe ghar chhod ke <span className="font-semibold teal-accent">Hazaribagh</span> aana pada.
                      </p>
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        <span className="font-semibold teal-accent">Matwari mein lodge</span> mein ek room mein teen dost rehte the jo apne hi gaon ke the. 
                        Hum log <span className="font-semibold teal-accent">Babu Gaon Coaching</span> ke liye subah-sham jaate the.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 floating-animation-delay flex justify-center lg:justify-end">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-[rgb(50,140,129)] to-[rgb(34,197,94)] rounded-full flex items-center justify-center shadow-2xl">
                    <Home className="text-white" size={44} />
                  </div>
                </div>
              </div>
            </div>

            {/* Story Section 2 */}
            <div className="story-section relative">
              <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
                <div className="lg:w-1/2">
                  <div className="story-card p-8 lg:p-12 xl:p-16 rounded-3xl">
                    <div className="flex items-center mb-8">
                      <ChefHat className="text-[rgb(50,140,129)] mr-4 lg:mr-6" size={32} />
                      <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold gradient-text">Khana banane ki musibat</h3>
                    </div>
                    <div className="space-y-6">
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        <span className="font-semibold teal-accent">Subah 6 baje uth kar khana banate</span>, kabhi kabhi nahi banate the. 
                        Coaching se aane ke baad 10 baje banate the.
                      </p>
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        Phir kuch deeno ke liye main <span className="font-semibold teal-accent">Ghumne ke liye chala gaya tha</span> 
                        <span className="font-semibold teal-accent">1 month ke liye</span> phir wapis aaya Matwari mein rehne ke liye.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 floating-animation flex justify-center lg:justify-start">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-[rgb(34,197,94)] to-[rgb(50,140,129)] rounded-full flex items-center justify-center shadow-2xl">
                    <ChefHat className="text-white" size={44} />
                  </div>
                </div>
              </div>
            </div>

            {/* Story Section 3 */}
            <div className="story-section relative">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                <div className="lg:w-1/2">
                  <div className="story-card p-8 lg:p-12 xl:p-16 rounded-3xl">
                    <div className="flex items-center mb-8">
                      <Users className="text-[rgb(50,140,129)] mr-4 lg:mr-6" size={32} />
                      <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold gradient-text">Cousin bhai ke saath</h3>
                    </div>
                    <div className="space-y-6">
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        Apne <span className="font-semibold teal-accent">Cousin bhai ke saath rehne laga</span> jahan khud se khana banana padta tha. 
                        <span className="font-semibold teal-accent">1 month achha se sab kuch chala</span>.
                      </p>
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        Phir kuch <span className="font-semibold teal-accent">khana banane ko lekar aur owner ke wajah se problem</span> hone lagi. 
                        Uske baad main dusra room mein shift ho gaya.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 floating-animation-delay flex justify-center lg:justify-end">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-[rgb(50,140,129)] to-[rgb(34,197,94)] rounded-full flex items-center justify-center shadow-2xl">
                    <Users className="text-white" size={44} />
                  </div>
                </div>
              </div>
            </div>

            {/* Story Section 4 */}
            <div className="story-section relative">
              <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
                <div className="lg:w-1/2">
                  <div className="story-card p-8 lg:p-12 xl:p-16 rounded-3xl">
                    <div className="flex items-center mb-8">
                      <Utensils className="text-[rgb(50,140,129)] mr-4 lg:mr-6" size={32} />
                      <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold gradient-text">Samadhaan ki khoj</h3>
                    </div>
                    <div className="space-y-6">
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        Jahan jane ke baad maine <span className="font-semibold teal-accent">ek tiffin service dekha</span>. 
                        Uss waqt Matwari mein ek family ek tiffin service dete the.
                      </p>
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        Yahan aane ke baad <span className="font-semibold teal-accent">12th exam dene tak koi problem nahi hui</span>. 
                        Yahi se mujhe idea aaya ki tiffin service kitni important hai!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 floating-animation flex justify-center lg:justify-start">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-[rgb(34,197,94)] to-[rgb(50,140,129)] rounded-full flex items-center justify-center shadow-2xl">
                    <Utensils className="text-white" size={44} />
                  </div>
                </div>
              </div>
            </div>

            {/* Story Section 5 */}
            <div className="story-section relative">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                <div className="lg:w-1/2">
                  <div className="story-card p-8 lg:p-12 xl:p-16 rounded-3xl">
                    <div className="flex items-center mb-8">
                      <Heart className="text-[rgb(50,140,129)] mr-4 lg:mr-6" size={32} />
                      <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold gradient-text">Rishton mein daraar</h3>
                    </div>
                    <div className="space-y-6">
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        Dusre room mein <span className="font-semibold teal-accent">2 Cousin bhai Deoghar se padhne aaye the</span>. 
                        Wo ek saath rehte the par <span className="font-semibold teal-accent">apas mein baat nahi karte the</span>.
                      </p>
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        Kyunki <span className="font-semibold teal-accent">khana banane ko lekar koi baat ho gayi thi</span>. 
                        Mere pehle wale 2 dost bhi khana banane ko lekar ladkar alag alag room mein chale gaye.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 floating-animation-delay flex justify-center lg:justify-end">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-[rgb(50,140,129)] to-[rgb(34,197,94)] rounded-full flex items-center justify-center shadow-2xl">
                    <Heart className="text-white" size={44} />
                  </div>
                </div>
              </div>
            </div>

            {/* Story Section 6 - Final */}
            <div className="story-section relative">
              <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
                <div className="lg:w-1/2">
                  <div className="story-card p-8 lg:p-12 xl:p-16 rounded-3xl border-4 border-[rgb(50,140,129)] border-opacity-30">
                    <div className="flex items-center mb-8">
                      <Star className="text-[rgb(50,140,129)] mr-4 lg:mr-6" size={32} />
                      <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold gradient-text">Mamatiffin ka janam</h3>
                    </div>
                    <div className="space-y-6">
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        <span className="font-bold text-xl lg:text-2xl teal-accent">Is story se yahi batana chahta hoon ki:</span>
                      </p>
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        <span className="font-semibold teal-accent">"Khane ke wajah se bhai-chara mein ladaai ho jaata hai, 
                        dost mein ladaai ho jaata hai"</span>
                      </p>
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed">
                        Toh <span className="font-semibold teal-accent">bhai-chara bane rahe, dosti acche se bane rahe</span>, 
                        isliye <span className="font-bold gradient-text text-xl lg:text-2xl">Mamatiffin</span> ek tiffin service le kar aaya hai.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 floating-animation flex justify-center lg:justify-start">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-[rgb(34,197,94)] to-[rgb(50,140,129)] rounded-full flex items-center justify-center shadow-2xl">
                    <Star className="text-white" size={44} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="mt-32 lg:mt-40">
            <div className="story-card p-12 lg:p-20 xl:p-24 rounded-3xl text-center border-4 border-[rgb(50,140,129)] border-opacity-20">
              <div className="w-28 h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-[rgb(50,140,129)] to-[rgb(34,197,94)] rounded-full flex items-center justify-center shadow-2xl mx-auto mb-10 lg:mb-12">
                <Heart className="text-white" size={52} />
              </div>
              
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-10 lg:mb-12">
                Hamara mission
              </h3>
              
              <p className="text-2xl lg:text-3xl xl:text-4xl text-gray-700 leading-relaxed max-w-5xl mx-auto mb-10 lg:mb-12 font-medium">
                "Rishte bachana, khushiyaan baantna"
              </p>
              
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                Hamara maksad sirf khana dena nahi hai, balki aapke rishton ko majboot banana hai. 
                Kyunki jab khana achha ho, toh dil bhi khush rehta hai aur rishte bhi meethe rehte hain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OurStoryPage;