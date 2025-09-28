// import React, { useEffect, useState } from "react";
// import instance from "../api/axiosInstant";
// import { Heart, MessageCircle, Users, FileText } from "lucide-react";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from "recharts";

// interface StatisticsData {
//   totalLikes: number;
//   totalViews: number; // Thay đổi từ totalComments thành totalViews
//   totalFriends: number;
//   totalPosts: number;
//   likesByPost: any[];
// }

// const StatisticsPage: React.FC = () => {
//   const [stats, setStats] = useState<StatisticsData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await instance.get("/statistics");
//         setStats(response.data);
//       } catch (err: any) {
//         setError(err.response?.data?.message || err.message || "Có lỗi xảy ra");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="text-red-500 text-xl mb-4">⚠️</div>
//           <p className="text-red-600 mb-4">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//           >
//             Thử lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!stats) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p className="text-gray-600">Không có dữ liệu thống kê</p>
//       </div>
//     );
//   }

//   // Chuẩn bị dữ liệu cho biểu đồ
//   const chartData = [
//     { name: "Likes", value: stats.totalLikes },
//     { name: "Views", value: stats.totalViews }, // Thay đổi từ Comments thành Views
//     { name: "Friends", value: stats.totalFriends },
//     { name: "Posts", value: stats.totalPosts },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-8">
//       {/* Header */}
//       <div className="text-center">
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">
//           Thống Kê Cá Nhân
//         </h1>
//         <p className="text-gray-600">
//           Tổng quan về hoạt động của bạn trên mạng xã hội
//         </p>
//       </div>

//       {/* Thống kê tổng quan */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* Tổng lượt thích */}
//         <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-pink-100 text-sm font-medium">
//                 Tổng lượt thích
//               </p>
//               <p className="text-3xl font-bold">{stats.totalLikes}</p>
//             </div>
//             <Heart className="h-8 w-8 text-pink-200" />
//           </div>
//         </div>

//         {/* Tổng bài viết */}
//         <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-blue-100 text-sm font-medium">Tổng bài viết</p>
//               <p className="text-3xl font-bold">{stats.totalPosts}</p>
//             </div>
//             <FileText className="h-8 w-8 text-blue-200" />
//           </div>
//         </div>

//         {/* Tổng lượt xem */}
//         <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-green-100 text-sm font-medium">
//                 Tổng lượt xem
//               </p>
//               <p className="text-3xl font-bold">{stats.totalViews}</p>
//             </div>
//             <MessageCircle className="h-8 w-8 text-green-200" />
//           </div>
//         </div>

//         {/* Tổng bạn bè */}
//         <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-purple-100 text-sm font-medium">Tổng bạn bè</p>
//               <p className="text-3xl font-bold">{stats.totalFriends}</p>
//             </div>
//             <Users className="h-8 w-8 text-purple-200" />
//           </div>
//         </div>
//       </div>

//       {/* Biểu đồ thống kê */}
//       <div className="bg-white p-6 rounded-xl shadow-lg">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4">
//           Biểu đồ hoạt động
//         </h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={chartData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis allowDecimals={false} />
//             <Tooltip />
//             <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default StatisticsPage;
import React, { useEffect, useState } from "react";
import instance from "../api/axiosInstant";
import { Heart, MessageCircle, Users, FileText } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface StatisticsData {
  totalLikes: number;
  totalViews: number;
  totalFriends: number;
  totalPosts: number;
  likesByPost: { postId: string; content: string; likesCount: number }[];
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#8b5cf6"];

const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await instance.get("/statistics");
        setStats(response.data.data); // chú ý lấy response.data.data
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Đang tải...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Không có dữ liệu
      </div>
    );
  }

  // Dữ liệu biểu đồ tròn
  const pieData = [
    { name: "Likes", value: stats.totalLikes },
    { name: "Views", value: stats.totalViews },
    { name: "Friends", value: stats.totalFriends },
    { name: "Posts", value: stats.totalPosts },
  ];

  // Dữ liệu biểu đồ cột (likes theo post)
  const barData = stats.likesByPost.map((post) => ({
    name: post.content,
    likes: post.likesCount,
  }));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Thống Kê Cá Nhân
        </h1>
        <p className="text-gray-600">Tổng quan về hoạt động của bạn</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Tổng lượt thích</p>
              <p className="text-3xl font-bold">{stats.totalLikes}</p>
            </div>
            <Heart className="h-8 w-8 text-pink-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Tổng bài viết</p>
              <p className="text-3xl font-bold">{stats.totalPosts}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Tổng lượt xem</p>
              <p className="text-3xl font-bold">{stats.totalViews}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Tổng bạn bè</p>
              <p className="text-3xl font-bold">{stats.totalFriends}</p>
            </div>
            <Users className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ cột */}
        <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            Lượt thích theo bài viết
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="likes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ tròn */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Tỉ lệ tổng quan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
