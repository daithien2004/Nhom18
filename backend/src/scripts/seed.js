import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';
import Category from '../models/Category.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/zaloute';

// Dữ liệu mẫu
const sampleBios = [
  'Passionate about technology and innovation 🚀',
  'Coffee lover ☕ | Book enthusiast 📚 | Travel addict ✈️',
  'Creating memories, one photo at a time 📸',
  'Living life to the fullest 🌟',
  'Foodie | Gamer | Developer 💻',
  'Spreading positivity everywhere I go ✨',
  'Music is life 🎵 | Dog lover 🐕',
  'Adventure seeker | Nature lover 🌲',
  'Fitness enthusiast 💪 | Health advocate',
  'Artist at heart 🎨 | Creative soul',
];

const samplePostContents = [
  'Just finished an amazing workout session! Feeling energized 💪 #fitness #motivation',
  'Beautiful sunset today 🌅 What a perfect evening!',
  'Coffee and coding - my favorite combo ☕💻 #developerlife',
  'Excited to share my latest project with you all! What do you think?',
  'Weekend vibes! Time to relax and recharge 😊',
  'Grateful for all the amazing people in my life ❤️',
  'New recipe turned out great! Cooking is therapeutic 🍳',
  "Just booked my next adventure! Can't wait to explore ✈️",
  'Monday motivation: Start each day with a grateful heart 💫',
  'Game night with friends was epic! 🎮',
  "Reading this book and can't put it down 📖",
  'Productivity tip: Take breaks and stay hydrated! 💧',
  'The weather is perfect for a long walk 🚶‍♂️',
  'Learning something new every day keeps life interesting 🧠',
  'Home workout complete! No excuses 🏋️',
  'Fresh flowers always brighten up the day 🌸',
  "Throwback to last summer's beach trip 🏖️",
  'Movie night recommendation: just watched an amazing film! 🎬',
  'Sunday brunch hits different 🥞',
  'Celebrating small wins today! 🎉',
];

const sampleComments = [
  'This is amazing! 🔥',
  'Love this so much! ❤️',
  'Great post! Thanks for sharing',
  'Totally agree with you on this!',
  'Inspiring! Keep it up 💪',
  'Beautiful! 😍',
  'This made my day!',
  'Awesome work!',
  "Can't wait to see more!",
  'So cool! 🎉',
  'Interesting perspective!',
  'Thanks for the motivation!',
  'Amazing content as always!',
  'This is exactly what I needed today',
  "You're the best! 🌟",
];

const sampleMessages = [
  'Hey! How are you doing?',
  'Did you see the latest update?',
  "That's awesome! Congrats!",
  "Let's catch up soon!",
  'Thanks for your help earlier',
  'Have you tried the new feature?',
  'I completely agree with that',
  'What are you up to today?',
  'Looking forward to it!',
  'That sounds great!',
];

async function clearDatabase() {
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await Activity.deleteMany({});
  await Category.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({});
  await Notification.deleteMany({});
  await Report.deleteMany({});
  console.log('✅ Database cleared');
}

