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
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPatient, setFilterPatient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPatients();
    fetchVaccinations();
    fetchSchedule();
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
      const response = await api.get('/health/immunization-records');
      setVaccinations(response.data.immunizationRecords || []);
    } catch (error) {
      toast.error('Failed to fetch immunization records');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/health/immunization-schedule');
      setSchedule(response.data.schedule || []);
    } catch (error) {
      console.error('Failed to fetch immunization schedule:', error);
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

  const filteredVaccinations = vaccinations.filter(v => {
    const patientMatch = filterPatient === 'all' || v.patientId === filterPatient;
    const statusMatch = filterStatus === 'all' || getVaccinationStatus(v) === filterStatus;
    return patientMatch && statusMatch;
  });

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
            <p className="text-gray-600 mt-1">Monitor immunization schedules and due dates</p>
          </div>
          <Button onClick={() => window.location.href = '/health/records'}>
            Add Immunization Record
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
              <CardTitle>Immunization Schedule Tracking</CardTitle>
              <div className="flex gap-2 items-center">
                <Select value={filterPatient} onValueChange={setFilterPatient}>
                  <SelectTrigger className="w-[150px]">
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="due-soon">Due Soon</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
                <p className="text-muted-foreground">No immunization records match the filters.</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting the filters or add new immunization records.</p>
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


      </div>
    </DashboardLayout>
  );
}
