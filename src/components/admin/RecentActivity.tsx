import React from 'react';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Aktivitas Terbaru
      </h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {activities.length === 0 ? (
          <ul className="divide-y divide-gray-200">
            <li className="px-6 py-4">
              <p className="text-sm text-gray-500">
                Belum ada aktivitas
              </p>
            </li>
          </ul>
        ) : (
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.timestamp}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {activity.type}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 