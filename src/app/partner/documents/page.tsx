import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FileText, Video, Link as LinkIcon, ExternalLink, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function PartnerDocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: documents } = await supabase
    .from('bt_documents')
    .select('*')
    .eq('is_published', true)
    .not('title', 'like', '__setting:%')
    .order('created_at', { ascending: false });

  const grouped = (documents ?? []).reduce((acc: Record<string, any[]>, doc) => {
    const cat = doc.category ?? 'Allgemein';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  const typeIcons: Record<string, React.ReactNode> = {
    pdf: <FileText className="h-5 w-5 text-red-400" />,
    video: <Video className="h-5 w-5 text-blue-400" />,
    link: <LinkIcon className="h-5 w-5 text-green-400" />,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dokumente & Videos</h1>
        <p className="text-sm text-gray-500 mt-1">Schulungsmaterialien und wichtige Informationen.</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Noch keine Dokumente verfügbar.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, docs]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{category}</h2>
              <div className="grid gap-3">
                {docs.map((doc: any) => {
                  const url = doc.file_url || doc.video_url;
                  return (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4 flex items-center gap-4">
                        <div className="shrink-0 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                          {typeIcons[doc.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          {doc.description && <p className="text-sm text-gray-500 truncate">{doc.description}</p>}
                        </div>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {doc.type === 'pdf' ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                            {doc.type === 'pdf' ? 'Download' : 'Öffnen'}
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
