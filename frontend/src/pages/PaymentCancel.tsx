import { useNavigate } from 'react-router-dom';

export const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Warning Icon */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg
              className="h-10 w-10 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Payment Canceled
          </h2>
          <p className="mt-2 text-gray-600">
            Your payment was not completed. No charges have been made to your account.
          </p>
        </div>

        {/* Information */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            What happened?
          </h3>
          <p className="text-sm text-gray-600">
            You canceled the payment process or closed the checkout page. Your order has
            not been completed, and you have not been charged.
          </p>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Want to try again?
          </h3>
          <p className="text-sm text-blue-800">
            Your information is saved. You can return to complete your order anytime.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate('/builder')}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete My Order
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a
              href="mailto:support@eye-dentity.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