async function createUsers() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = [];

  // Tạo 1 admin
  users.push({
    email: 'admin@example.com',
    password: hashedPassword,
    username: 'Admin',
    phone: '+84900000000',
    avatar: `https://i.pravatar.cc/150?img=0`,
    bio: 'System Administrator',
    gender: 'other',
    birthday: new Date('1990-01-01'),
    isVerified: true,
    isAdmin: true,
    isOnline: true,
    friends: [],
    friendRequests: [],
  });

  // Tạo 50 users thường
  for (let i = 1; i <= 50; i++) {
    users.push({
      email: `user${i}@example.com`,
      password: hashedPassword,
      username: `User ${i}`,
      phone: `+8490000${String(i).padStart(4, '0')}`,
      avatar: `https://i.pravatar.cc/150?img=${i}`,
      bio: sampleBios[i % sampleBios.length],
      gender: ['male', 'female', 'other'][i % 3],
      birthday: new Date(1990 + (i % 20), i % 12, (i % 28) + 1),
      isVerified: i % 3 === 0,
      isOnline: i % 5 === 0,
      lastActive: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ),
      friends: [],
      friendRequests: [],
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
}

async function createFriendships(users) {
  // Tạo quan hệ bạn bè ngẫu nhiên
  for (let i = 0; i < users.length; i++) {
    const friendCount = Math.floor(Math.random() * 15) + 5; // 5-20 bạn
    const friendIds = [];

    for (let j = 0; j < friendCount; j++) {
      let randomIndex = Math.floor(Math.random() * users.length);
      while (randomIndex === i || friendIds.includes(users[randomIndex]._id)) {
        randomIndex = Math.floor(Math.random() * users.length);
      }
      friendIds.push(users[randomIndex]._id);
    }

    users[i].friends = friendIds;
    await users[i].save();
  }

  // Tạo friend requests
  for (let i = 0; i < 30; i++) {
    const fromUser = users[Math.floor(Math.random() * users.length)];
    const toUser = users[Math.floor(Math.random() * users.length)];

    if (
      fromUser._id.toString() !== toUser._id.toString() &&
      !toUser.friends.includes(fromUser._id)
    ) {
      toUser.friendRequests.push({
        from: fromUser._id,
        status: ['pending', 'accepted', 'rejected'][
          Math.floor(Math.random() * 3)
        ],
      });
      await toUser.save();
    }
  }

  console.log('✅ Created friendships and friend requests');
}

async function createPosts(users) {
  const posts = [];

  // Tạo 150 bài post
  for (let i = 0; i < 150; i++) {
    const author = users[Math.floor(Math.random() * users.length)];
    const imageCount = Math.floor(Math.random() * 4); // 0-3 ảnh
    const images = [];

    for (let j = 0; j < imageCount; j++) {
      images.push(`https://picsum.photos/800/600?random=${i * 10 + j}`);
    }

    posts.push({
      author: author._id,
      content: samplePostContents[i % samplePostContents.length],
      images,
      likes: [],
      comments: [],
      views: Math.floor(Math.random() * 500),
      shares: [],
      isHidden: Math.random() > 0.95,
      isDeleted: Math.random() > 0.98,
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ),
    });
  }

  const createdPosts = await Post.insertMany(posts);
  console.log(`✅ Created ${createdPosts.length} posts`);
  return createdPosts;
}

async function createSharePosts(users, posts) {
  const sharePosts = [];

  // Tạo 30 bài share
  for (let i = 0; i < 30; i++) {
    const author = users[Math.floor(Math.random() * users.length)];
    const originalPost = posts[Math.floor(Math.random() * posts.length)];

    sharePosts.push({
      author: author._id,
      caption: `Check this out! 👀`,
      sharedFrom: originalPost._id,
      likes: [],
      comments: [],
      views: Math.floor(Math.random() * 200),
      createdAt: new Date(
        Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000
      ),
    });
  }

  const createdSharePosts = await Post.insertMany(sharePosts);

  // Cập nhật shares cho bài gốc
  for (const sharePost of createdSharePosts) {
    await Post.findByIdAndUpdate(sharePost.sharedFrom, {
      $push: { shares: sharePost._id },
    });
  }

  console.log(`✅ Created ${createdSharePosts.length} shared posts`);
  return createdSharePosts;
}

