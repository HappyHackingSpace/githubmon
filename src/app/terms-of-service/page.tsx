import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
            <CardTitle className="text-3xl font-bold">
              Terms of Service
            </CardTitle>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using GitHubMon (&quot;the Service&quot;), you
                accept and agree to be bound by the terms and provision of this
                agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Description of Service
              </h2>
              <p>
                GitHubMon is a web application that provides analytics and
                monitoring tools for GitHub organizations and repositories. The
                Service uses the GitHub API to fetch and display publicly
                available data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. User Responsibilities
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You are responsible for maintaining the confidentiality of
                  your GitHub authentication credentials
                </li>
                <li>You agree to use the Service only for lawful purposes</li>
                <li>
                  You will not attempt to gain unauthorized access to any part
                  of the Service
                </li>
                <li>
                  You will not use the Service to violate GitHub&apos;s Terms of
                  Service
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. GitHub API Usage
              </h2>
              <p>
                This Service uses the GitHub API and is subject to GitHub&apos;s
                API rate limits and terms of use. By using this Service, you
                also agree to comply with GitHub&apos;s Terms of Service and API
                guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Data and Privacy
              </h2>
              <p>
                The Service only accesses publicly available GitHub data and
                basic profile information as authorized through GitHub OAuth. We
                do not store your GitHub access tokens or personal data on our
                servers. All authentication is handled securely through
                GitHub&apos;s OAuth system.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Limitation of Liability
              </h2>
              <p>
                The Service is provided &quot;as is&quot; without any
                warranties. We are not liable for any damages arising from the
                use of this Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Changes
                will be effective immediately upon posting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us through our GitHub repository.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
