import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Charts({ submissions = [] }) {
  // Group submissions by date for the last 7 days
  const groupSubmissionsByDate = () => {
    const last7Days = [];
    const today = new Date();
    
    // Create array of last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      last7Days.push({
        date: dateStr,
        dateObj: date,
        count: 0
      });
    }
    
    // Count submissions per day
    submissions.forEach(submission => {
      if (submission.createdAt) {
        const submissionDate = new Date(submission.createdAt);
        submissionDate.setHours(0, 0, 0, 0);
        
        const dayData = last7Days.find(day => {
          return day.dateObj.getTime() === submissionDate.getTime();
        });
        
        if (dayData) {
          dayData.count++;
        }
      }
    });
    
    return last7Days;
  };

  const chartData = groupSubmissionsByDate();
  const hasData = chartData.some(day => day.count > 0);

  if (!hasData && submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Submission Trends (Last 7 Days)</h3>
      <div className="w-full" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#888888"
              tick={{ fill: '#666' }}
            />
            <YAxis 
              stroke="#888888"
              tick={{ fill: '#666' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #ccc', 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#333' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', r: 5 }}
              activeDot={{ r: 7 }}
              name="Submissions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

