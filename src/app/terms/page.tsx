export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose dark:prose-invert prose-blue">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Terms and Conditions</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-gray-600 dark:text-gray-300">
        <p>By accessing and using the ThinkNest platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">1. User Accounts</h3>
        <p>You must provide accurate and complete information when creating an account. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure. Sharing premium account access with multiple individuals is strictly prohibited and will result in immediate termination.</p>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">2. Intellectual Property</h3>
        <p>All video lectures, study materials, UI designs, and content provided on ThinkNest are the exclusive property of ThinkNest and its respective tutors. You may not download, screen-record, redistribute, or reproduce any content without explicit written consent.</p>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">3. Acceptable Use</h3>
        <p>Students participating in live classes or community forums must maintain a respectful environment. Spam, harassment, or inappropriate behavior will lead to an immediate and permanent ban without a refund.</p>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">4. Governing Law</h3>
        <p>These terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.</p>
      </div>
    </div>
  );
}