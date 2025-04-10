import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // My Bookings
      myBookings: {
        title: 'My Bookings',
        bookSession: 'Book a Session',
        findMoreCoaches: 'Find More Coaches',
        noBookingsYet: "You don't have any bookings yet",
        browseCoaches: 'Browse our interview coaches and book your first session!',
        upcoming: 'Upcoming',
        past: 'Past',
        paymentHistory: 'Payment History',
        refreshBookings: 'Refresh Bookings',
        bookingsRefreshed: 'Bookings refreshed',
        noUpcomingBookings: "You don't have any upcoming bookings.",
        noPastBookings: "You don't have any past bookings.",
        viewAllPayments: 'View all your payments for sessions and packages',
        noPaymentHistory: "You don't have any payment history.",
        upcomingSessions: 'Upcoming Sessions',
        pastSessions: 'Past Sessions',
        bookNewSession: 'Book New Session',
        viewDetails: 'View Details',
        reschedule: 'Reschedule',
        cancel: 'Cancel',
        sessionType: 'Session Type',
        date: 'Date',
        time: 'Time',
        duration: 'Duration',
        coach: 'Coach',
        status: 'Status',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        completed: 'Completed',
        pending: 'Pending',
        joinSession: 'Join Session',
        feedback: 'Feedback',
        meetingLink: 'Meeting Link'
      }
    }
  },
  ar: {
    translation: {
      // My Bookings
      myBookings: {
        title: 'حجوزاتي',
        bookSession: 'حجز جلسة',
        findMoreCoaches: 'البحث عن المزيد من المدربين',
        noBookingsYet: "ليس لديك أي حجوزات حتى الآن",
        browseCoaches: 'تصفح مدربي المقابلات واحجز جلستك الأولى!',
        upcoming: 'القادمة',
        past: 'السابقة',
        paymentHistory: 'سجل المدفوعات',
        refreshBookings: 'تحديث الحجوزات',
        bookingsRefreshed: 'تم تحديث الحجوزات',
        noUpcomingBookings: "ليس لديك أي حجوزات قادمة.",
        noPastBookings: "ليس لديك أي حجوزات سابقة.",
        viewAllPayments: 'عرض جميع مدفوعاتك للجلسات والباقات',
        noPaymentHistory: "ليس لديك أي سجل مدفوعات.",
        upcomingSessions: 'الجلسات القادمة',
        pastSessions: 'الجلسات السابقة',
        bookNewSession: 'حجز جلسة جديدة',
        viewDetails: 'عرض التفاصيل',
        reschedule: 'إعادة جدولة',
        cancel: 'إلغاء',
        sessionType: 'نوع الجلسة',
        date: 'التاريخ',
        time: 'الوقت',
        duration: 'المدة',
        coach: 'المدرب',
        status: 'الحالة',
        confirmed: 'مؤكد',
        cancelled: 'ملغى',
        completed: 'مكتمل',
        pending: 'معلق',
        joinSession: 'الانضمام إلى الجلسة',
        feedback: 'التغذية الراجعة',
        meetingLink: 'رابط الاجتماع'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 