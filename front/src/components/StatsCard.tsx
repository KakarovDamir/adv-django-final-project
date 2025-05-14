export default function StatsCard({ 
  title, 
  items 
}: { 
  title: string;
  items: { label: string; value: string | number }[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-semibold text-violet-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex justify-between items-center p-3 bg-violet-50 rounded-lg"
          >
            <span className="text-violet-600">{item.label}</span>
            <span className="text-violet-800 font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 