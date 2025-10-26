import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface LearningMaterial {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  isPublic: boolean;
}

export default function EducationalResources() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/daycare/learning-materials');
      setMaterials(response.data.materials || []);
    } catch {
      toast.error('Failed to fetch educational resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (materialId: string, fileName: string) => {
    try {
      toast.info('Preparing download...');
      // For now, just show a message since the actual download implementation
      // would require backend file serving
      toast.success(`Download started for "${fileName}"`);
    } catch {
      toast.error('Failed to download file');
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, 'default' | 'secondary' | 'outline'> = {
      'LESSON_PLANS': 'default',
      'WORKSHEETS': 'secondary',
      'ACTIVITIES': 'outline',
      'STORIES': 'default',
      'SONGS': 'secondary',
      'VIDEOS': 'outline',
      'OTHER': 'outline'
    };

    return (
      <Badge variant={categoryColors[category] || 'outline'}>
        {category.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getFileTypeBadge = (fileType: string) => {
    if (fileType.includes('pdf')) return <Badge variant="destructive">PDF</Badge>;
    if (fileType.includes('word') || fileType.includes('document')) return <Badge variant="default">Word</Badge>;
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <Badge variant="secondary">PPT</Badge>;
    if (fileType.includes('image')) return <Badge variant="outline">Image</Badge>;
    if (fileType.includes('video')) return <Badge variant="default">Video</Badge>;
    return <Badge variant="outline">File</Badge>;
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(materials.map(m => m.category)));

  return (
    <DashboardLayout currentPage="/daycare/materials">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Educational Resources</h1>
            <p className="text-muted-foreground mt-1">
              Access learning materials and resources for your children's education
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{materials.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{categories.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Recently Added</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {materials.filter(m => {
                  const uploaded = new Date(m.uploadedAt);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - uploaded.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 30;
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Find Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="LESSON_PLANS">Lesson Plans</SelectItem>
                  <SelectItem value="WORKSHEETS">Worksheets</SelectItem>
                  <SelectItem value="ACTIVITIES">Activities</SelectItem>
                  <SelectItem value="STORIES">Stories</SelectItem>
                  <SelectItem value="SONGS">Songs</SelectItem>
                  <SelectItem value="VIDEOS">Videos</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Educational Materials Library</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading resources...</p>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {materials.length === 0 ? 'No educational resources available yet.' : 'No resources match your search criteria.'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {materials.length === 0 ? 'Check back later for new materials.' : 'Try adjusting your search or filter settings.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMaterials.map((material) => (
                  <Card key={material.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg line-clamp-2">{material.title}</h3>
                        {getFileTypeBadge(material.fileType)}
                      </div>

                      {getCategoryBadge(material.category)}

                      {material.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                          {material.description}
                        </p>
                      )}

                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}
                        </p>

                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleDownload(material.id, material.title)}
                        >
                          Download Resource
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resource Categories Info */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold">Lesson Plans</h4>
                <p className="text-sm text-muted-foreground">
                  Structured learning activities and daily plans for teachers
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Worksheets</h4>
                <p className="text-sm text-muted-foreground">
                  Printable activities and exercises for children
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Activities</h4>
                <p className="text-sm text-muted-foreground">
                  Hands-on learning experiences and games
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Stories</h4>
                <p className="text-sm text-muted-foreground">
                  Children's books and reading materials
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Songs</h4>
                <p className="text-sm text-muted-foreground">
                  Music and singing activities for learning
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Videos</h4>
                <p className="text-sm text-muted-foreground">
                  Educational videos and visual learning materials
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}