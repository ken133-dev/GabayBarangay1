import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Syringe,
  User,
  Activity,
  Shield,
  Info
} from 'lucide-react';

interface ImmunizationRecord {
  id: string;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  };
  vaccineName: string;
  vaccineType: string;
  manufacturer?: string;
  lotNumber?: string;
  dosage?: string;
  dateGiven: string;
  ageAtVaccination?: string;
  siteOfAdministration?: string;
  administeredBy: string;
  doseNumber?: number;
  nextDueDate?: string;
  batchNumber?: string;
  expirationDate?: string;
  adverseReactions?: string;
  notes?: string;
}

export default function MyHealthRecords() {
  const [records, setRecords] = useState<ImmunizationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRecords();
  }, []);

  const fetchMyRecords = async () => {
    try {
      const response = await api.get('/health/immunization-records/my');
      setRecords(response.data.immunizationRecords || []);
    } catch {
      toast.error('Failed to fetch your health records');
    } finally {
      setLoading(false);
    }
  };

  const getRecordStatus = (record: ImmunizationRecord) => {
    if (!record.nextDueDate) return 'completed';
    const today = new Date();
    const dueDate = new Date(record.nextDueDate);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 30) return 'due-soon';
    return 'scheduled';
  };

  const handleDownloadImmunizationCard = (record: ImmunizationRecord) => {
    // Create HTML template for immunization card
    const cardHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Immunization Card - ${record.patient?.firstName} ${record.patient?.lastName}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f8fafc;
            }
            .card {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              padding: 24px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 8px 0 0 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .content {
              padding: 32px;
            }
            .patient-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
              margin-bottom: 32px;
              padding-bottom: 24px;
              border-bottom: 2px solid #e5e7eb;
            }
            .info-group h3 {
              margin: 0 0 12px 0;
              color: #374151;
              font-size: 18px;
              font-weight: 600;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 8px 0;
            }
            .info-label {
              font-weight: 500;
              color: #6b7280;
            }
            .info-value {
              font-weight: 600;
              color: #111827;
            }
            .vaccination-details {
              background: #f9fafb;
              border-radius: 8px;
              padding: 24px;
              margin-bottom: 24px;
            }
            .vaccination-details h3 {
              margin: 0 0 16px 0;
              color: #374151;
              font-size: 20px;
              font-weight: 600;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-completed {
              background: #dcfce7;
              color: #166534;
            }
            .status-scheduled {
              background: #fef3c7;
              color: #92400e;
            }
            .status-overdue {
              background: #fee2e2;
              color: #991b1b;
            }
            .footer {
              background: #f9fafb;
              padding: 24px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 0;
              color: #6b7280;
              font-size: 14px;
            }
            .record-id {
              font-family: monospace;
              background: #f3f4f6;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
            }
            @media print {
              body { background: white; }
              .card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>🏥 Immunization Card</h1>
              <p>Barangay Health Services</p>
            </div>

            <div class="content">
              <div class="patient-info">
                <div class="info-group">
                  <h3>Patient Information</h3>
                  <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${record.patient?.firstName} ${record.patient?.lastName}</span>
                  </div>
                  ${record.patient?.dateOfBirth ? `
                    <div class="info-item">
                      <span class="info-label">Date of Birth:</span>
                      <span class="info-value">${new Date(record.patient.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  ` : ''}
                  <div class="info-item">
                    <span class="info-label">Record ID:</span>
                    <span class="info-value record-id">${record.id.slice(-8)}</span>
                  </div>
                </div>

                <div class="info-group">
                  <h3>Vaccination Details</h3>
                  <div class="info-item">
                    <span class="info-label">Vaccine:</span>
                    <span class="info-value">${record.vaccineName}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Type:</span>
                    <span class="info-value">${record.vaccineType}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Date Given:</span>
                    <span class="info-value">${new Date(record.dateGiven).toLocaleDateString()}</span>
                  </div>
                  ${record.doseNumber ? `
                    <div class="info-item">
                      <span class="info-label">Dose Number:</span>
                      <span class="info-value">${record.doseNumber}</span>
                    </div>
                  ` : ''}
                </div>
              </div>

              <div class="vaccination-details">
                <h3>Vaccination Information</h3>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                  ${record.ageAtVaccination ? `
                    <div class="info-item">
                      <span class="info-label">Age at Vaccination:</span>
                      <span class="info-value">${record.ageAtVaccination}</span>
                    </div>
                  ` : ''}
                  ${record.dosage ? `
                    <div class="info-item">
                      <span class="info-label">Dosage:</span>
                      <span class="info-value">${record.dosage}</span>
                    </div>
                  ` : ''}
                  ${record.siteOfAdministration ? `
                    <div class="info-item">
                      <span class="info-label">Site:</span>
                      <span class="info-value">${record.siteOfAdministration}</span>
                    </div>
                  ` : ''}
                  <div class="info-item">
                    <span class="info-label">Administered By:</span>
                    <span class="info-value">${record.administeredBy}</span>
                  </div>
                  ${record.manufacturer ? `
                    <div class="info-item">
                      <span class="info-label">Manufacturer:</span>
                      <span class="info-value">${record.manufacturer}</span>
                    </div>
                  ` : ''}
                  ${record.lotNumber ? `
                    <div class="info-item">
                      <span class="info-label">Lot Number:</span>
                      <span class="info-value">${record.lotNumber}</span>
                    </div>
                  ` : ''}
                </div>

                ${record.nextDueDate ? `
                  <div class="info-item" style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">
                    <span class="info-label">Next Due Date:</span>
                    <span class="info-value">${new Date(record.nextDueDate).toLocaleDateString()}</span>
                  </div>
                ` : ''}

                <div style="margin-top: 16px;">
                  <span class="status-badge status-${getRecordStatus(record).replace('due-soon', 'scheduled').replace('overdue', 'overdue').replace('completed', 'completed').replace('scheduled', 'scheduled')}">
                    ${getRecordStatus(record) === 'completed' ? 'Completed' :
                      getRecordStatus(record) === 'due-soon' ? 'Due Soon' :
                      getRecordStatus(record) === 'overdue' ? 'Overdue' : 'Scheduled'}
                  </span>
                </div>
              </div>

              ${record.adverseReactions ? `
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                  <h4 style="margin: 0 0 8px 0; color: #92400e; font-weight: 600;">⚠️ Adverse Reactions</h4>
                  <p style="margin: 0; color: #92400e;">${record.adverseReactions}</p>
                </div>
              ` : ''}

              ${record.notes ? `
                <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                  <h4 style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">📝 Notes</h4>
                  <p style="margin: 0; color: #1e40af;">${record.notes}</p>
                </div>
              ` : ''}
            </div>

            <div class="footer">
              <p>This immunization card is issued by Barangay Health Services</p>
              <p style="margin-top: 4px; font-size: 12px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a new window with the card
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(cardHtml);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        // Optionally close the window after printing
        // printWindow.close();
      };
    } else {
      toast.error('Unable to open print window. Please check your popup blocker.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      completed: { variant: 'default', label: 'Completed' },
      'due-soon': { variant: 'secondary', label: 'Due Soon' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      scheduled: { variant: 'outline', label: 'Scheduled' }
    };

    const config = statusConfig[status] || statusConfig.completed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    totalRecords: records.length,
    completedVaccinations: records.filter(r => !r.nextDueDate).length,
    upcomingVaccinations: records.filter(r => r.nextDueDate && new Date(r.nextDueDate) > new Date()).length,
    recentVaccinations: records.filter(r => {
      const recordDate = new Date(r.dateGiven);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - recordDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length
  };

  return (
    <DashboardLayout currentPage="/health/my-records">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Health Records</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              View your personal immunization history and vaccination records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Total Records
                </CardTitle>
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {stats.totalRecords}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Immunization records
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                  Completed
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {stats.completedVaccinations}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Fully vaccinated
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Upcoming
                </CardTitle>
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {stats.upcomingVaccinations}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Next doses due
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Recent
                </CardTitle>
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {stats.recentVaccinations}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Immunization Records */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Syringe className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">My Immunization History</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete vaccination records and upcoming doses
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Loading your health records...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No immunization records found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Your immunization records will appear here once they are added by healthcare providers.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {records.map((record) => (
                  <Card key={record.id} className="border-l-4 border-l-primary/20 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Syringe className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg text-foreground">
                              {record.vaccineName}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(record.dateGiven).toLocaleDateString()}
                            </div>
                            {record.doseNumber && (
                              <Badge variant="secondary" className="text-xs">
                                Dose #{record.doseNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {record.vaccineType}
                          </Badge>
                          {getStatusBadge(getRecordStatus(record))}
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Details Grid */}
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div className="space-y-3">
                          {record.ageAtVaccination && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Age at Vaccination:</span>
                              <span className="text-sm">{record.ageAtVaccination}</span>
                            </div>
                          )}
                          {record.dosage && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Dosage:</span>
                              <span className="text-sm">{record.dosage}</span>
                            </div>
                          )}
                          {record.siteOfAdministration && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Site:</span>
                              <span className="text-sm">{record.siteOfAdministration}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Administered By:</span>
                            <span className="text-sm">{record.administeredBy}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {record.manufacturer && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Manufacturer:</span>
                              <span className="text-sm">{record.manufacturer}</span>
                            </div>
                          )}
                          {record.lotNumber && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Lot Number:</span>
                              <span className="text-sm">{record.lotNumber}</span>
                            </div>
                          )}
                          {record.nextDueDate && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Next Due:</span>
                              <span className="text-sm">{new Date(record.nextDueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Adverse Reactions */}
                      {record.adverseReactions && (
                        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                              Adverse Reactions
                            </span>
                          </div>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            {record.adverseReactions}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Notes
                            </span>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {record.notes}
                          </p>
                        </div>
                      )}

                      <Separator className="my-4" />

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Record ID: {record.id.slice(-8)}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleDownloadImmunizationCard(record)}
                        >
                          <Download className="h-4 w-4" />
                          Download Immunization Card
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Information */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Understanding Your Records</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Immunization Records
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    These are your personal vaccination and health records maintained by barangay health workers.
                    Each record contains detailed information about your vaccinations and health status.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Status Indicators</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <Badge variant="default" className="mr-2">Completed</Badge>
                        <span className="text-sm text-muted-foreground">Vaccination completed, no further doses needed</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <div>
                        <Badge variant="secondary" className="mr-2">Due Soon</Badge>
                        <span className="text-sm text-muted-foreground">Next dose due within 30 days</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div>
                        <Badge variant="destructive" className="mr-2">Overdue</Badge>
                        <span className="text-sm text-muted-foreground">Next dose is past due</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <Badge variant="outline" className="mr-2">Scheduled</Badge>
                        <span className="text-sm text-muted-foreground">Future vaccination scheduled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Immunization Cards
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Download your immunization cards for official purposes, school requirements,
                    or travel documentation. Each card contains your complete vaccination history.
                  </p>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Need Help?
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact your barangay health worker if you have questions about your records or vaccination schedule.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Health Worker
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}