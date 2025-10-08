import { useParams } from 'react-router-dom';

export default function TestRoute() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Route Working!</h1>
        <p className="text-gray-600">Route ID: {id}</p>
        <p className="text-sm text-gray-500 mt-2">This confirms the route is accessible</p>
      </div>
    </div>
  );
}
