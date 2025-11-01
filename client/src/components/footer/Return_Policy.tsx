import React from 'react';

const ReturnPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Return Policy</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-teal-800 mb-3">Return Window</h2>
              <p className="text-teal-700 leading-relaxed">
                We offer refund/exchange within first <strong>7 days</strong> from the date of your purchase. 
                If <strong>7 days</strong> have passed since your purchase, you will not be offered a return, 
                exchange or refund of any kind.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Eligibility Requirements</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In order to become eligible for a return or an exchange, the following conditions must be met:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">i</div>
                  <p className="text-gray-700 leading-relaxed">
                    The purchased item should be <strong>unused and in the same condition</strong> as you received it
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">ii</div>
                  <p className="text-gray-700 leading-relaxed">
                    The item must have <strong>original packaging</strong>
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">iii</div>
                  <p className="text-gray-700 leading-relaxed">
                    If the item was purchased <strong>on sale</strong>, then the item may not be eligible for a return/exchange
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Replacement Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Only such items are replaced by us (based on an exchange request), if such items are found 
                <strong> defective or damaged</strong>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Exempted Categories</h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <p className="text-orange-800 leading-relaxed">
                  You agree that there may be a certain category of products/items that are exempted from returns 
                  or refunds. Such categories of products will be identified to you at the time of purchase.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Return Process</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Submit Return Request</h4>
                    <p className="text-gray-700">Contact our customer service within 7 days of purchase</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Ship the Product</h4>
                    <p className="text-gray-700">Send the product back to us in original packaging</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Inspection & Approval</h4>
                    <p className="text-gray-700">We'll inspect the returned product and notify you via email</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Processing</h4>
                    <p className="text-gray-700">If approved after quality check, your return/exchange will be processed</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-gray-50 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                For return requests or any queries regarding our return policy:
              </p>
              <div className="text-gray-700">
                <p><strong>Email:</strong> mdkudratullah55@gmail.com</p>
                <p><strong>Company:</strong> mamatiffin</p>
                <p><strong>Address:</strong> Kolghatit, Hazaribagh, Jharkhand, India</p>
                <p><strong>Business Hours:</strong> Monday - Friday (9:00 AM - 6:00 PM)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;