import React from 'react';
import { Heart, Clock, Wallet, Zap, Shield } from 'lucide-react';

const mamatiffin: React.FC = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: "Healthy & Hygienic Ghar Jaisa Khana",
      description: "Students ko hostel/mess ka oily khana pasand nahi aata. mamatiffin har tiffin ghar ke standard se hygienic aur nutritious banata hai."
    },
    {
      icon: <Wallet className="w-8 h-8 text-white" />,
      title: "Pocket-Friendly Prices",
      description: "IIT/NEET/Board Exam aur govt job aspirants mostly budget conscious hote hain. Affordable monthly plans unke liye perfect rahenge."
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Energy for Studies",
      description: "Balanced diet (dal, sabzi, roti, rice) unko long study hours ke liye energy deti hai."
    },
    {
      icon: <Clock className="w-8 h-8 text-white" />,
      title: "On-Time Delivery",
      description: "Exam preparation ke time students ke liye punctuality bohot important hai. Tiffin daily fix time pe deliver hoga."
    },
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: "Mama's Care & Love ❤️",
      description: "Har plate khane me maa ka touch, taaki student ko apna gaon/ghar yaad aaye aur wo emotionally comfortable feel karein."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Why Order Food Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h1 
            className="text-4xl md:text-5xl font-normal text-center mb-12"
            style={{ color: 'rgb(50, 140, 129)' }}
          >
            Why Order Food from mamatiffin?
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
                  style={{ backgroundColor: 'rgb(50, 140, 129)' }}
                >
                  {feature.icon}
                </div>
                <h3 
                  className="text-xl font-bold text-center mb-3"
                  style={{ color: 'rgb(50, 140, 129)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-700 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Brand Section */}
      <section className="py-16 px-4 ">
        <div className="container mx-auto max-w-4xl">
          <div className="text-left">
            <div className="w-16 h-1 bg-orange-400 mb-6"></div>
            <h2 
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{ color: 'rgb(50, 140, 129)' }}
            >
              About the Brand
            </h2>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Hostel/Room me rehne wale students ko ghar jaisa khana nahi milta. Exam preparation ke pressure me unko healthy aur tasty food ki zarurat hoti hai. Isi need ko pura karne ke liye mamatiffin bana hai – taaki har student ko ghar ka pyar aur sehatmand khana mil sake.
            </p>
            
            <p 
              className="text-xl font-semibold italic"
              style={{ color: 'rgb(50, 140, 129)' }}
            >
              "Jab aap apne exams ki tyari me busy ho, mamatiffin aapke liye maa ki tarah khayal rakhta hai."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default mamatiffin;