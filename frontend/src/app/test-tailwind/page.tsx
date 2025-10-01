export default function TestTailwind() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Tailwind CSS Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <p className="text-gray-700">This should have a gray border</p>
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">This should have a blue background</p>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">This should have a green background</p>
        </div>
      </div>
    </div>
  );
}
