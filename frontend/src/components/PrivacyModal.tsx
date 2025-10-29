import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <div className="h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">Last Updated: October 2025</p>
            
            <section>
              <h3 className="font-semibold mb-2">1. Information We Collect</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium">Personal Information:</h4>
                  <ul className="list-disc pl-6 mt-1 space-y-1">
                    <li>Name, address, and contact details</li>
                    <li>Date of birth and gender</li>
                    <li>Health information (for maternal and child health services)</li>
                    <li>Daycare enrollment information</li>
                    <li>SK event participation records</li>
                    <li>Account credentials</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Automatically Collected Information:</h4>
                  <ul className="list-disc pl-6 mt-1 space-y-1">
                    <li>Device information and browser type</li>
                    <li>IP address and approximate location</li>
                    <li>Usage patterns and feature interactions</li>
                    <li>Log data and error reports</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. How We Use Your Information</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium">Service Provision:</h4>
                  <ul className="list-disc pl-6 mt-1 space-y-1">
                    <li>Manage health appointments and vaccinations</li>
                    <li>Process daycare registrations and attendance</li>
                    <li>Coordinate SK events and activities</li>
                    <li>Send important notifications and updates</li>
                    <li>Generate certificates and reports</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Communication:</h4>
                  <ul className="list-disc pl-6 mt-1 space-y-1">
                    <li>Send OTP codes for account verification</li>
                    <li>Notify about barangay announcements</li>
                    <li>Provide service updates and reminders</li>
                    <li>Respond to user inquiries</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Information Sharing</h3>
              <div className="space-y-2">
                <p>We may share information with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Barangay Binitayan officials and authorized staff</li>
                  <li>Barangay Health Workers (BHWs) for health services</li>
                  <li>Daycare teachers and staff for education services</li>
                  <li>SK officials for youth program coordination</li>
                  <li>Academic advisers for project evaluation</li>
                </ul>
                <p className="mt-2">We do not:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Sell or rent personal information to third parties</li>
                  <li>Share data with external marketers</li>
                  <li>Disclose information without legal requirement</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Data Security</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium">Protection Measures:</h4>
                  <ul className="list-disc pl-6 mt-1 space-y-1">
                    <li>Role-based access control systems</li>
                    <li>Secure authentication protocols</li>
                    <li>Regular security updates</li>
                    <li>Data encryption in transit</li>
                    <li>Secure server infrastructure</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. User Rights</h3>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request account deletion</li>
                <li>Opt-out of non-essential communications</li>
                <li>Export your data where technically feasible</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Children's Privacy</h3>
              <div>
                <h4 className="font-medium">For Daycare Services:</h4>
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>Parent/guardian consent required for children's data</li>
                  <li>Limited data collection for educational purposes</li>
                  <li>Strict access controls for children's information</li>
                  <li>Compliance with Philippine child protection laws</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. Contact Information</h3>
              <p>For privacy concerns:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Barangay Binitayan Hall, Daraga, Albay</li>
                <li>Through the Portal's contact features</li>
                <li>Project development team via academic channels</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">8. Academic Project Disclaimer</h3>
              <p>Gabay Barangay is developed as a Bachelor of Science in Information Technology capstone project at STI College Legazpi. This privacy policy is designed for academic purposes and real-world implementations may require additional compliance measures.</p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}