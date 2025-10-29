import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
        </DialogHeader>
        <div className="h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">Last Updated: October 2025</p>
            
            <section>
              <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
              <p>By accessing and using Gabay Barangay Portal ("the Portal"), you accept and agree to be bound by these terms. This Portal is developed as a capstone project for Barangay Binitayan, Daraga, Albay, and is intended for community service purposes.</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. Description of Service</h3>
              <p>Gabay Barangay is a Progressive Web-Based Management System that provides:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Maternal health tracking and appointment scheduling</li>
                <li>Daycare education management and enrollment</li>
                <li>Sangguniang Kabataan (SK) event coordination</li>
                <li>Community announcements and notifications</li>
                <li>Digital certificate generation</li>
                <li>Health record management</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. User Responsibilities</h3>
              <p>As a user of the Portal, you agree to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the Portal only for lawful purposes related to barangay services</li>
                <li>Not attempt to disrupt or compromise the system's security</li>
                <li>Report any unauthorized access immediately</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Account Registration</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Users must register with valid personal information</li>
                <li>Barangay officials and staff accounts require verification</li>
                <li>Parents/guardians must provide accurate information for daycare enrollment</li>
                <li>Users are responsible for all activities under their account</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Service Limitations</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>This is a capstone project with no guaranteed uptime</li>
                <li>Service may be unavailable during maintenance periods</li>
                <li>Data backups are performed but not guaranteed</li>
                <li>Features may change during the academic development period</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Intellectual Property</h3>
              <p>All content, design, and code developed for Gabay Barangay are part of the academic capstone project and are owned by the development team and Barangay Binitayan.</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. Termination of Access</h3>
              <p>Barangay Binitayan reserves the right to suspend or terminate access to users who violate these terms or engage in harmful activities.</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">8. Limitation of Liability</h3>
              <p>As an academic project, Gabay Barangay is provided "as is" without warranties. The development team and Barangay Binitayan are not liable for any damages resulting from Portal use.</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">9. Governing Law</h3>
              <p>These terms are governed by the laws of the Republic of the Philippines and local ordinances of Barangay Binitayan, Daraga, Albay.</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">10. Changes to Terms</h3>
              <p>We may update these terms as the project evolves. Users will be notified of significant changes through the Portal announcements.</p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}