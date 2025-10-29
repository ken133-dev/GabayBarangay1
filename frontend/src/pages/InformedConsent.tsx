import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, FileText, Shield, Users, Clock } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function InformedConsent() {
  const [consentAgreed, setConsentAgreed] = useState(false);
  const navigate = useNavigate();

  const handleProceed = () => {
    if (consentAgreed) {
      navigate('/register/profile');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <ThemeToggle />
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Logo size="lg" showText />
          <h1 className="text-3xl font-bold mt-4 mb-2">Informed Consent</h1>
          <p className="text-muted-foreground">
            Please read and understand the following information before proceeding
          </p>
        </div>

        {/* Consent Form */}
        <Card className="border-2">
          <CardHeader className="text-center bg-primary/5">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              INFORMED CONSENT
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Research Details */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="font-semibold">Title of Research:</p>
              <p className="mb-2">Katipunan ng Kabataan Profiling (KK Profiling)</p>
              
              <p className="font-semibold">Consulting Agency:</p>
              <p>National Youth Commission (NYC)<br />Quezon City, Philippines</p>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  1. Purpose of the Study
                </h3>
                <p className="text-sm leading-relaxed">
                  The Profiling aims to gather information and data of the Katipunan ng Kabataan members. 
                  The information that will be gathered in the KK Profiling will be stored to the upcoming 
                  SK Portal and will only be used for the purpose of database management handled by the 
                  National Youth Commission.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  2. Terms and Duration of Participation
                </h3>
                <p className="text-sm leading-relaxed">
                  You are asked to join the study as a participant in the KK Profiling. The conduct of the 
                  profiling will take 2 to 3 hours per Barangay; the data will serve as an updated National 
                  database of the Katipunan ng Kabataan member in the Philippines.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  3. Risks/Confidentiality
                </h3>
                <p className="text-sm leading-relaxed">
                  Your participation in the study will be treated with utmost confidentiality. Any information 
                  collected from you will be used in the Database management. Also, your safety is our primary 
                  concern. The profiling ensures that there will be no risk to encounter during the process of 
                  data collection.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">4. Compensation</h3>
                <p className="text-sm leading-relaxed">
                  The activity is in accordance with RA No. 10742 and the policy/guidelines of the Department 
                  of Interior and Local Government and the National Youth Commission. There will be no monetary 
                  remuneration other than our sincerest gratitude for your time and effort. Your participation 
                  will be highly appreciated.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">5. Inquiries</h3>
                <p className="text-sm leading-relaxed mb-2">
                  If you have any question/s on the administration of the survey question or the study in 
                  general, please do not hesitate to contact the research proponent through the following 
                  information:
                </p>
                <p className="text-sm font-medium">
                  Official Facebook Page: Sangguniang Kabataan ng Barangay Binitayan
                </p>
              </div>
            </div>

            {/* Consent Agreement */}
            <div className="border-2 border-primary/20 bg-primary/5 p-6 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent_agreement"
                  checked={consentAgreed}
                  onCheckedChange={(checked) => setConsentAgreed(checked as boolean)}
                  className="mt-1"
                />
                <label 
                  htmlFor="consent_agreement" 
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  I have read and understood the above information. I voluntarily agree to participate 
                  in this study and give my consent for the collection and use of my personal information 
                  as described above.
                </label>
              </div>
            </div>

            {/* Proceed Button */}
            <div className="text-center pt-4">
              <Button
                onClick={handleProceed}
                disabled={!consentAgreed}
                size="lg"
                className="px-8"
              >
                Proceed to Profiling Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}