async function createCommentsAndLikes(users, posts) {
  const comments = [];
  const activities = [];

  for (const post of posts) {
    // Thêm likes
    const likeCount = Math.floor(Math.random() * 30) + 5;
    const likers = [];

    for (let i = 0; i < likeCount; i++) {
      const liker = users[Math.floor(Math.random() * users.length)];
      if (!likers.includes(liker._id)) {
        likers.push(liker._id);

        // Tạo activity cho like
        activities.push({
          actor: liker._id,
          post: post._id,
          postOwner: post.author,
          type: 'like',
          createdAt: new Date(
            Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000
          ),
        });
      }
    }

    post.likes = likers;
    await post.save();

    // Thêm comments
    const commentCount = Math.floor(Math.random() * 15) + 2;

    for (let i = 0; i < commentCount; i++) {
      const commenter = users[Math.floor(Math.random() * users.length)];

      const comment = {
        postId: post._id,
        author: commenter._id,
        content:
          sampleComments[Math.floor(Math.random() * sampleComments.length)],
        likes: [],
        isHidden: Math.random() > 0.97,
        isDeleted: Math.random() > 0.99,
        createdAt: new Date(
          Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000
        ),
      };

      comments.push(comment);
    }
  }

  const createdComments = await Comment.insertMany(comments);

  // Cập nhật comments vào posts và tạo activities
  for (const comment of createdComments) {
    await Post.findByIdAndUpdate(comment.postId, {
      $push: { comments: comment._id },
    });

    activities.push({
      actor: comment.author,
      post: comment.postId,
      postOwner: (await Post.findById(comment.postId)).author,
      type: 'comment',
      comment: comment._id,
      createdAt: comment.createdAt,
    });

    // Thêm likes cho comments
    const commentLikeCount = Math.floor(Math.random() * 10);
    const commentLikers = [];

    for (let i = 0; i < commentLikeCount; i++) {
      const liker = users[Math.floor(Math.random() * users.length)];
      if (!commentLikers.includes(liker._id)) {
        commentLikers.push(liker._id);
      }
    }

    comment.likes = commentLikers;
    await comment.save();
  }

  await Activity.insertMany(activities);
  console.log(
    `✅ Created ${createdComments.length} comments and ${activities.length} activities`
  );
}

async function createCategories(users, posts) {
  const categories = [];

  for (const user of users.slice(0, 30)) {
    // Mỗi user có 2-4 categories
    const categoryCount = Math.floor(Math.random() * 3) + 2;
    const categoryNames = [
      'Để xem sau',
      'Yêu thích',
      'Công việc',
      'Học tập',
      'Du lịch',
      'Ẩm thực',
    ];

    for (let i = 0; i < categoryCount; i++) {
      const savedPosts = [];
      const postCount = Math.floor(Math.random() * 8) + 3;

      for (let j = 0; j < postCount; j++) {
        const randomPost = posts[Math.floor(Math.random() * posts.length)];
        if (!savedPosts.includes(randomPost._id)) {
          savedPosts.push(randomPost._id);
        }
      }

      categories.push({
        owner: user._id,
        name: categoryNames[i % categoryNames.length],
        posts: savedPosts,
        isDefault: i === 0,
        createdAt: new Date(
          Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
        ),
      });
    }
  }

  const createdCategories = await Category.insertMany(categories);
  console.log(`✅ Created ${createdCategories.length} categories`);
}

