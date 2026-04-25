export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose dark:prose-invert prose-blue">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">About ThinkNest</h1>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
        Welcome to ThinkNest, India's premier platform for competitive exam preparation. Our mission is to democratize high-quality education by connecting ambitious students with expert faculty. Whether you are aiming for JEE, NEET, or board exams, ThinkNest provides the structured learning environment, premium video lectures, and live doubt-solving sessions you need to succeed.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Contact Us</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        We are here to help! If you have any questions, technical issues, or partnership inquiries, please reach out to our support team.
      </p>

      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
        <ul className="space-y-4 text-gray-700 dark:text-gray-300">
          <li><strong>Email:</strong> support@thinknest.in <em>(Reply within 24 hours)</em></li>
          <li><strong>Phone:</strong> +91 98765 43210 <em>(Mon-Fri, 10 AM - 6 PM IST)</em></li>
          <li><strong>Operating Address:</strong> 123 Education Hub, Sector 4, Bengaluru, Karnataka, 560001, India</li>
        </ul>
      </div>
    </div>
  );
}