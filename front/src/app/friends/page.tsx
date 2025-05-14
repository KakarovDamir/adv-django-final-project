import FriendList from '../../components/FriendList';
import FriendRequests from '../../components/FriendRequests';

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-violet-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-violet-900 mb-2">Friends</h1>
          <p className="text-violet-600">Manage your connections and requests</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-violet-800 mb-4">Your Friends</h2>
            <FriendList />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-violet-800">Pending Requests</h2>
              <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm">
                3 new
              </span>
            </div>
            <FriendRequests />
          </div>
        </div>
      </div>
    </div>
  );
}