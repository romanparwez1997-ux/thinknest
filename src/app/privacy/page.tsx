export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose dark:prose-invert prose-blue">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
      
      <div className="space-y-6 text-gray-600 dark:text-gray-300">
        <p>At ThinkNest, we take your privacy seriously. This policy describes what personal information we collect and how we use it.</p>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">1. Information We Collect</h3>
        <p>When you register for an account, we collect your name, email address, and an encrypted password. We also collect usage data, such as which videos you watch and your progress in courses, to improve your learning experience.</p>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">2. Payment Information</h3>
        <p>We do not store your credit card details, UPI IDs, or sensitive banking information on our servers. All payments are processed securely through our verified payment gateway partner (Razorpay), which complies with PCI-DSS standards.</p>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">3. How We Use Your Data</h3>
        <p>We use your data to provide and maintain the service, notify you about changes to our platform, provide customer support, and monitor the usage of the service to fix technical issues.</p>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">4. Third-Party Sharing</h3>
        <p>We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners.</p>
      </div>
    </div>
  );
}