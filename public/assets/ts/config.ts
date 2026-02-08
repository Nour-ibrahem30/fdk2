/**
 * Firebase Configuration
 * @description Configuration for Firebase services
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
  databaseURL: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: 'AIzaSyAU0CCiQNrPEYpTNU4rAwmOmPUZnjb2FoU',
  authDomain: 'a-platform-for-learning.firebaseapp.com',
  projectId: 'a-platform-for-learning',
  storageBucket: 'a-platform-for-learning.firebasestorage.app',
  messagingSenderId: '764579707883',
  appId: '1:764579707883:web:5456e2348354cc58fab7ae',
  measurementId: 'G-4P972FP416',
  databaseURL: 'https://a-platform-for-learning-default-rtdb.firebaseio.com'
};

/**
 * App Configuration
 */
export const appConfig = {
  name: 'منصة الفيلسوف التعليمية',
  description: 'منصة تعليمية متكاملة للأستاذ محمد ناصر',
  version: '2.0.0',
  author: 'Mohammed Nasser - The Philosopher',
  supportEmail: 'support@philosopher-platform.com',
  siteUrl: 'https://philosopher-platform.com'
};

/**
 * SEO Configuration
 */
export const seoConfig = {
  defaultTitle: 'منصة الفيلسوف التعليمية - تعلم مع الأستاذ محمد ناصر',
  defaultDescription: 'منصة تعليمية متكاملة تقدم دروس فيديو، امتحانات تفاعلية، وملاحظات تعليمية من الأستاذ محمد ناصر الفيلسوف',
  defaultKeywords: 'تعليم، دروس، فيديوهات تعليمية، امتحانات، الفيلسوف، محمد ناصر، منصة تعليمية',
  ogImage: '/assets/images/og-image.jpg',
  twitterHandle: '@philosopher_edu'
};
