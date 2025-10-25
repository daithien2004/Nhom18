import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Category from '../models/Category.js';
import Activity from '../models/Activity.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/zaloute';

// Dữ liệu mẫu
const sampleUsers = [
  {
    email: 'admin@example.com',
    password: 'Admin@123',
    phone: '0901234567',
    username: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=1',
    coverPhoto: 'https://picsum.photos/1200/400?random=1',
    bio: 'System Administrator',
    gender: 'male',
    birthday: new Date('1990-01-01'),
    isVerified: true,
    isAdmin: true,
  },
  {
    email: 'john.doe@example.com',
    password: 'User@123',
    phone: '0901234568',
    username: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=2',
    coverPhoto: 'https://picsum.photos/1200/400?random=2',
    bio: 'Software Developer | Tech Enthusiast',
    gender: 'male',
    birthday: new Date('1995-05-15'),
    isVerified: true,
  },
  {
    email: 'jane.smith@example.com',
    password: 'User@123',
    phone: '0901234569',
    username: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=3',
    coverPhoto: 'https://picsum.photos/1200/400?random=3',
    bio: 'Designer | Creative Mind',
    gender: 'female',
    birthday: new Date('1998-08-20'),
    isVerified: true,
  },
  {
    email: 'mike.wilson@example.com',
    password: 'User@123',
    phone: '0901234570',
    username: 'Mike Wilson',
    avatar: 'https://i.pravatar.cc/150?img=4',
    coverPhoto: 'https://picsum.photos/1200/400?random=4',
    bio: 'Photographer | Travel Lover',
    gender: 'male',
    birthday: new Date('1992-03-10'),
    isVerified: false,
  },
  {
    email: 'sarah.johnson@example.com',
    password: 'User@123',
    phone: '0901234571',
    username: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    coverPhoto: 'https://picsum.photos/1200/400?random=5',
    bio: 'Marketing Manager | Coffee Addict',
    gender: 'female',
    birthday: new Date('1994-11-25'),
    isVerified: true,
  },
];

const samplePosts = [
  {
    content: 'Hello everyone! Excited to join this amazing community! 🎉',
    images: ['https://picsum.photos/800/600?random=10'],
  },
  {
    content: 'Just finished my new project. Check it out!',
    images: [
      'https://picsum.photos/800/600?random=11',
      'https://picsum.photos/800/600?random=12',
    ],
  },
  {
    content: 'Beautiful sunset today 🌅',
    images: ['https://picsum.photos/800/600?random=13'],
  },
  {
    content: 'Working on something exciting. Stay tuned! 💻',
    images: [],
  },
  {
    content: 'Coffee and code - the perfect combination ☕️',
    images: ['https://picsum.photos/800/600?random=14'],
  },
];

async function clearDatabase() {
  console.log('🗑️  Clearing database...');
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await Category.deleteMany({});
  await Activity.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({});
  await Notification.deleteMany({});
  await Report.deleteMany({});
  console.log('✅ Database cleared');
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  const users = [];

  for (const userData of sampleUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      isOnline: Math.random() > 0.5,
      lastActive: new Date(),
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedFriendships(users) {
  console.log('🤝 Seeding friendships...');

  // User 0 (admin) là bạn với tất cả
  for (let i = 1; i < users.length; i++) {
    users[0].friends.push(users[i]._id);
    users[i].friends.push(users[0]._id);
  }

  // User 1 và User 2 là bạn
  users[1].friends.push(users[2]._id);
  users[2].friends.push(users[1]._id);

  // User 3 gửi friend request cho User 4
  users[4].friendRequests.push({
    from: users[3]._id,
    status: 'pending',
  });

  // Save all users
  for (const user of users) {
    await user.save();
  }

  console.log('✅ Friendships created');
}

async function seedPosts(users) {
  console.log('📝 Seeding posts...');
  const posts = [];

  for (let i = 0; i < samplePosts.length; i++) {
    const post = await Post.create({
      author: users[i % users.length]._id,
      ...samplePosts[i],
      likes: [
        users[(i + 1) % users.length]._id,
        users[(i + 2) % users.length]._id,
      ],
      views: Math.floor(Math.random() * 100) + 10,
    });
    posts.push(post);
  }

  // Tạo shared post
  const sharedPost = await Post.create({
    author: users[2]._id,
    caption: 'Check out this amazing post!',
    sharedFrom: posts[0]._id,
  });
  posts.push(sharedPost);

  console.log(`✅ Created ${posts.length} posts`);
  return posts;
}

async function seedComments(users, posts) {
  console.log('💬 Seeding comments...');
  const comments = [];

  const sampleComments = [
    'Great post!',
    'Love this! 😍',
    'Amazing work!',
    'Thanks for sharing!',
    'This is awesome!',
    'Keep it up! 👍',
  ];

  for (const post of posts.slice(0, 3)) {
    for (let i = 0; i < 2; i++) {
      const comment = await Comment.create({
        postId: post._id,
        author: users[(i + 1) % users.length]._id,
        content:
          sampleComments[Math.floor(Math.random() * sampleComments.length)],
        likes: [users[(i + 2) % users.length]._id],
      });
      comments.push(comment);
      post.comments.push(comment._id);
    }
    await post.save();
  }

  console.log(`✅ Created ${comments.length} comments`);
  return comments;
}

async function seedCategories(users, posts) {
  console.log('📂 Seeding categories...');
  const categories = [];

  const categoryNames = ['Để xem sau', 'Công việc', 'Học tập', 'Yêu thích'];

  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < 2; j++) {
      const category = await Category.create({
        owner: users[i]._id,
        name: categoryNames[j],
        posts: [posts[j % posts.length]._id],
        isDefault: j === 0,
      });
      categories.push(category);
    }
  }

  console.log(`✅ Created ${categories.length} categories`);
  return categories;
}

