import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/zaloute';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    console.log('🗑️ Đã xóa dữ liệu cũ trong User');

    const passwordHash = await bcrypt.hash('123456', 10);

    // Danh sách user mẫu
    const usersData = [
      {
        email: 'alice@example.com',
        password: passwordHash,
        phone: '0123456789',
        username: 'Alice',
        avatar: 'https://i.pravatar.cc/150?img=1',
        coverPhoto: 'https://picsum.photos/800/200?random=1',
        bio: 'Xin chào, mình là Alice',
        gender: 'female',
        birthday: new Date('1998-05-15'),
        isVerified: true,
        isOnline: true,
        lastActive: new Date(),
      },
      {
        email: 'bob@example.com',
        password: passwordHash,
        phone: '0987654321',
        username: 'Bob',
        avatar: 'https://i.pravatar.cc/150?img=2',
        coverPhoto: 'https://picsum.photos/800/200?random=2',
        bio: 'Thích code và âm nhạc',
        gender: 'male',
        birthday: new Date('1995-11-20'),
        isOnline: false,
        lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 phút trước
      },
      {
        email: 'charlie@example.com',
        password: passwordHash,
        phone: '0112233445',
        username: 'Charlie',
        avatar: 'https://i.pravatar.cc/150?img=3',
        coverPhoto: 'https://picsum.photos/800/200?random=3',
        bio: 'Yêu tự do và khám phá',
        gender: 'other',
        birthday: new Date('2000-07-01'),
        isOnline: false,
        lastActive: new Date(Date.now() - 1000 * 60 * 60), // 1h trước
      },
      {
        email: 'david@example.com',
        password: passwordHash,
        phone: '0223344556',
        username: 'David',
        avatar: 'https://i.pravatar.cc/150?img=4',
        coverPhoto: 'https://picsum.photos/800/200?random=4',
        bio: 'Nhiếp ảnh gia amateur',
        gender: 'male',
        birthday: new Date('1993-02-10'),
        isOnline: true,
        lastActive: new Date(),
      },
      {
        email: 'eva@example.com',
        password: passwordHash,
        phone: '0334455667',
        username: 'Eva',
        avatar: 'https://i.pravatar.cc/150?img=5',
        coverPhoto: 'https://picsum.photos/800/200?random=5',
        bio: 'Thích du lịch và nấu ăn',
        gender: 'female',
        birthday: new Date('1997-09-25'),
        isOnline: false,
        lastActive: new Date(Date.now() - 1000 * 60 * 10), // 10 phút trước
      },
    ];

    const createdUsers = await User.insertMany(usersData);
    console.log('🌱 Đã tạo users thành công');

    // Quan hệ bạn bè & lời mời kết bạn
    const [alice, bob, charlie, david] = createdUsers;

    // Alice và Bob là bạn bè
    alice.friends.push(bob._id);
    bob.friends.push(alice._id);
    await alice.save();
    await bob.save();

    // Charlie gửi lời mời kết bạn cho David
    david.friendRequests.push({
      from: charlie._id,
      status: 'pending',
    });
    await david.save();

    console.log('🤝 Đã thêm quan hệ bạn bè & lời mời kết bạn');

    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed:', err);
    process.exit(1);
  }
}

seed();
