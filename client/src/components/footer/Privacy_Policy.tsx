import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                This Privacy Policy describes how <span className="font-semibold">Mamatiffin</span> and its affiliates 
                (collectively "Mamatiffin, we, our, us") collect, use, share, protect or otherwise process your 
                information/personal data through our website <span className="font-semibold">mamatiffin.com</span> 
                (hereinafter referred to as Platform). Please note that you may be able to browse certain sections 
                of the Platform without registering with us. We do not offer any product/service under this Platform 
                outside India and your personal data will primarily be stored and processed in India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Collection</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect your personal data when you use our Platform, services or otherwise interact with us 
                during the course of our relationship. Some of the information that we may collect includes but is 
                not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Personal data/information provided during sign-up/registering such as name, date of birth, address, telephone/mobile number, email ID</li>
                <li>Bank account or credit/debit card or other payment instrument information (with your consent)</li>
                <li>Biometric information such as facial features or physiological information (when opted for certain features)</li>
                <li>Your behavior, preferences, and other information you choose to provide on our Platform</li>
                <li>Transaction-related information on Platform and third-party business partner platforms</li>
              </ul>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <p className="text-gray-700">
                  <strong>Important:</strong> If you receive an email or call from someone claiming to be Mamatiffin 
                  seeking personal data like debit/credit card PIN, net-banking or mobile banking password, never 
                  provide such information. Report it immediately to appropriate law enforcement agencies.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Usage</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use personal data to provide the services you request. We use your personal data to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Assist sellers and business partners in handling and fulfilling orders</li>
                <li>Enhance customer experience and resolve disputes</li>
                <li>Inform you about online and offline offers, products, services, and updates</li>
                <li>Customize your experience and detect fraud and criminal activity</li>
                <li>Enforce our terms and conditions</li>
                <li>Conduct marketing research, analysis and surveys</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You understand that your access to these products/services may be affected if permission is not provided to us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Internally within our group entities, corporate entities, and affiliates</li>
                <li>With third parties such as sellers, business partners, logistics partners, payment providers</li>
                <li>To comply with legal obligations, enforce user agreements, prevent fraud</li>
                <li>With government agencies or law enforcement when required by law</li>
                <li>To protect rights, property, or personal safety of users or the general public</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Security Precautions</h2>
              <p className="text-gray-700 leading-relaxed">
                We adopt reasonable security practices and procedures to protect your personal data from unauthorized 
                access, disclosure, loss or misuse. However, transmission of information over the internet cannot 
                always be guaranteed as completely secure. Users are responsible for ensuring the protection of 
                login and password records for their account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Deletion and Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                You have an option to delete your account by visiting your profile and settings on our Platform. 
                We retain your personal data for a period no longer than required for the purpose for which it was 
                collected or as required under applicable law. We may retain data if necessary to prevent fraud 
                or future abuse.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                You may access, rectify, and update your personal data directly through the functionalities 
                provided on the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Consent</h2>
              <p className="text-gray-700 leading-relaxed">
                By visiting our Platform or providing your information, you consent to the collection, use, storage, 
                disclosure and processing of your information in accordance with this Privacy Policy. You have an 
                option to withdraw your consent by writing to the Grievance Officer with "Withdrawal of consent for 
                processing personal data" in your subject line.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Company:</strong> Mamatiffin<br />
                  <strong>Address:</strong> Kolghatit, Hazaribagh, Jharkhand, India<br />
                  <strong>Email:</strong> mdkudratullah55@gmail.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;