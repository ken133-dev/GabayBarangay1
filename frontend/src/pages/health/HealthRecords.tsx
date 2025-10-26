import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Patient } from '@/types';

interface HealthRecord {
  id: string;
  patientId: string;
  patient?: Patient;
  recordDate: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  vital_signs?: any;
  notes?: string;
}

export default function HealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    medications: '',
    bloodPressure: '',
    temperature: '',
    heartRate: '',
    weight: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
    // fetchRecords(); // Will implement when backend endpoint is ready
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/health/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      toast.error('Failed to fetch patients');
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

    try {
      const vital_signs = {
        bloodPressure: formData.bloodPressure,
        temperature: formData.temperature,
        heartRate: formData.heartRate,
        weight: formData.weight
      };

      await api.post('/health/records', {
        patientId: selectedPatient,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        medications: formData.medications,
        vital_signs,
        notes: formData.notes
      });

      toast.success('Health record created successfully!');
      setShowDialog(false);
      setFormData({
        diagnosis: '',
        treatment: '',
        medications: '',
        bloodPressure: '',
        temperature: '',
        heartRate: '',
        weight: '',
        notes: ''
      });
      setSelectedPatient('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create health record');
    }
  };

  return (
    <DashboardLayout currentPage="/health/records">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Health Records</h1>
            <p className="text-gray-600 mt-1">Digital health records management</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            Add Health Record
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{records.length}</p>
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
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Health Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading records...</p>
            ) : records.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No health records yet.</p>
                <p className="text-sm text-gray-500 mt-2">Click "Add Health Record" to create the first record.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {record.patient?.firstName} {record.patient?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Date: {new Date(record.recordDate).toLocaleDateString()}
                        </p>
                        {record.diagnosis && (
                          <p className="text-sm mt-2">
                            <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                          </p>
                        )}
                        {record.treatment && (
                          <p className="text-sm">
                            <span className="font-medium">Treatment:</span> {record.treatment}
                          </p>
                        )}
                        {record.medications && (
                          <p className="text-sm">
                            <span className="font-medium">Medications:</span> {record.medications}
                          </p>
                        )}
                      </div>
                      <Badge>Record</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Health Record</DialogTitle>
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

              <div>
                <label className="text-sm font-medium">Diagnosis</label>
                <Input
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  placeholder="Enter diagnosis"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Treatment</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.treatment}
                  onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                  placeholder="Describe treatment plan"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Medications</label>
                <Input
                  value={formData.medications}
                  onChange={(e) => setFormData({...formData, medications: e.target.value})}
                  placeholder="List medications prescribed"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Vital Signs</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Blood Pressure</label>
                    <Input
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Temperature (°C)</label>
                    <Input
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                      placeholder="36.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Heart Rate (bpm)</label>
                    <Input
                      value={formData.heartRate}
                      onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                      placeholder="72"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Weight (kg)</label>
                    <Input
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="65"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional observations or notes"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Health Record</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