async function seedActivities(users, posts, comments) {
  console.log('🎯 Seeding activities...');
  const activities = [];

  // Like activities
  for (let i = 0; i < 3; i++) {
    const post = posts[i];
    const activity = await Activity.create({
      actor: users[(i + 1) % users.length]._id,
      post: post._id,
      postOwner: post.author,
      type: 'like',
    });
    activities.push(activity);
  }

  // Comment activities
  for (let i = 0; i < Math.min(3, comments.length); i++) {
    const comment = comments[i];
    const post = posts.find((p) => p._id.equals(comment.postId));
    const activity = await Activity.create({
      actor: comment.author,
      post: comment.postId,
      postOwner: post.author,
      type: 'comment',
      comment: comment._id,
    });
    activities.push(activity);
  }

  console.log(`✅ Created ${activities.length} activities`);
  return activities;
}

async function seedConversations(users) {
  console.log('💬 Seeding conversations...');
  const conversations = [];

  // 1-on-1 conversation
  const conv1 = await Conversation.create({
    participants: [users[0]._id, users[1]._id],
    isGroup: false,
    status: 'active',
  });
  conversations.push(conv1);

  // Group conversation
  const conv2 = await Conversation.create({
    participants: [users[0]._id, users[1]._id, users[2]._id],
    isGroup: true,
    groupName: 'Team Chat',
    groupAvatar: 'https://i.pravatar.cc/150?img=99',
    status: 'active',
  });
  conversations.push(conv2);

  console.log(`✅ Created ${conversations.length} conversations`);
  return conversations;
}

async function seedMessages(users, conversations) {
  console.log('✉️  Seeding messages...');
  const messages = [];

  const sampleMessages = [
    'Hey! How are you?',
    "I'm good, thanks! How about you?",
    'Working on a new project',
    'That sounds exciting!',
    'Let me know if you need any help',
  ];

  for (const conversation of conversations) {
    for (let i = 0; i < 3; i++) {
      const message = await Message.create({
        conversationId: conversation._id,
        sender: conversation.participants[i % conversation.participants.length],
        text: sampleMessages[i],
        status: 'seen',
        readBy: conversation.participants,
      });
      messages.push(message);
      conversation.lastMessage = message._id;
    }
    await conversation.save();
  }

  console.log(`✅ Created ${messages.length} messages`);
  return messages;
}

async function seedNotifications(users, posts) {
  console.log('🔔 Seeding notifications...');
  const notifications = [];

  const notificationTypes = [
    { type: 'like', message: 'đã thích bài viết của bạn' },
    { type: 'comment', message: 'đã bình luận về bài viết của bạn' },
    { type: 'follow', message: 'đã bắt đầu theo dõi bạn' },
    { type: 'friend_request', message: 'đã gửi lời mời kết bạn' },
  ];

  for (let i = 0; i < 5; i++) {
    const notifType = notificationTypes[i % notificationTypes.length];
    const notification = await Notification.create({
      senderId: users[(i + 1) % users.length]._id,
      receiverId: users[i % users.length]._id,
      message: notifType.message,
      type: notifType.type,
      isRead: Math.random() > 0.5,
      metadata: {
        postId: posts[i % posts.length]._id,
      },
    });
    notifications.push(notification);
  }

  console.log(`✅ Created ${notifications.length} notifications`);
  return notifications;
}

async function seedReports(users, posts, comments) {
  console.log('🚨 Seeding reports...');
  const reports = [];

  // Report on post
  const report1 = await Report.create({
    reporter: users[1]._id,
    reportedPost: posts[2]._id,
    reportType: 'post',
    reason: 'spam',
    description: 'This post contains spam content',
    status: 'pending',
  });
  reports.push(report1);

  // Report on user
  const report2 = await Report.create({
    reporter: users[2]._id,
    reportedUser: users[3]._id,
    reportType: 'user',
    reason: 'harassment',
    description: 'Inappropriate behavior',
    status: 'reviewing',
  });
  reports.push(report2);

  console.log(`✅ Created ${reports.length} reports`);
  return reports;
}

async function seed() {
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await clearDatabase();

    // Seed data
    const users = await seedUsers();
    await seedFriendships(users);
    const posts = await seedPosts(users);
    const comments = await seedComments(users, posts);
    await seedCategories(users, posts);
    await seedActivities(users, posts, comments);
    const conversations = await seedConversations(users);
    await seedMessages(users, conversations);
    await seedNotifications(users, posts);
    await seedReports(users, posts, comments);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Posts: ${posts.length}`);
    console.log(`   Comments: ${comments.length}`);
    console.log(`   Conversations: ${conversations.length}`);
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@example.com / Admin@123');
    console.log('   User: john.doe@example.com / User@123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run seed
seed();