async function createConversationsAndMessages(users) {
  const conversations = [];
  const messages = [];

  // Tạo conversations từ quan hệ bạn bè
  const processedPairs = new Set();

  // 1. Tạo conversations cho những người đã là bạn (active) - TẤT CẢ ĐỀU ACTIVE
  for (const user of users) {
    // Lấy tất cả bạn bè để tạo conversation
    for (const friendId of user.friends) {
      const pairKey = [user._id.toString(), friendId.toString()]
        .sort()
        .join('-');

      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);

        conversations.push({
          participants: [user._id, friendId],
          isGroup: false,
          status: 'active', // Đã là bạn => TẤT CẢ ĐỀU ACTIVE
          createdAt: new Date(
            Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
          ),
        });
      }
    }
  }

  // 2. Tạo conversations pending cho những người chưa là bạn
  for (let i = 0; i < 15; i++) {
    const user1 = users[Math.floor(Math.random() * users.length)];
    let user2 = users[Math.floor(Math.random() * users.length)];

    while (
      user1._id.toString() === user2._id.toString() ||
      user1.friends.some((f) => f.toString() === user2._id.toString())
    ) {
      user2 = users[Math.floor(Math.random() * users.length)];
    }

    const pairKey = [user1._id.toString(), user2._id.toString()]
      .sort()
      .join('-');

    if (!processedPairs.has(pairKey)) {
      processedPairs.add(pairKey);

      conversations.push({
        participants: [user1._id, user2._id],
        isGroup: false,
        status: 'pending', // Chưa là bạn => pending
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      });
    }
  }

  // 3. Tạo group conversations (active - vì trong group đều là bạn bè)
  for (let i = 0; i < 10; i++) {
    const groupOwner = users[Math.floor(Math.random() * users.length)];
    const groupSize = Math.floor(Math.random() * 4) + 3; // 3-6 người

    // Lấy bạn bè của owner để tạo group
    const groupMembers = [groupOwner._id];
    const availableFriends = [...groupOwner.friends];

    for (let j = 1; j < groupSize && availableFriends.length > 0; j++) {
      const randomIndex = Math.floor(Math.random() * availableFriends.length);
      groupMembers.push(availableFriends[randomIndex]);
      availableFriends.splice(randomIndex, 1);
    }

    if (groupMembers.length >= 3) {
      conversations.push({
        participants: groupMembers,
        isGroup: true,
        groupName: `Group ${i + 1}`,
        groupAvatar: `https://i.pravatar.cc/150?img=${i + 100}`,
        status: 'active',
        createdAt: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        ),
      });
    }
  }

  const createdConversations = await Conversation.insertMany(conversations);

  // Tạo messages cho mỗi conversation
  for (const conversation of createdConversations) {
    const messageCount = Math.floor(Math.random() * 25) + 10; // 10-35 messages
    const conversationMessages = [];

    for (let i = 0; i < messageCount; i++) {
      const sender =
        conversation.participants[
          Math.floor(Math.random() * conversation.participants.length)
        ];
      const hasAttachment = Math.random() > 0.8;
      const attachments = hasAttachment
        ? [`https://picsum.photos/400/300?random=${Math.random()}`]
        : [];

      conversationMessages.push({
        conversationId: conversation._id,
        sender,
        text: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
        attachments,
        status: ['sent', 'delivered', 'seen'][Math.floor(Math.random() * 3)],
        readBy: Math.random() > 0.5 ? [sender] : [],
        createdAt: new Date(
          conversation.createdAt.getTime() + i * 60 * 60 * 1000
        ),
      });
    }

    const createdMessages = await Message.insertMany(conversationMessages);
    messages.push(...createdMessages);

    // Cập nhật lastMessage
    const lastMessage = createdMessages[createdMessages.length - 1];
    conversation.lastMessage = lastMessage._id;
    await conversation.save();
  }

  console.log(
    `✅ Created ${createdConversations.length} conversations and ${messages.length} messages`
  );
}

