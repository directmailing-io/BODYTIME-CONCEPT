import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FileText, Video, Link as LinkIcon, ExternalLink, Download, FolderOpen } from 'lucide-react';

const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  pdf: {
    icon: <FileText className="h-5 w-5 text-red-500" />,
    label: 'Download',
    color: 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100',
  },
  video: {
    icon: <Video className="h-5 w-5 text-blue-500" />,
    label: 'Öffnen',
    color: 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100',
  },
  link: {
    icon: <LinkIcon className="h-5 w-5 text-green-500" />,
    label: 'Öffnen',
    color: 'bg-green-50 border-green-100 text-green-700 hover:bg-green-100',
  },
};

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

  const categories = Object.keys(grouped);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dokumente & Videos</h1>
        <p className="text-sm text-gray-500 mt-1">Schulungsmaterialien und wichtige Informationen.</p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <FolderOpen className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">Noch keine Dokumente verfügbar</p>
          <p className="text-xs text-gray-400 mt-1">Schau später wieder vorbei.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{category}</span>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">{grouped[category].length}</span>
              </div>

              {/* Document list */}
              <div className="space-y-2">
                {grouped[category].map((doc: any) => {
                  const url = doc.file_url || doc.video_url;
                  const config = typeConfig[doc.type] ?? typeConfig.link;
                  const isDownload = doc.type === 'pdf';
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      {/* Type icon */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        {config.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{doc.title}</p>
                        {doc.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{doc.description}</p>
                        )}
                      </div>

                      {/* Action button */}
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={[
                            'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors',
                            config.color,
                          ].join(' ')}
                        >
                          {isDownload ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                          <span className="hidden sm:inline">{config.label}</span>
                        </a>
                      )}
                    </div>
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
