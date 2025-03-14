import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">About BookBite</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              At BookBite, we're passionate about connecting diners with the perfect dining experience. 
              Our restaurant reservation system is designed to make booking tables simple, fast, and 
              enjoyable for both customers and restaurant owners.
            </p>
            <p className="text-gray-600">
              We believe that technology should enhance the dining experience, not complicate it. 
              That's why we've created a streamlined platform that helps you secure the perfect table 
              for your special occasions or casual dining needs.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 rounded-full p-2 text-blue-600 font-semibold">1</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-800">Browse Available Tables</h3>
                  <p className="text-gray-600">
                    View our selection of tables with details on capacity and location.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 rounded-full p-2 text-blue-600 font-semibold">2</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-800">Choose Your Date and Time</h3>
                  <p className="text-gray-600">
                    Select when you'd like to dine with us, and we'll show you available options.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 rounded-full p-2 text-blue-600 font-semibold">3</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-800">Customize Your Experience</h3>
                  <p className="text-gray-600">
                    Add special requests or preferences to make your dining experience perfect.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 rounded-full p-2 text-blue-600 font-semibold">4</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-800">Instant Confirmation</h3>
                  <p className="text-gray-600">
                    Receive immediate confirmation of your reservation. No waiting, no phone calls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ready to Dine?</h2>
            <p className="text-gray-600 mb-6">
              Experience the convenience of BookBite by making your first reservation today!
            </p>
            <div className="text-center">
              <Link 
                href="/reservations/new" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium inline-block"
              >
                Make a Reservation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 