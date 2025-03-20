import Layout from '@/components/layout/Layout';

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              At LeaseTracker, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our lease management platform.
            </p>
            <p className="text-gray-700">
              Please read this privacy policy carefully. By using our service, you consent to the practices described in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-2">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Name and contact information</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Property and lease details</li>
              <li>Payment information</li>
            </ul>

            <h3 className="text-xl font-medium mb-2">2.2 Usage Data</h3>
            <p className="text-gray-700">
              We collect information about how you use our platform, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Log data and device information</li>
              <li>Usage patterns and preferences</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700 mt-2">
              Email: privacy@leasetracker.com<br />
              Address: 123 Privacy Street, Security City, SC 12345
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
} 