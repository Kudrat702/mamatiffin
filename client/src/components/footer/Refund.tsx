import React from 'react';

const RefundCancellationPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Refund & Cancellation Policy</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              This refund and cancellation policy outlines how you can cancel or seek a refund for a product/service 
              that you have purchased through the Platform. Under this policy:
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-teal-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Cancellation Timeline</h3>
                <p className="text-gray-700 leading-relaxed">
                  Cancellations will only be considered if the request is made within <strong>7 days</strong> of 
                  placing the order. However, cancellation requests may not be entertained if the orders have been 
                  communicated to sellers/merchants listed on the Platform and they have initiated the shipping process, 
                  or the product is out for delivery. In such cases, you may choose to reject the product at the doorstep.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Perishable Items Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Mamatiffin</strong> does not accept cancellation requests for perishable items like flowers, 
                  eatables, etc. However, refund/replacement can be made if the user establishes that the quality of 
                  the product delivered is not good.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Damaged or Defective Items</h3>
                <p className="text-gray-700 leading-relaxed">
                  In case of receipt of damaged or defective items, please report to our customer service team. 
                  The request will be entertained once the seller/merchant listed on the Platform has checked and 
                  determined the same at their end. This should be reported within <strong>7 days</strong> of receipt 
                  of products.
                </p>
                <p className="text-gray-700 leading-relaxed mt-3">
                  If you feel that the product received is not as shown on the site or as per your expectations, 
                  you must bring it to the notice of our customer service within <strong>7 days</strong> of receiving 
                  the product. The customer service team will take an appropriate decision after looking into your complaint.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Warranty Claims</h3>
                <p className="text-gray-700 leading-relaxed">
                  In case of complaints regarding products that come with a warranty from the manufacturers, 
                  please refer the issue directly to them.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Refund Processing</h3>
                <p className="text-gray-700 leading-relaxed">
                  In case of any refunds approved by <strong>Mamatiffin</strong>, it will take <strong>1 day</strong> 
                  for the refund to be processed to you.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Important Notes:</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All refund and cancellation requests must be reported within 7 days</li>
                <li>Perishable items like food and flowers have different policies</li>
                <li>Quality issues must be verified by the seller/merchant</li>
                <li>Refunds are processed within 1 business day of approval</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Customer Service</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                For any refund or cancellation requests, please contact our customer service team:
              </p>
              <div className="text-gray-700">
                <p><strong>Email:</strong> mdkudratullah55@gmail.com</p>
                <p><strong>Business Hours:</strong> Monday - Friday (9:00 AM - 6:00 PM)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundCancellationPolicy;