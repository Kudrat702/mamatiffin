const AboutUs = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-pink-50 via-orange-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight mb-6">
            About Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
        </div>

        {/* Content Section with Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left - Content */}
          <div className="order-2 lg:order-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl border border-white/20">
              <p className="text-lg lg:text-xl leading-relaxed text-gray-700 mb-6">
                <span className="font-bold text-purple-600">mamatiffin</span> is a trusted Student Tiffin Service provider that delivers hot, homemade-style and delicious food right to your hostel or room, sourced only from hygienic and <span className="font-semibold text-orange-600">FSSAI-approved kitchens</span> across the city.
              </p>
              
              <p className="text-lg lg:text-xl leading-relaxed text-gray-700 mb-6">
                We understand that being away from home means missing the comfort of <span className="font-semibold text-pink-600">mother's cooking</span>. That's why we've dedicated ourselves to bringing you nutritious, affordable, and tasty meals that remind you of home.
              </p>
              
              <p className="text-lg lg:text-xl leading-relaxed text-gray-700">
                Our mission is to ensure every student has access to <span className="font-semibold text-purple-600">healthy, homemade food</span> without compromising on taste, quality, or affordability. We're not just a food service - we're your home away from home.
              </p>
            </div>
          </div>
          
          {/* Right - Image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-pink-100 to-purple-100 p-8">
              <img
                src="/about.jpg"
                alt="mamatiffin Kitchen"
                className="w-full h-auto object-cover rounded-2xl transform hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallback = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              {/* Fallback illustration */}
              <div className="w-full h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl items-center justify-center" style={{ display: 'none' }}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl">🍳</span>
                  </div>
                  <p className="text-purple-600 font-semibold">Home-style Cooking</p>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

