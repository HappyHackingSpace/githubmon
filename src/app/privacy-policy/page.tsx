import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/login">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p>
                GitHubMon only collects the minimum information necessary to provide our service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>GitHub Profile Information:</strong> Basic public profile data (username, name, email) through GitHub OAuth</li>
                <li><strong>Repository Data:</strong> Public repository information accessible through the GitHub API</li>
                <li><strong>Usage Data:</strong> Anonymous analytics about how the service is used (optional)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Information</h2>
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authenticate users through GitHub OAuth</li>
                <li>Display GitHub analytics and repository information</li>
                <li>Provide personalized dashboard experiences</li>
                <li>Improve the service based on usage patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
              <p>
                <strong>Local Storage:</strong> User preferences and session data are stored locally in your browser and never transmitted to our servers.
              </p>
              <p>
                <strong>Authentication:</strong> We use GitHub&apos;s OAuth system for secure authentication. We do not store your GitHub passwords or access tokens on our servers.
              </p>
              <p>
                <strong>GitHub API:</strong> All repository and user data is fetched directly from GitHub&apos;s public API using your authenticated session.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties. The only data sharing occurs:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With GitHub (through their OAuth and API systems)</li>
                <li>When required by law or to protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
              <p>
                We use essential cookies for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintaining your login session</li>
                <li>Storing user preferences (theme, settings)</li>
                <li>Ensuring proper functionality of the service</li>
              </ul>
              <p>
                We do not use tracking cookies or third-party analytics that compromise your privacy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your data stored in the service</li>
                <li>Delete your account and associated data</li>
                <li>Revoke GitHub OAuth access at any time</li>
                <li>Clear local storage data from your browser</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p>
                Since we don&apos;t store personal data on our servers, there is no data retention period. 
                All personal information exists only in your browser&apos;s local storage and your GitHub OAuth session.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify users of any material changes 
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through our GitHub repository 
                or by creating an issue in the project.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
