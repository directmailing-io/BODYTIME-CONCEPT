export default function AdminLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
      <div className="h-4 w-72 bg-gray-100 rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 h-24" />
        ))}
      </div>
      <div className="bg-white rounded-2xl h-64" />
    </div>
  );
}
