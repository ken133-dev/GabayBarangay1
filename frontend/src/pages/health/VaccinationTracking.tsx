import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Patient } from '@/types';

interface Vaccination {
  id: string;
  patientId: string;
  patient?: Patient;
  vaccineName: string;
  vaccineType: string;
  dosage?: string;
  dateGiven: string;
  nextDueDate?: string;
  administeredBy?: string;
  batchNumber?: string;
  notes?: string;
}

export default function VaccinationTracking() {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [filterPatient, setFilterPatient] = useState('all');
  const [formData, setFormData] = useState({
    vaccineName: '',
    vaccineType: '',
    dosage: '',
    dateGiven: '',
    nextDueDate: '',
    administeredBy: '',
    batchNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
    fetchVaccinations();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/health/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      toast.error('Failed to fetch patients');
    }
  };

  const fetchVaccinations = async () => {
    try {
      const response = await api.get('/health/vaccinations');
      setVaccinations(response.data.vaccinations || []);
    } catch (error) {
      toast.error('Failed to fetch vaccinations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    if (!formData.vaccineName || !formData.vaccineType || !formData.dateGiven) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/health/vaccinations', {
        patientId: selectedPatient,
        vaccineName: formData.vaccineName,
        vaccineType: formData.vaccineType,
        dosage: formData.dosage,
        dateGiven: formData.dateGiven,
        nextDueDate: formData.nextDueDate || null,
        administeredBy: formData.administeredBy,
        batchNumber: formData.batchNumber,
        notes: formData.notes
      });

      toast.success('Vaccination record added successfully!');
      setShowDialog(false);
      setFormData({
        vaccineName: '',
        vaccineType: '',
        dosage: '',
        dateGiven: '',
        nextDueDate: '',
        administeredBy: '',
        batchNumber: '',
        notes: ''
      });
      setSelectedPatient('');
      fetchVaccinations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add vaccination record');
    }
  };

  const getVaccinationStatus = (vaccination: Vaccination) => {
    if (!vaccination.nextDueDate) return 'completed';

    const today = new Date();
    const dueDate = new Date(vaccination.nextDueDate);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 30) return 'due-soon';
    return 'scheduled';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      completed: { variant: 'default', label: 'Completed' },
      scheduled: { variant: 'secondary', label: 'Scheduled' },
      'due-soon': { variant: 'outline', label: 'Due Soon' },
      overdue: { variant: 'destructive', label: 'Overdue' }
    };

    const config = statusConfig[status] || statusConfig.completed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredVaccinations = filterPatient && filterPatient !== 'all'
    ? vaccinations.filter(v => v.patientId === filterPatient)
    : vaccinations;

  const upcomingCount = vaccinations.filter(v => {
    const status = getVaccinationStatus(v);
    return status === 'due-soon' || status === 'overdue';
  }).length;

  return (
    <DashboardLayout currentPage="/health/vaccinations">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Vaccination Tracking</h1>
            <p className="text-gray-600 mt-1">Immunization schedule management</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            Record Vaccination
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Vaccinations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{vaccinations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Registered Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{patients.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Due/Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{upcomingCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Vaccination Records</CardTitle>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">Filter by patient:</span>
                <Select value={filterPatient} onValueChange={setFilterPatient}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All patients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All patients</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading vaccinations...</p>
            ) : filteredVaccinations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No vaccination records yet.</p>
                <p className="text-sm text-gray-500 mt-2">Click "Record Vaccination" to add the first record.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Vaccine Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Date Given</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Administered By</TableHead>
                      <TableHead>Batch No.</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVaccinations.map((vaccination) => (
                      <TableRow key={vaccination.id}>
                        <TableCell className="font-medium">
                          {vaccination.patient?.firstName} {vaccination.patient?.lastName}
                        </TableCell>
                        <TableCell>{vaccination.vaccineName}</TableCell>
                        <TableCell>{vaccination.vaccineType}</TableCell>
                        <TableCell>{vaccination.dosage || '-'}</TableCell>
                        <TableCell>
                          {new Date(vaccination.dateGiven).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {vaccination.nextDueDate
                            ? new Date(vaccination.nextDueDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>{vaccination.administeredBy || '-'}</TableCell>
                        <TableCell>{vaccination.batchNumber || '-'}</TableCell>
                        <TableCell>
                          {getStatusBadge(getVaccinationStatus(vaccination))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Vaccination</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Patient *</label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Vaccine Name *</label>
                  <Input
                    value={formData.vaccineName}
                    onChange={(e) => setFormData({...formData, vaccineName: e.target.value})}
                    placeholder="e.g., Measles-Mumps-Rubella (MMR)"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Vaccine Type *</label>
                  <Select
                    value={formData.vaccineType}
                    onValueChange={(value) => setFormData({...formData, vaccineType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BCG">BCG</SelectItem>
                      <SelectItem value="Hepatitis B">Hepatitis B</SelectItem>
                      <SelectItem value="DPT">DPT</SelectItem>
                      <SelectItem value="OPV">OPV (Polio)</SelectItem>
                      <SelectItem value="MMR">MMR</SelectItem>
                      <SelectItem value="Influenza">Influenza</SelectItem>
                      <SelectItem value="COVID-19">COVID-19</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Dosage</label>
                  <Input
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    placeholder="e.g., 0.5ml"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Batch Number</label>
                  <Input
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                    placeholder="Enter batch number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date Given *</label>
                  <Input
                    type="date"
                    value={formData.dateGiven}
                    onChange={(e) => setFormData({...formData, dateGiven: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Next Due Date</label>
                  <Input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Administered By</label>
                <Input
                  value={formData.administeredBy}
                  onChange={(e) => setFormData({...formData, administeredBy: e.target.value})}
                  placeholder="Enter healthcare provider name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any reactions, side effects, or additional observations"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Vaccination Record</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
