import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  TrendingUp, Wallet, Building2, ArrowUpRight, ArrowDownRight,
  Bell, FileCheck, Clock, ChevronRight, BarChart3, PieChart,
  Activity, MapPin, DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Cell } from 'recharts';

const InvestorDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/users/portfolio');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96">Loading...</div>;

  const chartData = data?.investments?.map((inv: any) => ({
    name: inv.property_title,
    value: inv.total_amount,
    roi: inv.roi_percentage
  })) || [];

  const COLORS = ['#0f172a', '#f59e0b', '#0ea5e9', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Portfolio Overview</h1>
          <p className="text-gray-500">Track your real estate investments and returns</p>
        </div>
        <Link to="/properties" className="btn-primary text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Browse Properties
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-navy-900 to-navy-800 text-white">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8 text-gold-400" />
            <span className="text-xs bg-white/10 px-2 py-1 rounded-full">Total Value</span>
          </div>
          <p className="text-3xl font-bold">₦{data?.totalValue?.toLocaleString() || '0'}</p>
          <p className="text-sm text-gray-400 mt-1">Across {data?.investments?.length || 0} properties</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Rental Yield</span>
          </div>
          <p className="text-3xl font-bold text-navy-900">₦{Math.round(data?.rentalIncome || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Accumulated rental income</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <PieChart className="w-8 h-8 text-primary-500" />
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Units Owned</span>
          </div>
          <p className="text-3xl font-bold text-navy-900">{data?.totalUnits || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Fractional units across portfolio</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-purple-500" />
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">Avg ROI</span>
          </div>
          <p className="text-3xl font-bold text-navy-900">
            {data?.investments?.length > 0
              ? (data.investments.reduce((sum: number, inv: any) => sum + inv.roi_percentage, 0) / data.investments.length).toFixed(1)
              : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Average annual return</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Portfolio Chart */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-bold text-navy-900 mb-6">Portfolio Allocation</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Investment']}
                />
                <Area type="monotone" dataKey="value" stroke="#0f172a" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No investments yet. <Link to="/properties" className="text-primary-600 ml-2 hover:underline">Browse properties</Link>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-navy-900 mb-6">Distribution</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <RePieChart.Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RePieChart.Pie>
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No data to display
            </div>
          )}
        </div>
      </div>

      {/* Investments List */}
      <div className="card">
        <h3 className="text-lg font-bold text-navy-900 mb-6">My Investments</h3>
        {data?.investments?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Property</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Units</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">ROI</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {data.investments.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-navy-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">{inv.property_title}</p>
                          <p className="text-xs text-gray-500 capitalize">{inv.property_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {inv.location}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-navy-900">{inv.units}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-navy-900">₦{inv.total_amount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-green-600">{inv.roi_percentage}%</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                        {inv.property_status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Link to={`/properties/${inv.property_id}`} className="text-primary-600 hover:text-primary-700">
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven't made any investments yet.</p>
            <Link to="/properties" className="btn-primary text-sm inline-flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Browse Properties
            </Link>
          </div>
        )}
      </div>

      {/* Notifications */}
      {data?.notifications?.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {data.notifications.slice(0, 5).map((notif: any) => (
              <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg ${notif.read ? 'bg-gray-50' : 'bg-primary-50'}`}>
                <Bell className={`w-5 h-5 mt-0.5 ${notif.read ? 'text-gray-400' : 'text-primary-600'}`} />
                <div>
                  <p className={`text-sm font-semibold ${notif.read ? 'text-gray-600' : 'text-navy-900'}`}>{notif.title}</p>
                  <p className="text-xs text-gray-500">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorDashboard;
