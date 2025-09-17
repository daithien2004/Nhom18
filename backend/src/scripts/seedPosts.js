import mongoose from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/zaloute';

async function seedPosts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Xóa dữ liệu cũ trong Post
    await Post.deleteMany({});
    console.log('🗑️ Đã xóa dữ liệu cũ trong Post');

    // Lấy danh sách user
    const users = await User.find({});
    if (users.length === 0) {
      console.log('⚠️ Chưa có user nào trong DB, hãy seed user trước!');
      process.exit(0);
    }

    // Tạo post mẫu
    const postsData = [
      {
        author: users[0]._id, // Alice
        content: 'Hôm nay là một ngày tuyệt vời 🌞',
        images: ['https://picsum.photos/600/400?random=11'],
        likes: [users[1]._id, users[2]._id], // Bob + Charlie
        shares: [users[3]._id], // David
        views: 120,
      },
      {
        author: users[1]._id, // Bob
        content: 'Vừa code xong một project mới 💻🔥',
        images: ['https://picsum.photos/600/400?random=12'],
        likes: [users[0]._id, users[4]._id],
        shares: [],
        views: 95,
      },
      {
        author: users[2]._id, // Charlie
        content: 'Cuối tuần đi trekking không anh em? 🏞️',
        images: ['https://picsum.photos/600/400?random=13'],
        likes: [users[0]._id, users[1]._id, users[3]._id],
        shares: [users[4]._id],
        views: 230,
      },
      {
        author: users[3]._id, // David
        content: 'Chụp được bức ảnh hoàng hôn đẹp quá 📸',
        images: ['https://picsum.photos/600/400?random=14'],
        likes: [users[2]._id],
        shares: [users[0]._id],
        views: 180,
      },
      {
        author: users[4]._id, // Eva
        content: 'Nấu ăn cuối tuần, ai ghé ăn chung không 🍲',
        images: ['https://picsum.photos/600/400?random=15'],
        likes: [users[0]._id, users[1]._id],
        shares: [],
        views: 145,
      },
    ];

    // Insert posts
    await Post.insertMany(postsData);
    console.log('🌱 Đã seed posts thành công!');

    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed posts:', err);
    process.exit(1);
  }
}

seedPosts();
