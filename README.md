# 🎓 LearnAI Hub

LearnAI Hub is a next-generation e-learning platform featuring a sleek ultra-modern UI, multi-role dashboards, and a deeply integrated, highly contextual AI assistant.

## ✨ The "Good Stuff" (Key Features)

- **🧠 Context-Aware AI Chatbot**: The crown jewel of the platform. The built-in AI assistant knows *exactly* which course you are currently taking and what material you are viewing. No need to over-explain your questions—just ask, and get hyper-relevant answers powered by the Gemini API. It even remembers your chat history!
- **🎨 Premium Glassmorphism UI**: A luxurious, modern design system featuring deep indigo dark-mode gradients (`from-indigo-900 to-indigo-950`), SVG tech-grid overlays, frosted glass components (`backdrop-blur-xl`), and buttery smooth hover physics.
- **🏅 Automated Smart Certificates**: Complete your course materials, ace the interactive quizzes, and instantly unlock dynamically generated, beautifully personalized PDF certificates to showcase your achievement.
- **👥 Triple-Role Ecosystem**: Highly secure, fully distinct dashboard experiences tailored specifically for **Students**, **Instructors**, and **Administrators** (including real-time system telemetry and moderation queues).
- **📚 Rich Course Content**: Seamlessly upload or embed PDFs, images, and YouTube videos. Instructors can build interactive quizzes, and the system firmly tracks student progress metrics.

---

## 📸 Showcase

### The Context-Aware AI Experience
*The bot instantly understands your course context and remembers your conversation.*
| AI Conversation | Intelligent Answers | AI Chat History |
|:---:|:---:|:---:|
| ![AI Conversation](./screenshots/chatbotconv.png) | ![AI Answers](./screenshots/chatbotanswer.png) | ![Chat History](./screenshots/chatbothistory.png) |

### Student Journey & Exploration
*A rich catalog to browse, enroll in, and consume high-quality course material.*
| Student Dashboard | Exploring Courses |
|:---:|:---:|
| ![Dashboard](./screenshots/studentdashboard.png) | ![Explore Courses](./screenshots/explorecourse.png) |

| Viewing Material | Finishing Material |
|:---:|:---:|
| ![Viewing Material](./screenshots/viewingcoursematerial.png) | ![Finishing Material](./screenshots/finishingmaterial.png) |

### Quizzes & Certification
*Test knowledge and generate personalized certificates of completion.*
| Taking a Quiz | Completing a Quiz |
|:---:|:---:|
| ![Taking a Quiz](./screenshots/takingquiz.png) | ![Completing a Quiz](./screenshots/completingquiz.png) |

**Achievement Unlocked:**
<p align="left">
  <img src="./screenshots/certifcateafterquiz.png" alt="Certificate of Completion" width="600"/>
</p>

### Instructor Command Center
*Dedicated spaces for instructors to manage their students and architect new courses.*
| Instructor Dashboard | Course Authoring |
|:---:|:---:|
| ![Instructor Dashboard](./screenshots/instructordashboard.png) | ![Instructor Courses](./screenshots/instructorcourses.png) |

### Platform Administration
*Complete system oversight, telemetry, and content moderation queues for admins.*
| Admin Dashboard | Course Moderation | Course Details Check |
|:---:|:---:|:---:|
| ![Admin Dashboard](./screenshots/admindashboard.png) | ![Admin Course Management](./screenshots/admincoursemanagement.png) | ![Admin Course Details](./screenshots/admincoursedetails.png) |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, Heroicons
- **Backend:** Next.js Serverless API Routes
- **Database:** MongoDB & Mongoose
- **Authentication:** Custom JWT-Auth & Google OAuth Provider
- **AI Integration:** Google Gemini API

## 🚀 Getting Started

### Requirements
- Node.js 18+
- MongoDB database (local or Atlas)
- Gemini API Key

### Installation

```bash
git clone https://github.com/yourusername/learnai-hub.git
cd learnai-hub
npm install
```

### Environment Variables
Create a `.env.local` file in your root directory and add the following:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Boot up
```bash
npm run dev
```