async function createNotifications(users, posts, comments, activities) {
  const notifications = [];

  // 1. Tạo notifications từ activities (like, comment)
  for (const activity of activities) {
    // Chỉ tạo notification nếu actor khác postOwner
    if (activity.actor.toString() !== activity.postOwner.toString()) {
      const sender = await User.findById(activity.actor);
      const post = await Post.findById(activity.post);

      if (sender && post) {
        let message = '';
        let metadata = { postId: activity.post };

        if (activity.type === 'like') {
          message = `${sender.username} liked your post`;
        } else if (activity.type === 'comment') {
          message = `${sender.username} commented on your post`;
          metadata.commentId = activity.comment;
        }

        notifications.push({
          senderId: activity.actor,
          receiverId: activity.postOwner,
          message,
          type: activity.type,
          metadata,
          isRead: Math.random() > 0.6, // 40% đã đọc
          createdAt: activity.createdAt,
        });
      }
    }
  }

  // 2. Tạo notifications cho friend requests
  for (const user of users) {
    for (const request of user.friendRequests) {
      const sender = await User.findById(request.from);
      if (sender) {
        if (request.status === 'pending') {
          // Notification cho lời mời kết bạn
          notifications.push({
            senderId: request.from,
            receiverId: user._id,
            message: `${sender.username} sent you a friend request`,
            type: 'friend_request',
            metadata: {},
            isRead: Math.random() > 0.7,
            createdAt: new Date(
              Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000
            ),
          });
        } else if (request.status === 'accepted') {
          // Notification cho việc chấp nhận kết bạn (người gửi lời mời nhận thông báo)
          notifications.push({
            senderId: user._id,
            receiverId: request.from,
            message: `${user.username} accepted your friend request`,
            type: 'friend_accept',
            metadata: {},
            isRead: Math.random() > 0.5,
            createdAt: new Date(
              Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000
            ),
          });
        }
      }
    }
  }

  // 3. Tạo notifications cho shares
  const sharedPosts = await Post.find({ sharedFrom: { $ne: null } }).populate(
    'author sharedFrom'
  );
  for (const sharePost of sharedPosts) {
    const originalPost = sharePost.sharedFrom;
    if (
      originalPost &&
      sharePost.author._id.toString() !== originalPost.author.toString()
    ) {
      const sharer = sharePost.author;

      notifications.push({
        senderId: sharer._id,
        receiverId: originalPost.author,
        message: `${sharer.username} shared your post`,
        type: 'share',
        metadata: {
          postId: originalPost._id,
          sharedPostId: sharePost._id,
        },
        isRead: Math.random() > 0.6,
        createdAt: sharePost.createdAt,
      });
    }
  }

  const createdNotifications = await Notification.insertMany(notifications);
  console.log(
    `✅ Created ${createdNotifications.length} notifications (synchronized with activities)`
  );
}

async function createReports(users, posts, comments) {
  const reports = [];
  const reasons = [
    'spam',
    'inappropriate_content',
    'harassment',
    'fake_information',
    'violence',
    'hate_speech',
    'other',
  ];
  const statuses = ['pending', 'reviewing', 'resolved', 'dismissed'];

  // Tạo 50 reports
  for (let i = 0; i < 50; i++) {
    const reporter = users[Math.floor(Math.random() * users.length)];
    const reportTypes = ['user', 'post', 'comment'];
    const reportType =
      reportTypes[Math.floor(Math.random() * reportTypes.length)];

    const report = {
      reporter: reporter._id,
      reportType,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      description: 'This content violates community guidelines.',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(
        Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
      ),
    };

    switch (reportType) {
      case 'user':
        report.reportedUser =
          users[Math.floor(Math.random() * users.length)]._id;
        break;
      case 'post':
        report.reportedPost =
          posts[Math.floor(Math.random() * posts.length)]._id;
        break;
      case 'comment':
        report.reportedComment =
          comments[Math.floor(Math.random() * comments.length)]._id;
        break;
    }

    if (report.status === 'resolved') {
      report.resolvedBy = users.find((u) => u.isAdmin)?._id;
      report.resolvedAt = new Date(
        report.createdAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000
      );
      report.adminNotes =
        'Issue has been reviewed and appropriate action taken.';
    }

    reports.push(report);
  }

  const createdReports = await Report.insertMany(reports);
  console.log(`✅ Created ${createdReports.length} reports`);
}

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    await clearDatabase();

    const users = await createUsers();
    await createFriendships(users);

    const posts = await createPosts(users);
    await createSharePosts(users, posts);
    await createCommentsAndLikes(users, posts);

    await createCategories(users, posts);
    await createConversationsAndMessages(users);

    const activities = await Activity.find();
    const comments = await Comment.find();
    await createNotifications(users, posts, comments, activities);

    await createReports(users, posts, comments);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Posts: ${await Post.countDocuments()}`);
    console.log(`- Comments: ${await Comment.countDocuments()}`);
    console.log(`- Activities: ${await Activity.countDocuments()}`);
    console.log(`- Categories: ${await Category.countDocuments()}`);
    console.log(`- Conversations: ${await Conversation.countDocuments()}`);
    console.log(`- Messages: ${await Message.countDocuments()}`);
    console.log(`- Notifications: ${await Notification.countDocuments()}`);
    console.log(`- Reports: ${await Report.countDocuments()}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();