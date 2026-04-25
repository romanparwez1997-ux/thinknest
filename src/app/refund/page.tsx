export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose dark:prose-invert prose-blue">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Refund and Cancellation Policy</h1>
      
      <div className="space-y-6 text-gray-600 dark:text-gray-300">
        <p>Thank you for subscribing to ThinkNest. Please read our policy on refunds and cancellations carefully.</p>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">1. Digital Goods Non-Refundable</h3>
        <p>Due to the nature of digital educational content, <strong>all sales are final</strong>. Once a 30-Day Premium Pass is purchased and activated on your account, granting you immediate access to our proprietary video lectures and live classes, we cannot offer a refund.</p>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">2. Technical Malfunctions</h3>
        <p>In the rare event that a technical error on our end prevents you from accessing your purchased content for an extended period, please contact support within 48 hours. If our team cannot resolve the issue, we will issue a pro-rated refund or extend your pass duration at our discretion.</p>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">3. Cancellations</h3>
        <p>Our current system utilizes a manual 30-Day Pass. You will not be automatically charged at the end of the month. Therefore, no formal "cancellation" of a recurring subscription is required. If you do not wish to continue studying on ThinkNest, simply do not renew your pass when it expires.</p>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">4. Contacting Us</h3>
        <p>If you believe you have been charged in error, please immediately contact our billing department at <strong>support@thinknest.in</strong> with your order receipt.</p>
      </div>
    </div>
  );
}